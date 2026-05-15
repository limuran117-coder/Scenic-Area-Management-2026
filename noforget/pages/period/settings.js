// pages/period/settings.js
const period = require('../../utils/period.js')
const periodCloud = require('../../utils/periodCloud.js')

Page({
  data: {
    statusBarHeight: 20,
    totalTopHeight: 64,
    localSettings: {},
    remindDaysOptions: [1, 2, 3, 5, 7],
    remindDaysIndex: 2,
    cycleOptions: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    cycleIndex: 5,
    modes: [
      {key: 'normal', label: '正常模式', desc: '查看时间节点'},
      {key: 'caution', label: '谨慎模式', desc: '稍微提前提示重点阶段'}
    ],
    cloudEnabled: true,
    cloudOpenid: ''
  },

  onLoad() {
    try {
      const windowInfo = wx.getWindowInfo()
      const menuButton = wx.getMenuButtonBoundingClientRect()
      const statusBarHeight = windowInfo.statusBarHeight || 20
      const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
      this.setData({
        statusBarHeight,
        totalTopHeight: Math.round(statusBarHeight + navBarHeight)
      })
    } catch(e) {}
    this.loadSettings()
  },

  loadSettings() {
    const s = period.getSettings()
    const status = periodCloud.getStatus()
    this.setData({
      localSettings: s,
      remindDaysIndex: Math.max(0, this.data.remindDaysOptions.indexOf(s.remindBefore)),
      cycleIndex: Math.max(0, this.data.cycleOptions.indexOf(s.cycleLength)),
      cloudOpenid: status.openid || '',
      cloudEnabled: !!status.hasIdentity
    })
  },

  goBack() { const p = getCurrentPages(); if (p.length > 1) { wx.navigateBack() } else { wx.reLaunch({url: '/pages/index/index'}) } },

  toggleRemind(e) {
    wx.vibrateShort({type: 'medium'})
    const s = {...this.data.localSettings, remindEnabled: e.detail.value}
    period.saveSettings(s)
    this.setData({localSettings: s})
    periodCloud.scheduleSync(undefined, undefined, s)
  },

  onRemindDaysChange(e) {
    wx.vibrateShort({type: 'light'})
    const days = this.data.remindDaysOptions[e.detail.value]
    const s = {...this.data.localSettings, remindBefore: days}
    period.saveSettings(s)
    this.setData({localSettings: s})
    periodCloud.scheduleSync(undefined, undefined, s)
  },

  toggleRemindOnDay(e) {
    wx.vibrateShort({type: 'medium'})
    const s = {...this.data.localSettings, remindOnDay: e.detail.value}
    period.saveSettings(s)
    this.setData({localSettings: s})
    periodCloud.scheduleSync(undefined, undefined, s)
  },

  onCycleChange(e) {
    wx.vibrateShort({type: 'light'})
    const len = this.data.cycleOptions[e.detail.value]
    const s = {...this.data.localSettings, cycleLength: len}
    period.saveSettings(s)
    this.setData({localSettings: s})
    periodCloud.scheduleSync(undefined, undefined, s)
  },

  togglePin(e) {
    wx.vibrateShort({type: 'medium'})
    if (e.detail.value) {
      wx.showModal({
        title: '设置密码',
        editable: true,
        placeholderText: '请输入4位数字密码',
        success: (res) => {
          if (res.content && /^\d{4}$/.test(res.content)) {
            const s = {...this.data.localSettings, pinEnabled: true, pinCode: res.content}
            period.saveSettings(s)
            this.setData({localSettings: s})
            periodCloud.scheduleSync(undefined, undefined, s)
            wx.showToast({title: '密码已设置', icon: 'success'})
          } else if (res.confirm) {
            wx.showToast({title: '请输入4位数字', icon: 'none'})
          }
        }
      })
    } else {
      const s = {...this.data.localSettings, pinEnabled: false, pinCode: ''}
      period.saveSettings(s)
      this.setData({localSettings: s})
      periodCloud.scheduleSync(undefined, undefined, s)
    }
  },

  changePin() {
    wx.showModal({
      title: '修改密码',
      editable: true,
      placeholderText: '请输入新4位密码',
      success: (res) => {
        if (res.content && /^\d{4}$/.test(res.content)) {
          const s = {...this.data.localSettings, pinCode: res.content}
          period.saveSettings(s)
          this.setData({localSettings: s})
          periodCloud.scheduleSync(undefined, undefined, s)
          wx.showToast({title: '密码已修改', icon: 'success'})
        } else if (res.confirm) {
          wx.showToast({title: '请输入4位数字', icon: 'none'})
        }
      }
    })
  },

  changeMode(e) {
    const newMode = e.currentTarget.dataset.val
    if (this.data.localSettings.mode === newMode) return
    wx.vibrateShort({type: 'light'})
    const s = {...this.data.localSettings, mode: newMode}
    period.saveSettings(s)
    this.setData({localSettings: s})
    periodCloud.scheduleSync(undefined, undefined, s)
  },

  exportData() {
    const entries = period.getEntries()
    const daily = period.getDailyRecords()
    const settings = period.getSettings()
    const data = {entries, daily, settings, exportedAt: new Date().toISOString()}
    const json = JSON.stringify(data, null, 2)
    wx.setStorageSync('periodExportData', json)
    wx.showToast({title: '数据已准备，请截图保存', icon: 'none', duration: 3000})
  },

  toggleCloudSync(e) {
    if (!e.detail.value) {
      periodCloud.clearIdentity()
      this.setData({cloudEnabled: false, cloudOpenid: ''})
      wx.showToast({title: '已关闭云端同步', icon: 'none'})
    } else {
      wx.showLoading({title: '初始化云端...', mask: true})
      periodCloud.init()
        .then(async openid => {
          if (!openid) {
            this.setData({cloudEnabled: false})
            wx.showToast({title: '云端不可用', icon: 'none'})
            return
          }

          const cloudData = await periodCloud.downloadFromCloud()
          if (cloudData) {
            this.loadSettings()
          } else {
            const entries = period.getEntries()
            const daily = period.getDailyRecords()
            const settings = period.getSettings()
            await periodCloud.uploadToCloud(entries, daily, settings)
          }

          this.setData({cloudEnabled: true, cloudOpenid: openid})
          wx.showToast({title: '云端同步已开启', icon: 'success'})
        })
        .catch(() => {
          this.setData({cloudEnabled: false, cloudOpenid: ''})
          wx.showToast({title: '云端初始化失败', icon: 'none'})
        })
        .finally(() => {
          wx.hideLoading()
        })
    }
  },

  pullFromCloud() {
    wx.showLoading({title: '同步中...', mask: true})
    periodCloud.downloadFromCloud().then(data => {
      wx.hideLoading()
      if (data) {
        this.loadSettings()
        wx.showToast({title: '已从云端恢复', icon: 'success'})
      } else {
        wx.showToast({title: '云端无数据', icon: 'none'})
      }
    })
  },

  clearData() {
    wx.showModal({
      title: '确认清除',
      content: '此操作不可恢复，确定要清除所有姨妈追踪数据吗？',
      confirmColor: '#9B7EC6',
      success: async (res) => {
        if (res.confirm) {
          period.saveEntries([])
          wx.setStorageSync(period.STORAGE_KEYS.daily, {})
          wx.setStorageSync(period.STORAGE_KEYS.settings, {...period.DEFAULT_SETTINGS})
          try {
            await periodCloud.uploadToCloud([], {}, {...period.DEFAULT_SETTINGS})
          } catch (e) {}
          wx.showToast({title: '已清除', icon: 'success'})
          setTimeout(() => { wx.navigateBack() }, 1000)
        }
      }
    })
  }
})
