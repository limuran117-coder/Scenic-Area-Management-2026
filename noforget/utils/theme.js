/**
 * utils/theme.js - 主题系统核心
 * 提供四套主题的完整数据（cssVars + 扁平颜色对象）
 */

const themes = {
  apple: {
    id: 'apple',
    name: '晨雾莫兰迪',
    cssVars: `
      --theme-accent: #A87972;
      --theme-accent-rgb: 168,121,114;
      --theme-accent-light: rgba(168,121,114,0.14);
      --theme-text-primary: #2F2A25;
      --theme-text-secondary: #7E766B;
      --theme-text-muted: #AAA094;
      --theme-text-accent: #A87972;
      --theme-background: #F8F4EF;
      --theme-background-warm: #FBF6EF;
      --theme-card-bg: rgba(255,255,255,0.72);
      --theme-card-bg-strong: #FFFDF8;
      --theme-surface-soft: rgba(255,255,255,0.46);
      --theme-border: rgba(205,196,185,0.56);
      --theme-border-strong: rgba(176,165,153,0.56);
      --theme-mist-pink: #D8B7C8;
      --theme-mist-violet: #BDB4D8;
      --theme-mist-blue: #B7CAD8;
      --theme-mist-orange: #E6B894;
      --theme-mist-sage: #BBCDBD;
      --theme-danger: #C86F6B;
      --theme-shadow: 0 10rpx 30rpx rgba(91,74,60,0.045);
      --theme-shadow-card: 0 18rpx 46rpx rgba(91,74,60,0.07);
      --theme-radius-card: 18px;
      --theme-radius-btn: 999rpx;
      --theme-icon-color: #2F2A25;
      --theme-duration-micro: 150ms;
      --theme-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
      --theme-font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      --theme-number-family: Georgia, "Times New Roman", "Songti SC", serif;
    `,
    background: '#F8F4EF',
    backgroundWarm: '#FBF6EF',
    cardBg: 'rgba(255,255,255,0.72)',
    cardBgStrong: '#FFFDF8',
    surfaceSoft: 'rgba(255,255,255,0.46)',
    textPrimary: '#2F2A25',
    textSecondary: '#7E766B',
    textMuted: '#AAA094',
    textAccent: '#A87972',
    border: 'rgba(205,196,185,0.56)',
    borderStrong: 'rgba(176,165,153,0.56)',
    mistPink: '#D8B7C8',
    mistViolet: '#BDB4D8',
    mistBlue: '#B7CAD8',
    mistOrange: '#E6B894',
    mistSage: '#BBCDBD',
    danger: '#C86F6B',
    shadow: '0 10rpx 30rpx rgba(91,74,60,0.045)',
    shadowCard: '0 18rpx 46rpx rgba(91,74,60,0.07)',
    radiusCard: '18px',
    radiusBtn: '999rpx',
    accentColor: '#A87972',
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    numberFamily: 'Georgia, "Times New Roman", "Songti SC", serif'
  }
}

/**
 * 获取主题对象（包含 cssVars + 扁平颜色）
 */
function getTheme(themeId) {
  return themes[themeId] || themes.apple
}

/**
 * 获取所有主题列表（用于主题选择器）
 */
function getAllThemes() {
  return Object.values(themes).map(t => ({id: t.id, name: t.name}))
}

/**
 * 从 cssVars 字符串中提取 key-value 映射
 * @param {string} themeId
 * @returns {object} { varName: value } 不含 --theme- 前缀
 */
function injectThemeVars(themeId) {
  const theme = getTheme(themeId)
  const css = theme.cssVars
  const result = {}
  const matches = css.matchAll(/--([\w-]+):\s*([^;]+);/g)
  for (const match of matches) {
    result[match[1]] = match[2].trim()
  }
  return result
}

module.exports = {
  themes,
  getTheme,
  getAllThemes,
  injectThemeVars
}
