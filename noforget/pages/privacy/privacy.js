// pages/privacy/privacy.js
Page({
  data: {
    statusBarHeight: 20,
    totalTopHeight: 64
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
