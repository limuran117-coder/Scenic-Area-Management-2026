// 全局常量配置 - NO-FORGET 小程序
module.exports = {
  // 🔥 微信订阅消息模板ID（mp.weixin.qq.com 订阅消息 → 我的模板）
  SUBSCRIBE_TEMPLATES: {
    // 姨妈提醒（生日提醒风格模板）
    PERIOD: 'L6aIoXgdKCQpd6wuR1VGYLzQLDZq6SsLlqDdffI8s7w',
    // 危险日提醒（纪念日提醒风格模板）
    DANGER: 'tgbYbjo2NUbNEJhxM8gYWih59fJpO8YMN6Ct594Iiu8'
  },
  // 订阅规则：拒绝后3天不再弹窗
  SUBSCRIBE_CONFIG: {
    retryInterval: 3 * 24 * 60 * 60 * 1000,
    authTips: '授权后可收到姨妈/危险日微信提醒，不授权不影响使用'
  },
  // 周期默认配置
  DEFAULT_CYCLE: 28
}
