// pages/period/stats.js
const period = require('../../utils/period.js')

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    totalTopHeight: 64,
    navTitle: 'NO FORGET',
    stats: null,
    canvasWidth: 0,
    recentCycles: [],
    insightText: '',
    chartData: [],
    avgPeriodLength: 5,
    trendSummary: null,
    insightCards: [],
    historyRows: [],
    stableBadge: null
  },

  onLoad() {
    try {
      const windowInfo = wx.getWindowInfo()
      const menuButton = wx.getMenuButtonBoundingClientRect()
      const statusBarHeight = windowInfo.statusBarHeight || 20
      const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
      this.setData({
        statusBarHeight,
        navBarHeight: Math.round(navBarHeight),
        totalTopHeight: Math.round(statusBarHeight + navBarHeight),
        canvasWidth: wx.getSystemInfoSync().windowWidth - 64
      })
    } catch(e) {}
    this.load()
  },

  onShow() { this.load() },

  load() {
    const entries = period.getEntries()
    const stats = period.getCycleStats(entries)
    const recentCycles = period.getRecentCycles(entries, 6)
    const completed = entries.filter(e => e.endDate && (e.periodLength || e.endDate))
    const avgPeriodLength = completed.length
      ? Math.round(completed.reduce((s, e) => s + (e.periodLength || 5), 0) / completed.length)
      : 5
    const chartData = recentCycles.slice(0, 6).map((c) => {
      const d = new Date(c.start)
      const month = `${d.getMonth() + 1}月`
      return {month, days: c.length}
    })
    const trendSummary = this.buildTrendSummary(stats, recentCycles, avgPeriodLength)
    const stableBadge = this.buildStableBadge(stats)
    const insightCards = this.buildInsightCards(stats, recentCycles, avgPeriodLength)
    const historyRows = this.buildHistoryRows(recentCycles, stats)
    const insightText = this.generateInsight(stats, recentCycles, trendSummary)
    this.setData({
      stats,
      recentCycles,
      insightText,
      avgPeriodLength,
      chartData,
      trendSummary,
      stableBadge,
      insightCards,
      historyRows
    })
  },

  onReady() {
    this.drawTrendChart()
  },

  drawTrendChart() {
    const chartData = this.data.chartData
    if (!chartData || chartData.length === 0) return

    const ctx = wx.createCanvasContext('intervalChart', this)
    const systemInfo = wx.getSystemInfoSync()
    const canvasWidth = systemInfo.windowWidth - 64 // 32rpx padding each side
    const canvasHeight = 320
    const padding = {top: 40, bottom: 60, left: 40, right: 20}
    const chartW = canvasWidth - padding.left - padding.right
    const chartH = canvasHeight - padding.top - padding.bottom

    const maxDays = Math.max(...chartData.map(d => d.days)) + 5
    const barCount = chartData.length
    const barGap = 20
    const totalBarW = chartW - barGap * (barCount - 1)
    const barW = Math.floor(totalBarW / barCount)

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // 参考线
    ctx.setStrokeStyle('#EDE8F2')
    ctx.setLineWidth(1)
    ctx.setLineDash([4, 4])
    ;[0.25, 0.5, 0.75].forEach(ratio => {
      const y = padding.top + chartH * (1 - ratio)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvasWidth - padding.right, y)
      ctx.stroke()
    })
    ctx.setLineDash([])

    // 柱子
    chartData.forEach((item, i) => {
      const x = padding.left + i * (barW + barGap)
      const barHpx = (item.days / maxDays) * chartH
      const y = padding.top + chartH - barHpx

      // 圆角柱子
      const radius = Math.min(barW / 2, 10)
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + barW - radius, y)
      ctx.arcTo(x + barW, y, x + barW, y + radius, radius)
      ctx.lineTo(x + barW, padding.top + chartH)
      ctx.lineTo(x, padding.top + chartH)
      ctx.lineTo(x, y + radius)
      ctx.arcTo(x, y, x + radius, y, radius)
      ctx.closePath()
      ctx.setFillStyle(item.days >= 25 && item.days <= 32 ? '#D6BDE8' : '#E8A090')
      ctx.fill()

      // 顶部天数
      ctx.setFillStyle('#9B7EC6')
      ctx.setFontSize(22)
      ctx.setTextAlign('center')
      ctx.fillText(item.days, x + barW / 2, y - 8)

      // 底部月份
      ctx.setFillStyle('#9C8C82')
      ctx.setFontSize(20)
      ctx.fillText(item.month, x + barW / 2, padding.top + chartH + 30)
    })

    ctx.draw()
  },

  goBack() { const p = getCurrentPages(); if (p.length > 1) { wx.navigateBack() } else { wx.reLaunch({url: '/pages/index/index'}) } },

  buildTrendSummary(stats, recentCycles, avgPeriodLength) {
    if (!stats) return null
    const latest = recentCycles[0] || null
    const lastLength = latest ? latest.length : stats.avgCycle
    const drift = Number((lastLength - stats.avgCycle).toFixed(1))
    const driftLabel = drift === 0
      ? '与平均值持平'
      : drift > 0
        ? `最近一次偏长 ${drift} 天`
        : `最近一次偏短 ${Math.abs(drift)} 天`
    return {
      sampleLabel: `${stats.dataPoints} 次有效间隔`,
      variabilityLabel: `波动范围 ${stats.minCycle}-${stats.maxCycle} 天`,
      bleedLabel: `平均见红 ${avgPeriodLength} 天`,
      driftLabel
    }
  },

  buildStableBadge(stats) {
    if (!stats) return null
    if (stats.isStable) {
      return {
        status: 'stable',
        text: '节奏稳定',
        desc: `最近 ${stats.dataPoints} 次间隔基本落在舒适区间内`
      }
    }
    return {
      status: 'unstable',
      text: '有轻微波动',
      desc: `最近波动跨度 ${stats.maxCycle - stats.minCycle} 天，建议继续观察`
    }
  },

  buildInsightCards(stats, recentCycles, avgPeriodLength) {
    if (!stats) return []
    const spread = stats.maxCycle - stats.minCycle
    const latest = recentCycles[0] || null
    const latestLength = latest ? latest.length : stats.avgCycle
    const latestOffset = Number((latestLength - stats.avgCycle).toFixed(1))
    const offsetLabel = latestOffset === 0
      ? '与平均间隔基本一致'
      : latestOffset > 0
        ? `比平均值晚了 ${latestOffset} 天`
        : `比平均值早了 ${Math.abs(latestOffset)} 天`
    const confidenceLabel = stats.confidence >= 80
      ? '高'
      : stats.confidence >= 60
        ? '中'
        : '成长中'
    return [
      {
        key: 'stability',
        icon: '◌',
        title: '节奏稳定度',
        metric: `${spread}天`,
        caption: stats.isStable ? '整体比较平稳' : '还有起伏空间',
        desc: stats.isStable
          ? '你的周期波动较小，继续保持记录即可。'
          : `当前跨度为 ${stats.minCycle}-${stats.maxCycle} 天，建议连续观察 2-3 个周期。`
      },
      {
        key: 'latest',
        icon: '↗',
        title: '最近一次对比',
        metric: `${latestLength}天`,
        caption: offsetLabel,
        desc: latest
          ? `最近一次区间从 ${latest.start} 到 ${latest.end}，能帮助你判断短期变化。`
          : '再记录一个完整周期，这里会出现更具体的变化对比。'
      },
      {
        key: 'quality',
        icon: '✦',
        title: '记录完整度',
        metric: `${stats.confidence}%`,
        caption: `置信感 ${confidenceLabel}`,
        desc: `当前已有 ${stats.dataPoints} 次有效间隔，平均见红 ${avgPeriodLength} 天，数据会随着记录继续变准。`
      }
    ]
  },

  buildHistoryRows(recentCycles, stats) {
    if (!Array.isArray(recentCycles)) return []
    const avgCycle = stats ? stats.avgCycle : null
    return recentCycles.map(item => {
      const delta = avgCycle === null ? 0 : Number((item.length - avgCycle).toFixed(1))
      let variation = '与平均持平'
      if (delta > 0) variation = `偏长 ${delta} 天`
      if (delta < 0) variation = `偏短 ${Math.abs(delta)} 天`
      return {
        ...item,
        statusText: item.stable ? '稳定' : '波动',
        variation,
        tagClass: item.stable ? 'stable' : 'unstable'
      }
    })
  },

  generateInsight(stats, recentCycles, trendSummary) {
    if (!stats) return '记录姨妈，了解自己的时间规律'
    if (stats.dataPoints === 1) {
      return `你已经完成了第 1 次有效记录。接下来再补充 1-2 个完整间隔，页面会开始更准确地判断你的平均间隔、波动范围和近期变化。`
    }
    const latest = recentCycles[0]
    if (!stats.isStable) {
      return `目前看你的间隔在 ${stats.minCycle}-${stats.maxCycle} 天之间浮动，最近一次为 ${latest ? latest.length : stats.avgCycle} 天。先不用紧张，这更像是还在建立个人基线；继续记录 2-3 个周期，会比单次波动更有参考价值。`
    }
    if (stats.avgCycle < 26) {
      return `你的平均间隔约 ${stats.avgCycle} 天，属于偏紧凑型节奏。只要整体稳定、没有持续明显不适，一般先以观察为主；如果之后出现突然拉长或缩短，统计页会第一时间反映出来。`
    }
    if (stats.avgCycle > 32) {
      return `你的平均间隔约 ${stats.avgCycle} 天，整体会比常见节奏更长一点。现在更重要的是看它是否持续稳定，如果接下来几次仍然接近这个区间，这就是你的个人规律。`
    }
    return `从现在的数据看，你的节奏比较稳定，平均 ${stats.avgCycle} 天，${trendSummary ? trendSummary.driftLabel : '最近一次与平均值接近'}。继续保持记录，这页会越来越像一份真正属于你的身体时间档案。`
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

