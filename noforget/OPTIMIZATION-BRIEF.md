# noforget 优化简报 v1.0

> 最后更新：2026-05-06
> 维护者：站长 + 李涯（AI助手）

---

## 一、产品定位

**产品名：** noforget
**类型：** 重要日子情绪日历 + 倒计时卡片
**核心承诺：** "不忘记"——让用户不再错过重要日子
**目标用户：** 有情感记忆需求的人群（生日、纪念日、忌日、宠物生日等）

### 当前分类体系
```
birthday      生日      🎂
love          恋爱      💕
wedding       结婚      💒
death         忌日      🙏
pet_birthday  宠物生日  🐾
repayment     还款日    💳
period        姨妈日    🌸
onboarding    入职日    💼
vehicle       车辆管理  🚗
festival      节日      🎊
```

### 情感定位 vs 生活提醒（需明确边界）
当前 10 个分类混入了情感类（birthday/love/wedding/death/pet_birthday）和功能性（repayment/period/vehicle/onboarding）。建议保持混用但明确优先级：**情感优先，功能辅助**。

---

## 二、设计规范（Superhuman Inspired）

### 2.1 色彩系统

| 用途 | 色值 | 名称 |
|------|------|------|
| 主按钮背景 | `#e9e5dd` | 暖米色（Warm Cream） |
| 主文字/标题 | `#292827` | 炭黑（Charcoal Ink） |
| 唯一强调色 | `#cbb7fb` | 薰衣草紫（Lavender Glow） |
| 页面背景 | `#ffffff` | 纯白 |
| 卡片边框 | `#dcd7d3` | 羊皮纸色（Parchment Border） |
| 深紫渐变（仅英雄区） | `#1b1938` | Mysteria Purple |

**使用原则：**
- 按钮只用暖米色，不用亮色 CTA
- 薰衣草紫 `#cbb7fb` 是唯一强调色，禁止滥用
- 文字永远不用纯黑 `#000000`

### 2.2 圆角系统（仅两个级别）

| 级别 | 数值 | 适用场景 |
|------|------|---------|
| 小 | `8px` | 按钮、inline 元素、输入框 |
| 大 | `16px` | 卡片、链接、大容器 |

**禁止：** 2px 微圆角、50px+ 胶囊形

### 2.3 字体规范

| 场景 | 字号 | 字重 | 行高 | 字间距 |
|------|------|------|------|--------|
| 大数字（首页卡片） | 260rpx（动态调整） | 540 | — | — |
| 页面标题 | 20px | 540 | 1.14 | -0.63px |
| 正文 | 16px | 460 | 1.50 | 0 |
| 副标题/副文案 | 14px | 460 | 1.50 | 0 |
| 按钮文字 | 16px | 700 | 1.00 | 0 |
| 微标签 | 12px | 700 | 1.50 | 0 |

### 2.4 深度/阴影哲学

**核心原则：少用阴影，用边框和颜色对比制造层次**

| 级别 | 实现方式 |
|------|---------|
| Level 0 | 无阴影，白背景 |
| Level 1 | `1px solid #dcd7d3` 边框 |
| Level 2 | `1px solid #292827`（深色区块） |
| Level 3 | 轻微阴影（产品截图区） |
| Level 4 | `rgba(255,255,255,0.2)` 半透明边框（深紫区） |

### 2.5 间距系统

- 基础单位：8px
- 页面边距：16px~32px
- 卡片间距：12px~24px
- 组件内间距：8px~16px

---

## 三、已知 Bug 及修复状态

### ✅ 已修复（2026-05-06）

| # | Bug | 修复文件 | 修复内容 |
|---|-----|---------|---------|
| 1 | 图标路径错误 | `utils/icons.js` | `/pages/index/static/` → `/static/icons/` |
| 2 | 当天倒计时跳年 | `utils/countdown.js` | `endDate <= now` → `endDate < todayStart` |
| 3 | 首页刷新错位 | `pages/index/index.js` | `_rawItems` 改为排序后的 `processedItems` 映射 |
| 4 | 分享主题失效 | `pages/detail/detail.js` | `item.category` → `item.categoryId` |
| 5 | 副标题每次随机 | `pages/add/add.js` + `index/index.js` | 创建时固定 `subtitles[0]`，加载时优先读存储值 |

### 🔴 未修复（进行中）

| # | 问题 | 优先级 | 说明 |
|---|------|--------|------|
| B1 | 图标目录缺 SVG | **P0** | 9 个分类无 SVG：`love/wedding/death/pet_birthday/repayment/period/onboarding/vehicle/festival` |
| B2 | 提醒功能未闭环 | **P0** | `pages/add/add.wxml` 有提醒选项，`detail.js` 可切换状态，但缺少订阅消息授权、模板 ID、定时触发逻辑 |
| B3 | 设计风格不统一 | **P1** | 首页（东方色卡+杂志数字）vs 详情（粉色玻璃拟态）vs 新建（马卡龙表单）vs 我的（Apple设置页） |
| B4 | 新建页字段偏少 | **P1** | 缺少：开始日期（startDate 自定义）、提前N天提醒自定义、循环选项 |
| B5 | 空状态文案过虚 | **P2** | "时间未被定义"有作品感，但新用户需要更具体的引导 |
| B6 | 大数字潜在越界 | **P2** | `260rpx` 固定字号，标题较长或天数 ≥4 位时可能和左侧内容重叠 |

---

## 四、技术债务（需逐步清理）

### 4.1 图标系统

**当前目录结构（已有）：**
```
static/icons/
  anniversary/   ✅ 有4个主题svg
  birthday/      ✅ 有4个主题svg
  course/        ✅ 有4个主题svg
  custom/        ✅ 有4个主题svg
  deadline/      ✅ 有4个主题svg
  exam/          ✅ 有4个主题svg
  travel/        ✅ 有4个主题svg
  work/          ✅ 有4个主题svg
```

**缺失（需补）：** `love`、`wedding`、`death`、`pet_birthday`、`repayment`、`period`、`onboarding`、`vehicle`、`festival` 共 9 个分类，每个需 4 个主题 SVG（apple/notion/airbnb/starbucks）

### 4.2 提醒系统（未完成）

当前状态：
- `pages/add/add.wxml` 第 62 行有提醒选项 UI
- `pages/detail/detail.js` 第 216 行可切换提醒状态
- 但**缺少以下核心逻辑**：
  1. 微信订阅消息授权（`wx.requestSubscribeMessage`）
  2. 模板消息 ID 配置
  3. 定时触发（需云开发或定时器）

**建议方案：** 先做本地通知（`wx.showNotification` 需微信开放数据域）或引导用户开启订阅消息

### 4.3 云函数

`pages/add/add.js` 第 181 行调用 `wx.cloud.callFunction({ name: 'syncItem' })`，但项目中无 cloud/ 函数实现。

**建议：** 如果不使用云开发，移除云端同步代码；或补充 `cloud/functions/syncItem/` 实现

### 4.4 副标题持久化

创建时固定存储 `cardSubtitle`，但编辑场景下未处理副标题的更新逻辑（新建时写死，编辑时可能丢失）

---

## 五、页面级优化建议

### 5.1 首页（pages/index/）

**问题：**
- 黄历和每日一言可能抢夺核心卡片注意力
- 大数字 260rpx 固定，字数多时越界

**建议：**
- 黄历弱化为顶部小条（或可折叠）
- 数字字号动态化：`font-size: min(260rpx, 20vw)`
- 标题截断：`max-width: 60%; overflow: hidden; text-overflow: ellipsis`

**视觉方向：** 白底杂志卡片 + 每类一张柔和色纸

### 5.2 详情页（pages/detail/）

**问题：**
- 分享卡片主题 fallback 有时失效（B4 已修复 `category` → `categoryId`）
- 封面卡和详情卡风格不一致

**建议：**
- 确认 SHARE_THEME 补全 festival 条目（已在 detail.js 第 47 行添加）
- 统一详情页的按钮风格为 Superhuman 暖米色

### 5.3 新建页（pages/add/）

**问题：**
- 字段偏少，无法自定义 startDate
- 无法设置提前 N 天提醒

**建议扩展字段：**
```javascript
{
  startDate: '',        // 存续计算起点（如出生日期），默认=targetDate
  customRemindDays: 1,  // 提前几天提醒，默认跟随分类
  cycleType: 'yearly',  // 循环类型：yearly/monthly/once
}
```

### 5.4 我的页（pages/mine/）

**问题：**
- 入口藏在头像里（新用户可能不知道）

**建议：**
- 首页头像旁加轻提示文字（如"点击管理"）
- 或在 FAB 附近加一个更明显的设置入口图标

### 5.5 空状态

**当前文案：** "时间未被定义"
**建议：** 保留诗意标题，但副文案改为更具体的引导：
```
标题：时间未被定义
副文案：记录生日、纪念日、忌日，让重要的日子不再被遗忘
行动引导：[+ 添加第一个重要日子]
```

---

## 六、测试清单（修改后必验）

### 必测场景

| 场景 | 预期结果 |
|------|---------|
| 今天生日 item，23:59 查看 | 显示"0天今天"，不跳364天 |
| 创建新 item → 副标题固定 | 每次进首页文案不变 |
| 点击分享 → 检查主题 | 应显示对应分类颜色，非fallback到birthday |
| 首页图标 | 应正常显示，无404 |
| 编辑已有 item | cardSubtitle 不丢失 |

---

## 七、文件索引

```
noforget/
├── utils/
│   ├── categories.js    分类配置（含10个分类+配色）
│   ├── countdown.js      倒计时核心算法（已修复当天bug）
│   ├── icons.js          图标路径（已修复路径）
│   ├── theme.js          主题系统
│   ├── copyTemplates.js  文案模板
│   └── lunar.js          农历算法
├── pages/
│   ├── index/            首页（列表+倒计时）
│   ├── add/              新建/编辑
│   ├── detail/           详情+分享卡片
│   └── mine/             我的
├── static/icons/         图标资源（缺9个分类）
├── cloud/                云函数目录（空，待实现）
└── lib/                  第三方库
```

---

## 八、协作说明

- 本简报存放于 noforget 项目根目录
- 每次重要修改后更新"最后更新"日期和版本号
- Bug 修复后在"已知 Bug"表中标记 ✅ + 日期
- 新增功能在"技术债务"区更新状态

---

*有问题找李涯（AI助手），或者直接问 Codex。*