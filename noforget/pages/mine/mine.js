// pages/mine/mine.js - 我的页面逻辑 v18
// 修复：头像改用微信原生 chooseAvatar API + 本地永久保存

const app = getApp()
const countdown = require('../../utils/countdown.js')
const categories = require('../../utils/categories.js')
const countdownStore = require('../../utils/countdownStore.js')

Page({
  data: {
    statusBarHeight: 20,
    userAvatar: '',
    nickName: '',
    theme: {},
    currentTheme: 'apple',
    stats: {total: 0, upcoming: 0, past: 0},
    formattedStats: {total: '0', upcoming: '0', past: '0'}
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo()
    const currentTheme = wx.getStorageSync('currentTheme') || 'apple'
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 20,
      currentTheme,
      theme: app.globalData.themes[currentTheme]
    })
  },

  onShow() {
    // 读取本地永久保存的头像
    const userAvatar = wx.getStorageSync('userAvatar') || ''
    const nickName = wx.getStorageSync('userNickName') || ''
    const currentTheme = wx.getStorageSync('currentTheme') || 'apple'

    this.setData({
      userAvatar,
      nickName,
      currentTheme,
      theme: app.globalData.themes[currentTheme]
    })

    this.loadStats()
  },

  // 🌟 用户选择头像后的回调（微信新规必须用 button open-type="chooseAvatar"）
  onChooseAvatar(e) {
    const tempPath = e.detail.avatarUrl
    const fs = wx.getFileSystemManager()
    const ext = tempPath.split('.').pop() || 'jpg'
    const permanentPath = `${wx.env.USER_DATA_PATH}/my_avatar_${Date.now()}.${ext}`

    fs.saveFile({
      tempFilePath: tempPath,
      filePath: permanentPath,
      success: (res) => {
        // 永久路径存入 Storage，下次打开依然在
        wx.setStorageSync('userAvatar', res.savedFilePath)
        this.setData({userAvatar: res.savedFilePath})
        wx.showToast({title: '头像已更新', icon: 'success'})
      },
      fail: (err) => {
        console.error('保存头像失败', err)
        wx.showToast({title: '保存失败', icon: 'error'})
      }
    })
  },

  // 清除头像
  clearAvatar() {
    wx.showModal({
      title: '清除头像',
      content: '确定要清除头像吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userAvatar')
          this.setData({userAvatar: ''})
          wx.showToast({title: '已清除', icon: 'success'})
        }
      }
    })
  },

  async loadStats() {
    try {
      const items = await countdownStore.getItems({refresh: true})
      const now = new Date()
      let upcoming = 0, past = 0

      items.forEach(item => {
        if (!item || !item.targetDate) return
        const itemData = {
          targetDate: item.targetDate,
          isRecurring: item.isRecurring ?? categories.isRecurringCategory(item.categoryId),
          startDate: item.startDate || item.targetDate,
          direction: item.direction
        }
        const main = countdown.getMainCountdown(itemData, now)
        main.isPast ? past++ : upcoming++
      })

      this.setData({
        stats: {total: items.length, upcoming, past},
        formattedStats: {
          total: this.formatNumber(items.length),
          upcoming: this.formatNumber(upcoming),
          past: this.formatNumber(past)
        }
      })
    } catch(err) { console.error('[loadStats] countdownStore failed:', err) }
  },

  async exportData() {
    wx.showModal({
      title: '导出数据',
      content: '数据将包含你的纪念日、姨妈追踪等隐私信息。导出后请妥善保管，不要分享给他人。',
      confirmText: '确认导出',
      cancelText: '取消',
      success: async (modalRes) => {
        if (!modalRes.confirm) return
        wx.showLoading({title: '准备中...'})
        const items = await countdownStore.getItems()
        if (items.length === 0) {
          wx.hideLoading()
          wx.showToast({title: '暂无数据', icon: 'none'})
          return
        }
        const jsonStr = JSON.stringify(items, null, 2)
        wx.setClipboardData({
          data: jsonStr,
          success: () => {
            wx.hideLoading()
            wx.showToast({title: '已复制到剪贴板', icon: 'success'})
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({title: '导出失败', icon: 'none'})
          }
        })
      }
    })
  },

  contactUs() {
    wx.showModal({
      title: '意见反馈',
      content: '嗨！我是 No Forget 的开发者。\n\n如果你在使用中遇到任何问题，或者有让它变得更好的奇思妙想，随时欢迎给我写信。\n\n我的邮箱：418883073@qq.com\n\n"代码有bug，但记录的爱与记忆永远完美。"',
      confirmText: '复制邮箱',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: '418883073@qq.com',
            success: () => {
              wx.showToast({title: '邮箱已复制', icon: 'success'})
            }
          })
        }
      }
    })
  },

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  showStatInfo(e) {
    const stat = e.currentTarget.dataset.stat
    const labels = {total: '总记录', upcoming: '即将到来', past: '已过纪念'}
    const descs = {
      total: '你创建的所有倒计时记录数量',
      upcoming: '还未到达的目标日期数量',
      past: '已超过目标日期的记录数量'
    }
    wx.showModal({title: labels[stat] + '说明', content: descs[stat], showCancel: false, confirmText: '知道了'})
  },

  switchTheme() {
    wx.showModal({
      title: '主题',
      content: '当前风格：《晨雾莫兰迪》\r\n更多主题正在开发中✨',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  goReminderSettings() {
    wx.navigateTo({
      url: '/pages/reminder/reminder'
    })
  },

  goAbout() {
    wx.showModal({
      title: '关于 No Forget',
      content: 'No Forget v1.0.0\n\n一款专注于重要日期记忆的小程序\n帮你记住每一个值得纪念的时刻 ❤️',
      showCancel: false,
      confirmText: '关闭'
    })
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.reLaunch({url: '/pages/index/index'})
    }
  }
})


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'No Forget - 别忘记重要日子',
      path: '/pages/index/index',
    }
  },

  onShareTimeline: function () {
    return {
      title: 'No Forget - 别忘记重要日子',
    }
  },

