const ROUTES = {
  index: '/pages/index/index',
  mine: '/pages/mine/mine',
  add: '/pages/add/add'
}

Component({
  properties: {
    active: {type: String, value: 'index'}
  },

  methods: {
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab
      if (tab === 'add') {
        wx.navigateTo({url: ROUTES.add})
        return
      }

      if (ROUTES[tab]) {
        wx.switchTab({url: ROUTES[tab]})
      }
    }
  }
})
