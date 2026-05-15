// cloud/send-reminder/index.js
// 姨妈+纪念日订阅消息定时提醒云函数
// 触发规则：每天早上9:00检查所有订阅用户，发送姨妈提醒 + 纪念日倒计时提醒
const cloud = require('wx-server-sdk')
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database()
const COLLECTION = 'periodData'
const COUNTDOWN_COLLECTION = 'countdownItems'

// ─── 周期计算工具 ──────────────────────────────
function parseDateSafe(value) {
  if (!value) return null
  const normalized = String(value).replace(/\-/g, '/')
  const date = new Date(normalized)
  // ★ 修复：不再静默返回有效 Date，改用 null 表示无效
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(dateA, dateB) {
  const a = parseDateSafe(dateA)
  const b = parseDateSafe(dateB)
  if (!a || !b) return null
  return Math.floor(Math.abs(a - b) / (1000 * 60 * 60 * 24))
}

function getCycleIntervals(entries = []) {
  const sorted = entries
    .slice()
    .sort((a, b) => new Date(String(b.startDate).replace(/\-/g, '/')) - new Date(String(a.startDate).replace(/\-/g, '/')))

  const intervals = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const length = daysBetween(sorted[i].startDate, sorted[i + 1].startDate)
    if (!Number.isFinite(length) || length <= 0) continue
    intervals.push(length)
  }
  return {sorted, intervals}
}

function getPredictedNextPeriod(entries = [], settings = {}) {
  const {sorted, intervals} = getCycleIntervals(entries)
  if (!sorted.length) return null

  let cycleLength = Number(settings.cycleLength) || 28
  if (intervals.length > 0) {
    const recent = intervals.slice(0, Math.min(6, intervals.length))
    let avg = recent.reduce((sum, item) => sum + item, 0) / recent.length
    if (recent.length >= 3) {
      avg += (recent[0] - recent[1]) / recent.length
    }
    cycleLength = Math.round(avg)
  }

  cycleLength = Math.max(21, Math.min(35, cycleLength))
  const last = parseDateSafe(sorted[0].startDate)
  if (!last) return null
  const next = new Date(last)
  next.setDate(next.getDate() + cycleLength)
  return next
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDaysUntil(targetDate) {
  if (!targetDate) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  const diff = target - now
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function shouldSendReminder(daysLeft, settings = {}) {
  const remindEnabled = settings.remindEnabled !== false
  const remindOnDay = settings.remindOnDay !== false
  const remindDays = Number.isFinite(settings.remindBefore) ? settings.remindBefore : 1

  if (!remindEnabled) return false
  if (daysLeft === 0) return remindOnDay
  return daysLeft === remindDays
}

// ─── 发送订阅消息 ──────────────────────────────
async function sendPeriodReminder(openid, predictedDateStr, daysLeft) {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      template_id: 'L6aIoXgdKCQpd6wuR1VGYLzQLDZq6SsLlqDdffI8s7w',
      page: 'pages/period/period',
      data: {
        date1: {value: predictedDateStr},
        phrase2: {value: daysLeft === 0 ? '就是今天' : `还有${daysLeft}天`},
        thing3: {value: '姨妈快要来了，记得提前准备好哦'}
      }
    })
    console.log(`[${openid}] 姨妈提醒发送成功:`, result)
    return {success: true}
  } catch (err) {
    console.error(`[${openid}] 姨妈提醒发送失败:`, err)
    return {success: false, error: err.message}
  }
}

// ─── 纪念日提醒发送 ──────────────────────────────
async function sendCountdownReminder(openid, item, daysLeft) {
  const title = (item && item.title) || '纪念日'
  const targetDate = (item && item.targetDate) || ''
  // 纪念日提醒模板ID：优先从常量读取，暂无则跳过发消息只打印日志
  // TODO: 在 config/constant.js 中添加 COUNTDOWN 模板ID
  const COUNTDOWN_TEMPLATE_ID = '' // 预留，待配置

  if (!COUNTDOWN_TEMPLATE_ID) {
    console.log(`[${openid}] 纪念日「${title}」距${targetDate}还有${daysLeft}天 (模板ID未配置，跳过发送)`)
    return {success: false, error: 'template-not-configured', skipped: true}
  }

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      template_id: COUNTDOWN_TEMPLATE_ID,
      page: `/pages/detail/detail?id=${item.id || ''}`,
      data: {
        thing1: {value: title},
        date2: {value: targetDate},
        phrase3: {value: daysLeft === 0 ? '就是今天' : `还有${daysLeft}天`},
        thing4: {value: '别忘了这个重要的日子哦'}
      }
    })
    console.log(`[${openid}] 纪念日提醒「${title}」发送成功:`, result)
    return {success: true}
  } catch (err) {
    console.error(`[${openid}] 纪念日提醒「${title}」发送失败:`, err)
    return {success: false, error: err.message}
  }
}

async function listCountdownItems() {
  let query = db.collection(COUNTDOWN_COLLECTION)

  if (query && typeof query.limit === 'function') {
    return query.limit(500).get()
  }

  if (query && typeof query.where === 'function') {
    query = query.where({})
    if (query && typeof query.field === 'function') {
      query = query.field({_openid: true, id: true, title: true, targetDate: true, remindDays: true, categoryId: true})
    }
    if (query && typeof query.skip === 'function') {
      query = query.skip(0)
    }
    if (query && typeof query.limit === 'function') {
      query = query.limit(500)
    }
    if (query && typeof query.get === 'function') {
      return query.get()
    }
  }

  return {data: []}
}

// ─── 云函数入口 ──────────────────────────────
exports.main = async (_event, _context) => {
  const wxContext = cloud.getWXContext()
  const triggerdBy = wxContext.triggeredBy || 'scheduled'
  console.log(`[send-reminder] 触发来源: ${triggerdBy}, 时间: ${new Date().toISOString()}`)

  try {
    // 1. 分页查询所有已开启订阅的用户
    const allUsers = []
    let hasMore = true
    let skip = 0
    while (hasMore) {
      const {data: users} = await db.collection(COLLECTION)
        .where({subscribed: true})
        .field({openid: true, entries: true, settings: true})
        .skip(skip)
        .limit(100)
        .get()
      if (users && users.length > 0) {
        allUsers.push(...users)
        skip += users.length
      }
      hasMore = users && users.length >= 100
    }

    console.log(`[send-reminder] 共 ${allUsers.length} 位订阅用户`)

    if (allUsers.length === 0) {
      return {success: true, message: '无订阅用户'}
    }

    // 2. 遍历每个用户，检查是否需要提醒
    const results = []

    for (const user of allUsers) {
      const {openid, entries, settings = {}} = user

      if (!openid || !entries || entries.length === 0) continue

      // 从 entries 数组提取最近一次开始日期
      const remindDays = settings.remindBefore ?? 1

      // 计算下次姨妈日期
      const nextPeriod = getPredictedNextPeriod(entries, settings)
      if (!nextPeriod) continue

      // 计算距离天数
      const daysLeft = getDaysUntil(nextPeriod)
      if (daysLeft === null) continue

      console.log(`[${openid}] 下次: ${formatDate(nextPeriod)}, 剩余: ${daysLeft}天, 提醒阈值: ${remindDays}天`)

      // 3. 判断是否发送：当天 或 提前 N 天
      if (shouldSendReminder(daysLeft, settings)) {
        const predictedStr = formatDate(nextPeriod)
        const sendResult = await sendPeriodReminder(openid, predictedStr, daysLeft)
        results.push({openid, daysLeft, ...sendResult})
      } else {
        results.push({openid, daysLeft, skipped: true})
      }
    }

    // 3. 纪念日倒计时提醒
    let countdownSent = 0
    let countdownFailed = 0
    try {
      // ★ 修复：条件放宽，获取所有有提醒天数的项（remindDays 可能存在也可能不存在）
      const {data: countdownItems} = await listCountdownItems()

      if (countdownItems && countdownItems.length > 0) {
        console.log(`[send-reminder] 倒计时提醒: ${countdownItems.length} 个候选项`)
        for (const item of countdownItems) {
          // ★ 修复：必须有 _openid + remindDays 才处理
          if (!item._openid || item.remindDays === undefined || item.remindDays === null) continue
          const targetDate = parseDateSafe(item.targetDate)
          if (!targetDate) continue
          const daysLeft = getDaysUntil(targetDate)
          if (daysLeft === null || daysLeft < 0) continue
          const rd = Number(item.remindDays)
          if (!Number.isFinite(rd)) continue
          // remindDays=0 表示当天，N 表示提前 N 天
          if (daysLeft !== rd) continue

            // 倒计时提醒模板ID（与姨妈模板不同，需在微信后台配置）
            // 暂时使用 PERIOD 模板发送，后续可替换为专用模板
            try {
              await cloud.openapi.subscribeMessage.send({
                touser: item._openid,
                template_id: 'L6aIoXgdKCQpd6wuR1VGYLzQLDZq6SsLlqDdffI8s7w',
                page: 'pages/index/index',
                data: {
                  date1: {value: formatDate(targetDate)},
                  phrase2: {value: daysLeft === 0 ? '就是今天' : `还有${daysLeft}天`},
                  thing3: {value: `${item.title || '纪念日'} 要来啦`}
                }
              })
              countdownSent++
            } catch (e) {
              countdownFailed++
              console.error(`[send-reminder] 倒计时提醒发送失败 [${item._openid}]:`, e.message)
            }
          }
        }
    } catch (e) {
      console.error('[send-reminder] 倒计时提醒模块错误:', e.message)
    }

    // 4. 汇总结果
    const sent = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success && !r.skipped).length
    console.log(`[send-reminder] 完成: 发送${sent}条, 失败${failed}条`)

    return {
      success: true,
      total: allUsers.length,
      periodSent: sent,
      periodFailed: failed,
      countdownSent,
      countdownFailed,
      details: results.slice(0, 10)
    }

  } catch (err) {
    console.error('[send-reminder] 错误:', err)
    return {success: false, error: err.message}
  }
}
