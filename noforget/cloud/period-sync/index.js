// cloud/period-sync/index.js
// 姨妈追踪云函数：免登录获取openid + 数据读写
const cloud = require('wx-server-sdk')
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db = cloud.database()
const COLLECTION = 'periodData'

// 云函数入口
exports.main = async (event, _context) => {
  const {action, data} = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID // 免鉴权获取用户唯一标识

  if (!openid) {
    return {success: false, error: '无法获取用户身份'}
  }

  try {
    switch (action) {

    // ─── 获取用户所有姨妈数据 ───
    case 'get': {
      const record = await db.collection(COLLECTION)
        .where({openid})
        .limit(1)
        .get()
      return {
        success: true,
        openid,
        data: record.data[0] || null
      }
    }

    // ─── 保存/更新姨妈数据（全量覆盖） ───
    case 'save': {
      if (!data) return {success: false, error: '无数据'}

      const existing = await db.collection(COLLECTION)
        .where({openid})
        .limit(1)
        .get()

      if (existing.data.length > 0) {
        // 更新已有记录
        await db.collection(COLLECTION)
          .doc(existing.data[0]._id)
          .update({
            data: {
              ...data,
              updatedAt: db.serverDate()
            }
          })
      } else {
        // 新建记录
        await db.collection(COLLECTION).add({
          data: {
            openid,
            ...data,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        })
      }
      return {success: true, openid}
    }

    // ─── 增量更新（只更新指定字段） ───
    case 'patch': {
      if (!data || Object.keys(data).length === 0) {
        return {success: false, error: '无更新字段'}
      }
      const existing = await db.collection(COLLECTION)
        .where({openid})
        .limit(1)
        .get()

      if (existing.data.length > 0) {
        await db.collection(COLLECTION)
          .doc(existing.data[0]._id)
          .update({
            data: {
              ...data,
              updatedAt: db.serverDate()
            }
          })
        return {success: true, openid}
      }

      await db.collection(COLLECTION).add({
        data: {
          openid,
          ...data,
          entries: data.entries || [],
          daily: data.daily || {},
          settings: data.settings || {},
          version: data.version || 1,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
      return {success: true, openid, created: true}
    }

    // ─── 获取openid（其他操作的认证凭证） ───
    case 'whoami': {
      return {success: true, openid}
    }

    default:
      return {success: false, error: `未知操作: ${action}`}
    }
  } catch (err) {
    console.error('period-sync error:', err)
    return {success: false, error: err.message || '服务器错误'}
  }
}
