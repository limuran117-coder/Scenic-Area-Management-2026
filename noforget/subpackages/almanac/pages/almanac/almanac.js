// pages/almanac/almanac.js - 现代每日黄历

const {buildAlmanac} = require('../../../../utils/almanac.js')

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    totalTopHeight: 64,
    almanac: null,
    historyLoading: true,
    fortuneState: 0,
    fortuneResult: null
  },

  onLoad() {
    this.initNavigation()
    this.refreshAlmanac()
  },

  initNavigation() {
    try {
      const windowInfo = wx.getWindowInfo()
      const menuButton = wx.getMenuButtonBoundingClientRect()
      const statusBarHeight = windowInfo.statusBarHeight || 20
      const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
      this.setData({
        statusBarHeight,
        navBarHeight: Math.round(navBarHeight),
        totalTopHeight: Math.round(statusBarHeight + navBarHeight)
      })
    } catch (e) {
      this.setData({statusBarHeight: 20, navBarHeight: 44, totalTopHeight: 64})
    }
  },

  async refreshAlmanac() {
    const date = new Date()
    this.setData({historyLoading: true})

    try {
      const almanac = await buildAlmanac(date) || {}
      const safeYi = Array.isArray(almanac.modernYi) && almanac.modernYi.length ? almanac.modernYi : ['记录灵感', '轻量运动']
      const safeJi = Array.isArray(almanac.modernJi) && almanac.modernJi.length ? almanac.modernJi : ['冲动消费', '临时爽约']

      this.setData({
        almanac: {
          ...almanac,
          solarIso: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`,
          week: almanac.week || ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][date.getDay()],
          lunarFull: almanac.lunarFull || '今日',
          yearGanZhi: almanac.yearGanZhi || '岁次',
          monthGanZhi: almanac.monthGanZhi || '本月',
          dayGanZhi: almanac.dayGanZhi || '今日',
          jieQi: almanac.jieQi || '',
          festivals: almanac.festivals || [],
          yi: Array.isArray(almanac.yi) && almanac.yi.length ? almanac.yi : ['解除', '扫舍', '余事勿取'],
          ji: Array.isArray(almanac.ji) && almanac.ji.length ? almanac.ji : ['诸事不宜'],
          modernYiText: safeYi.join('、'),
          modernJiText: safeJi.join('、'),
          quote: almanac.quote || '世界太吵，今天适合按下静音键。'
        }
      })
      this.setData({historyLoading: false})
    } catch(e) {
      console.error('refreshAlmanac error:', e)
      this.setData({historyLoading: false})
    }
  },

  drawFortune() {
    if (this.data.fortuneState !== 0) return
    wx.vibrateShort({type: 'medium'})
    this.setData({fortuneState: 1})
    setTimeout(() => {
      const fortuneBank = [
        {level: '大吉', keyword: '枯木逢春', desc: '宛如老树抽出新芽。困滞的局面将迎来转机，宜顺势而为。', colorClass: 'best'},
        {level: '吉', keyword: '云散月明', desc: '遮蔽光芒的阴霾终将散去。保持内心的清明，答案自会浮现。', colorClass: 'good'},
        {level: '半吉', keyword: '静水流深', desc: '表面看似毫无波澜，内在却在积蓄力量。不急躁，是今日的修行。', colorClass: 'mid'},
        {level: '小吉', keyword: '花发应微', desc: '细微之处见真章。留意身边微小的善意，将收获意料之外的喜悦。', colorClass: 'small'},
        {level: '末吉', keyword: '大器晚成', desc: '好饭不怕晚。现在的停滞只是为了铺垫更长远的路，且徐徐图之。', colorClass: 'normal'},
        {level: '平', keyword: '守静致远', desc: '风不起，浪不惊。按部就班即是最好的护身符，今日勿远谋。', colorClass: 'normal'},
        {level: '大吉', keyword: '乘风破浪', desc: '长风破浪会有时。今日直觉敏锐，宜做出决断，一往无前。', colorClass: 'best'},
        {level: '吉', keyword: '暗香浮动', desc: '不经意间散发的魅力将吸引同频之人。宜交友、宜坦诚相待。', colorClass: 'good'},
        {level: '小吉', keyword: '寸阴是竞', desc: '聚沙成塔。今日付出的微小努力，都将成为明日安稳的基石。', colorClass: 'small'},
        {level: '末吉', keyword: '行到水穷', desc: '看似路已走到尽头，其实只需换个角度，便能坐看云起。', colorClass: 'mid'},
        {level: '半吉', keyword: '和光同尘', desc: '收敛锋芒，融入人群。在倾听中会获得比表达更多的智慧。', colorClass: 'mid'},
        {level: '大吉', keyword: '万物生辉', desc: '气场全开的一天，你的光芒无法被掩盖，去见想见的人，做想做的事。', colorClass: 'best'},
        {level: '平', keyword: '随遇而安', desc: '不强求万事顺意，接纳偶尔的兵荒马乱，心安即是归处。', colorClass: 'normal'},
        {level: '小吉', keyword: '偶遇微光', desc: '放慢脚步，今天会在习以为常的风景里，发现久违的感动。', colorClass: 'small'},
        {level: '吉', keyword: '否极泰来', desc: '低谷期已过，接下来走的每一步，都是在向上攀登。', colorClass: 'good'}
      ]
      const idx = Math.floor(Math.random() * fortuneBank.length)
      this.setData({fortuneState: 2, fortuneResult: fortuneBank[idx]})
    }, 1200)
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
