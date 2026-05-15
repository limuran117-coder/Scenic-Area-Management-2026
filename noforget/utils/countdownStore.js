const STORAGE_KEY = 'countdownItems'
const PENDING_KEY = 'countdownPendingOps'
const RECENT_MUTATIONS_KEY = 'countdownRecentMutations'
const CLOUD_FUNCTION = 'countdown-sync'
let _cloudSyncDisabled = false
let _lastCloudCheck = 0
const CLOUD_CHECK_INTERVAL = 60000 // 60秒允许重试一次
const MUTATION_TTL = 60000

function hasCloudCapability() {
  return !!(wx.cloud && typeof wx.cloud.callFunction === 'function')
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isPeriodItem(item) {
  return !!item && item.categoryId === 'period'
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null
  const normalized = {...item}
  delete normalized._id
  delete normalized._openid
  return normalized
}

function sanitizeForCloud(item) {
  const normalized = normalizeItem(item)
  if (!normalized) return null
  return normalized
}

function readLocalItems() {
  const items = wx.getStorageSync(STORAGE_KEY)
  return Array.isArray(items) ? clone(items) : []
}

function writeLocalItems(items) {
  try {
    wx.setStorageSync(STORAGE_KEY, Array.isArray(items) ? clone(items) : [])
  } catch (e) {
    console.error('[countdownStore] writeLocalItems failed (storage full?):', e)
    wx.showToast({ title: '存储空间不足，请清理数据', icon: 'none' })
  }
}

function readPeriodEntries() {
  const entries = wx.getStorageSync('periodEntries')
  return Array.isArray(entries) ? clone(entries) : []
}

function seedPeriodEntryFromItem(item) {
  if (!item || !item.targetDate) return false
  const entries = readPeriodEntries()
  if (entries.length > 0) return false
  wx.setStorageSync('periodEntries', [{
    id: `${Date.now()}`,
    startDate: item.targetDate,
    cycleLength: null,
    createdAt: Date.now()
  }])
  return true
}

function normalizePeriodLocalState(items) {
  const list = Array.isArray(items) ? clone(items) : []
  const nonPeriodItems = list.filter(item => !isPeriodItem(item))
  const periodItems = list.filter(isPeriodItem)
  if (!periodItems.length) {
    return list
  }

  let periodEntries = readPeriodEntries()
  if (!periodEntries.length) {
    const seedSource = periodItems.find(item => item && item.targetDate) || null
    if (seedSource) {
      seedPeriodEntryFromItem(seedSource)
      periodEntries = readPeriodEntries()
    }
  }

  if (!periodEntries.length) {
    return nonPeriodItems
  }

  const latestEntry = periodEntries[0]
  const baseItem = periodItems.find(item => item && item.id === 'period-item')
    || periodItems.find(item => item && item.targetDate === latestEntry.startDate)
    || periodItems[0]

  const canonicalItem = {
    ...(baseItem || {}),
    id: 'period-item',
    title: (baseItem && baseItem.title) || '姨妈追踪',
    targetDate: latestEntry.startDate,
    categoryId: 'period',
    isPeriod: true,
    updatedAt: Date.now()
  }

  if (!canonicalItem.createdAt) {
    canonicalItem.createdAt = Date.now()
  }

  return [canonicalItem, ...nonPeriodItems]
}

function readPendingOps() {
  const ops = wx.getStorageSync(PENDING_KEY)
  return Array.isArray(ops) ? clone(ops) : []
}

function writePendingOps(ops) {
  wx.setStorageSync(PENDING_KEY, Array.isArray(ops) ? clone(ops) : [])
}

function readRecentMutations() {
  const mutations = wx.getStorageSync(RECENT_MUTATIONS_KEY)
  const list = Array.isArray(mutations) ? clone(mutations) : []
  const now = Date.now()
  const pruned = list.filter(item => item && item.id && item.type && now - item.timestamp < MUTATION_TTL)
  if (pruned.length !== list.length) {
    wx.setStorageSync(RECENT_MUTATIONS_KEY, pruned)
  }
  return pruned
}

function writeRecentMutations(mutations) {
  wx.setStorageSync(RECENT_MUTATIONS_KEY, Array.isArray(mutations) ? clone(mutations) : [])
}

function markRecentMutation(id, type) {
  if (!id || !type) return
  const mutations = readRecentMutations().filter(item => item.id !== id)
  mutations.unshift({
    id,
    type,
    timestamp: Date.now()
  })
  writeRecentMutations(mutations.slice(0, 100))
}

function pickPreferredItem(localItem, cloudItem, recentMutation) {
  if (!cloudItem) return localItem
  if (!localItem) return cloudItem
  if (recentMutation && recentMutation.type === 'upsert') return localItem

  const localUpdated = Number(localItem.updatedAt || localItem.createdAt || 0)
  const cloudUpdated = Number(cloudItem.updatedAt || cloudItem.createdAt || 0)
  if (localUpdated >= cloudUpdated) return localItem
  return cloudItem
}

function mergeCloudWithLocalPeriods(cloudItems, localItems) {
  const periodItems = (localItems || []).filter(isPeriodItem)
  const recentMutations = readRecentMutations()
  const recentMutationMap = new Map(recentMutations.map(item => [item.id, item]))
  const localMap = new Map(
    (localItems || [])
      .filter(item => item && !isPeriodItem(item))
      .map(item => [item.id, item])
  )
  const merged = []

  ;(cloudItems || [])
    .filter(item => item && !isPeriodItem(item))
    .forEach(cloudItem => {
      const recentMutation = recentMutationMap.get(cloudItem.id)
      if (recentMutation && recentMutation.type === 'delete') {
        localMap.delete(cloudItem.id)
        return
      }
      const localItem = localMap.get(cloudItem.id)
      merged.push(pickPreferredItem(localItem, cloudItem, recentMutation))
      localMap.delete(cloudItem.id)
    })

  localMap.forEach((localItem, id) => {
    const recentMutation = recentMutationMap.get(id)
    if (recentMutation && recentMutation.type === 'delete') return
    merged.push(localItem)
  })

  return [...periodItems, ...merged]
}

function upsertLocalItem(item) {
  const items = readLocalItems()
  const index = items.findIndex(existing => existing.id === item.id)
  if (index > -1) {
    items[index] = clone(item)
  } else {
    items.push(clone(item))
  }
  writeLocalItems(items)
  return items
}

function deleteLocalItem(id) {
  const items = readLocalItems().filter(item => item.id !== id)
  writeLocalItems(items)
  return items
}

function enqueuePendingOp(op) {
  const pending = readPendingOps()
  const withoutSameTarget = pending.filter(existing => {
    if (op.type === 'delete') return existing.id !== op.id
    return existing.id !== op.item.id
  })
  withoutSameTarget.push(op)
  writePendingOps(withoutSameTarget)
}

async function callCloud(action, data) {
  if (!hasCloudCapability()) throw new Error('cloud-function-unavailable')
  const now = Date.now()
  if (_cloudSyncDisabled && (now - _lastCloudCheck < CLOUD_CHECK_INTERVAL)) {
    throw new Error('cloud-function-unavailable')
  }
  if (_cloudSyncDisabled) {
    _cloudSyncDisabled = false
  }

  try {
    const res = await wx.cloud.callFunction({
      name: CLOUD_FUNCTION,
      data: {action, data}
    })
    const result = res && res.result ? res.result : null

    if (!result || !result.success) {
      throw new Error((result && result.error) || 'cloud-sync-failed')
    }

    return result
  } catch (error) {
    const message = (error && error.message) || ''
    if (
      message.includes('FUNCTION_NOT_FOUND') ||
      message.includes('FunctionName parameter could not be found')
    ) {
      _cloudSyncDisabled = true
      _lastCloudCheck = Date.now()
    }
    throw error
  }
}

async function listCloudItems() {
  if (!hasCloudCapability() || _cloudSyncDisabled) return []
  const result = await callCloud('list')
  return (Array.isArray(result.items) ? result.items : [])
    .map(normalizeItem)
    .filter(Boolean)
    .filter(item => !isPeriodItem(item))
}

async function upsertCloudItem(item) {
  if (!hasCloudCapability() || _cloudSyncDisabled) throw new Error('cloud-function-unavailable')
  if (isPeriodItem(item)) return item

  const payload = sanitizeForCloud(item)
  await callCloud('upsert', {item: payload})
  return payload
}

async function deleteCloudItem(id) {
  if (!hasCloudCapability() || _cloudSyncDisabled) throw new Error('cloud-function-unavailable')
  await callCloud('delete', {id})
}

async function flushPendingOps() {
  const pending = readPendingOps()
  if (!pending.length || !hasCloudCapability() || _cloudSyncDisabled) return false

  const remaining = []
  for (const op of pending) {
    try {
      if (op.type === 'upsert' && op.item) {
        await upsertCloudItem(op.item)
      } else if (op.type === 'delete' && op.id) {
        await deleteCloudItem(op.id)
      }
    } catch (error) {
      remaining.push(op)
    }
  }

  writePendingOps(remaining)
  return remaining.length === 0
}

async function syncFromCloud() {
  if (!hasCloudCapability() || _cloudSyncDisabled) return readLocalItems()

  try {
    await flushPendingOps()
    const localItems = readLocalItems()
    const cloudItems = await listCloudItems()
    const merged = normalizePeriodLocalState(mergeCloudWithLocalPeriods(cloudItems, localItems))
    writeLocalItems(merged)
    return merged
  } catch (error) {
    const normalized = normalizePeriodLocalState(readLocalItems())
    writeLocalItems(normalized)
    return normalized
  }
}

async function getItems(options = {}) {
  const {refresh = false} = options
  if (refresh && hasCloudCapability() && !_cloudSyncDisabled) {
    try {
      return await syncFromCloud()
    } catch (error) {
      // 刷新失败时降级到本地缓存
    }
  }
  const normalized = normalizePeriodLocalState(readLocalItems())
  writeLocalItems(normalized)
  return normalized
}

async function saveItem(item) {
  const normalized = normalizeItem(item)
  const localItems = upsertLocalItem(normalized)
  markRecentMutation(normalized && normalized.id, 'upsert')

  if (isPeriodItem(normalized)) {
    return {items: localItems, synced: true, mode: 'local-period'}
  }

  if (!hasCloudCapability() || _cloudSyncDisabled) {
    enqueuePendingOp({type: 'upsert', item: normalized})
    return {items: localItems, synced: false, mode: 'offline-cache'}
  }

  try {
    await flushPendingOps()
    await upsertCloudItem(normalized)
    // 不要在这里调用 syncFromCloud()！
    // syncFromCloud 会从云端读，但云端还没收到刚才的写入，返回空数组后
    // writeLocalItems([]) 会把本地刚刚写入的数据覆盖掉！
    // 直接返回 upsertLocalItem 写入后的本地数据即可
    return {items: localItems, synced: true, mode: 'cloud'}
  } catch (error) {
    enqueuePendingOp({type: 'upsert', item: normalized})
    return {items: localItems, synced: false, mode: 'queued'}
  }
}

async function removeItem(id) {
  const existingItems = readLocalItems()
  const removed = existingItems.find(item => item.id === id) || null
  const localItems = deleteLocalItem(id)
  markRecentMutation(id, 'delete')

  if (removed && isPeriodItem(removed)) {
    return {items: localItems, synced: true, mode: 'local-period'}
  }

  if (!hasCloudCapability() || _cloudSyncDisabled) {
    enqueuePendingOp({type: 'delete', id})
    return {items: localItems, synced: false, mode: 'offline-cache'}
  }

  try {
    await flushPendingOps()
    await deleteCloudItem(id)
    // 不要调用 syncFromCloud()，原因同上——云端还没收到删除，返回的 merged 可能丢失本地数据
    return {items: localItems, synced: true, mode: 'cloud'}
  } catch (error) {
    enqueuePendingOp({type: 'delete', id})
    return {items: localItems, synced: false, mode: 'queued'}
  }
}

async function bootstrapSync() {
  if (!hasCloudCapability() || _cloudSyncDisabled) return readLocalItems()
  return await syncFromCloud()
}

module.exports = {
  getItems,
  saveItem,
  removeItem,
  bootstrapSync,
  flushPendingOps,
  readLocalItems
}
