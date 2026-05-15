/**
 * 图标系统 - icons.js
 * 当前项目统一使用轻量 Apple 风格分类 SVG。
 * 旧主题名称仍保留兼容，但会回退到 apple。
 */

const CATEGORIES = [
  'period',
  'birthday',
  'love',
  'repayment',
  'vehicle',
  'pet_birthday',
  'wedding',
  'onboarding',
  'festival',
  'death'
]

const THEMES = ['apple']
const FALLBACK_THEME = 'apple'
const THEME_ALIAS = {
  apple: 'apple'
}

/**
 * 获取图标文件本地路径
 * 如果文件不存在，调用方应使用 emoji（cat.icon）兜底
 * @param {string} theme 主题风格
 * @param {string} category 分类ID
 * @returns {string} 相对于 static/icons/ 的路径
 */
function getIconPath(theme, category) {
  const safeTheme = THEME_ALIAS[theme] || FALLBACK_THEME
  const safeCategory = CATEGORIES.includes(category) ? category : 'festival'
  return `/static/icons/${safeCategory}/${safeTheme}.svg`
}

/**
 * 获取分类 emoji（兜底）
 * @param {string} category
 * @returns {string} emoji
 */
function getCategoryEmoji(category) {
  const map = {
    period: '🌸',
    birthday: '🎂',
    love: '💕',
    repayment: '💳',
    vehicle: '🚗',
    wedding: '💒',
    death: '🙏',
    pet_birthday: '🐾',
    onboarding: '💼',
    festival: '🎊',
  }
  return map[category] || '📌'
}

/**
 * 获取分类中文名称
 * @param {string} category
 * @returns {string}
 */
function getCategoryName(category) {
  const map = {
    period: '姨妈日',
    birthday: '生日',
    love: '恋爱开始',
    repayment: '还款日',
    vehicle: '车辆保险',
    wedding: '结婚纪念日',
    death: '忌日',
    pet_birthday: '宠物生日',
    onboarding: '入职日',
    festival: '自定义'
  }
  return map[category] || category
}

module.exports = {
  CATEGORIES,
  THEMES,
  getIconPath,
  getCategoryEmoji,
  getCategoryName
}
