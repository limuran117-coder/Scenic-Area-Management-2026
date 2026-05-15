# No Forget 小程序 Bug 修复记录

---

## 🐛 Bug #001：首页导航栏下方白条

**日期：** 2026-05-03

**文件：** `pages/index/index.wxml` / `pages/index/index.wxss`

**症状：** 首页顶部白条，始终存在，内容被导航栏遮挡部分

**根因：** `scroll-view` 上的 `padding-top` 在不同基础库版本和机型上盒模型计算不一致，部分机型将 `padding` 当成额外高度，叠加 `position: fixed` 导航栏导致内容被覆盖

**修复方案：** 物理隔离法
- `scroll-view` 上移除 `style="padding-top: {{navHeight + 20}}px;"`
- 在 `scroll-view` 内部第一行添加透明占位块：
```html
<view style="height: {{navHeight + 10}}px; width: 100%; flex-shrink: 0;"></view>
```
- `.custom-header` 添加 `box-sizing: border-box;`

**版本：** v14 → v15

**验证：** 已确认白条消失

---

## 🐛 Bug #002：详情页导航栏与胶囊错位 + 底部栏过胖

**日期：** 2026-05-03

**文件：** `pages/detail/detail.wxml` / `pages/detail/detail.wxss` / `pages/detail/detail.js`

**症状：**
1. 导航栏返回键、标题与右边胶囊按钮不在同一水平线，错位明显
2. 底部操作栏（已提醒/分享/编辑）过高过胖，不够精致

**根因：**
1. `detail.js` 只取了 `statusBarHeight`，漏掉了胶囊按钮高度的官方标准计算公式
2. 底部栏 `padding: 30rpx 80rpx` 加上安全区后整体太高

**修复方案 v15：**
- `detail.js` `onLoad` 改用官方标准公式：`navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height`
- `detail.wxml` 导航栏：`style="height: {{totalTopHeight}}px; padding-top: {{statusBarHeight}}px; box-sizing: border-box;"` + `style="height: {{navBarHeight}}px;"`
- `detail.wxss` 底部栏：`padding: 20rpx 40rpx calc(10rpx + env(safe-area-inset-bottom, 20rpx));` / `.detail-action-item`：`padding: 10rpx 0;`

**版本：** v14 → v15

---

## 🐛 Bug #003：详情页照片显示区域过小（200rpx）

**日期：** 2026-05-03

**文件：** `pages/detail/detail.wxss`

**症状：** 用户上传的照片被压成扁平的"胶囊按钮"感，与下方大卡片不协调

**修复方案：** 释放高度，统一圆角
- `.photo-img` 高度：`200rpx → 520rpx`
- `.photo-placeholder` 最小高度：`140rpx → 520rpx`
- 圆角弧度：`32rpx → 40rpx`（与下方倒计时卡片统一）

**版本：** v15 → v15.1

---

## ✨ 优化 #004：详情页底部文案重复且颜色过浅

**日期：** 2026-05-03

**文件：** `pages/detail/detail.wxml` / `pages/detail/detail.wxss`

**症状：** 底部出现四段文案（主文案 + detailMain + detailSub + 引号句），且品牌 Slogan 颜色 `#CCC` 太浅像水印，压不住底盘

**修复方案 v16：**
- **WXML**：删除信息卡片内的 `<view class="detail-divider">` + `<view class="detail-text-block">` 残留（有封面/无封面两处）
- **底部文案区**精简为两句：
```html
<text class="detail-sub-text">{{item.detailSub}}</text>
<text class="brand-watermark">NO FORGET · 记住每一个重要时刻</text>
```
- **WXSS**：
  - `.footer-note`：`margin-top: 50rpx; gap: 24rpx`
  - `.detail-sub-text`：`rgba(192,80,112,0.85)` 粉色，26rpx
  - `.brand-watermark`：`#888888` 深灰，`letter-spacing: 4rpx`

**最终结构：** 粉色走心文案 → 深色品牌收尾，干净两句

**版本：** v15 → v16

---

## ✨ 优化 #005：创建页"直男蓝"风格断层

**日期：** 2026-05-03

**文件：** `pages/add/add.wxml` / `pages/add/add.wxss`

**症状：**
1. 分类框大、字小，内部留白太多，排版散乱
2. "直男蓝"按钮（#007AFF）与首页/详情页马卡龙/高级灰风格完全断层

**修复方案 v17：**
- **WXML**：移除分类/提醒/按钮的全部 inline style，100%交给WXSS
- **分类框**：正方形 → 微圆角矩形（28rpx）+ 浅灰底 `#F5F5F7` + 选中淡粉光 `rgba(232,122,152,0.08)` + 深粉字 `#c05070`，图标放大到52rpx
- **提醒选项**：硬边框 → 药丸形态（100rpx圆角）+ 马卡龙粉选中态
- **底部按钮**：亮蓝 `#007AFF` → 碳黑 `#1d1d1f`（呼应首页浮窗按钮），删除按钮用淡红底

**版本：** v16 → v17

---

## ✨ 优化 #006：首页缺少"我的"入口

**日期：** 2026-05-03

**文件：** `pages/index/index.wxml` / `pages/index/index.wxss` / `pages/index/index.js`

**症状：** 极简风格去掉Tabbar后，用户找不到"我的"个人中心入口

**修复方案 v17：**
- **左侧入口**：导航栏左上角加 `.nav-left` + `.mine-avatar`（60rpx浅灰圆圈 + 👤）
- **标题居中**：`.nav-title` 用 `position: absolute; left: 50%; transform: translateX(-50%)` 保证永远居中，不被左侧图标挤压
- **JS**：统一改用官方公式 `(menuButton.top - statusBarHeight) * 2 + menuButton.height`
- **变量名**：旧 `navHeight/paddingTop` → `navBarHeight/totalTopHeight/statusBarHeight`

**版本：** v15 → v17

**备注：** `goToMine()` 函数已存在，无需修改JS逻辑

---

## ✨ 优化 #007："我的"页面全面高级化（v18→v19）

**日期：** 2026-05-03

**文件：** `pages/mine/mine.wxml` / `pages/mine/mine.wxss` / `pages/mine/mine.js`

**症状：**
1. 头像框为又扁又长的椭圆，比例奇怪，缺乏精致感
2. 卡片阴影平庸，缺乏"呼吸感"
3. 菜单区图标缺乏色彩倾向，视觉平淡
4. 意见反馈未嵌入个人邮箱

**修复方案 v19：**

**WXML：**
- 头像从左侧小卡片 → **居中大画幅**（180rpx正圆 + 白色描边 + 📸相机Badge）
- 菜单项全部加 **10%透明度彩色Icon底色**（粉/浅粉/天蓝/灰/金/淡红）
- `no-border` 类控制底部分隔线，结构清晰

**WXSS：**
- `.avatar-wrapper` 强制 `width/height: 180rpx !important` 彻底治愈椭圆
- 大圆角卡片（40rpx）+ 轻盈阴影 `box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.03)`
- 仪表盘数字放大到 56rpx，营造大气感

**JS：**
- `contactUs` 重写：邮箱 418883073@qq.com + 走心文案"代码有bug，但记录的爱与记忆永远完美。" + 一键复制

**版本：** v18 → v19

---

## 🐛 Bug #008：首页堆叠靠上 + 导航栏占位失效（Flex布局断裂）

**日期：** 2026-05-03 18:47

**文件：** `pages/index/index.wxss` / `pages/index/index.wxml` / `pages/index/index.js`

**症状：** 首页卡片整体堆叠靠上，导航栏下方出现大片空白后又堆叠

**根因（三层叠加）：**

1. **布局层**：`.page-container` 没有 `display:flex`，`.scroll-area` 用 `height:100vh` 在固定导航栏存在时超出屏幕
2. **数据层**：`index.wxml` 用 `totalTopHeight/statusBarHeight/navHeight`，但 `index.js` 设的是 `navHeight/paddingTop`，三个关键变量全为 undefined
3. **变量断裂**：`{{totalTopHeight + 10}}px` 中 totalTopHeight 为 undefined → NaN，placeholder 占位块失效

**修复方案 v17.1：**
```css
/* index.wxss */
.page-container {
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}
.scroll-area {
  flex: 1;           /* 替代 height: 100vh */
  box-sizing: border-box;
}
```

```js
// index.js initNavigation()
totalTopHeight: Math.round(navHeight) + statusBarHeight
```

```html
<!-- index.wxml -->
<view class="nav-content" style="height: {{navHeight}}px;">
```

**版本：** v17 → v17.1

---

## 🐛 Bug #009：已建卡片文案（副标题/SINCE日期）全部不显示

**日期：** 2026-05-03 18:50

**文件：** `pages/index/index.wxml` / `pages/index/index.js`

**症状：** 首页卡片中标题下方的情绪文案不显示，底部 SINCE 日期也不显示

**根因：** 模板用 `{{item.statusText}}`，JS 赋值的是 `countdownSentence`，字段名不匹配 → 静默失败，微信不报错

**修复方案 v17.1：**
```html
<!-- index.wxml -->
<view class="card-subtitle">{{item.countdownSentence}}</view>
```
后升级为：
```html
<view class="card-subtitle">{{item.cardSubtitle}}</view>
```

**版本：** v17 → v17.1

---

## 🐛 Bug #010：大数字"水印"越界右对齐（影响相邻卡片）

**日期：** 2026-05-03 18:55

**文件：** `pages/index/index.wxss`

**症状：** 卡片右侧大数字（260rpx字体）跑到自己卡片边界外，与相邻卡片重叠，特别是3位数卡片（如131）时最明显

**根因：** `.card-right` 用 `position: absolute; right: -20rpx` 让水印脱离文档流，相邻卡片被当成"有元素覆盖"处理

**修复方案 v17.1：**
```css
.card-right {
  position: relative;    /* 改用 relative，约束在本卡片内 */
  align-self: flex-end;
  flex-shrink: 0;
  margin-left: 24rpx;
}
```

**版本：** v17 → v17.1

---

## ✨ 优化 #011：去掉"天"单位，只保留纯数字

**日期：** 2026-05-03 19:00

**文件：** `pages/index/index.wxml` / `pages/index/index.wxss`

**症状：** 卡片右侧大数字下方有"天"字单位，和数字视觉重叠，不够简洁

**修复方案 v17.2：**
- WXML：移除 `<text class="huge-unit">天</text>`
- WXSS：保留 `.huge-unit` 结构（防未来扩展），但不在模板中渲染

**版本：** v17.1 → v17.2

---

## ✨ 优化 #012：随机温馨副标题系统

**日期：** 2026-05-03 19:10

**文件：** `utils/categories.js` / `pages/index/index.js` / `pages/index/index.wxml`

**症状：** 所有已建卡片统一显示"已过去X天"，缺乏情感温度

**修复方案 v5（categories.js）+ v2（index.js）：**

```js
// utils/categories.js — 每个分类5套subtitles数组
const categories = [
  {
    id: 'birthday',
    subtitles: [
      '愿每一岁都奔赴在热爱里',
      '按时长大，保持童心',
      '生而自由，日日欢喜',
      '每一刻都值得被庆祝',
      '世界热闹，你最重要'
    ],
    // ...
  },
  // ... 10个分类各5套
]

function pickSubtitle(categoryId) {
  const cat = categories.find(c => c.id === categoryId)
  if (!cat || !cat.subtitles) return ''
  return cat.subtitles[Math.floor(Math.random() * cat.subtitles.length)]
}
```

```js
// index.js loadItems()
cardSubtitle: pickSubtitle(item.categoryId)
```

**生效时机：** 每次小程序冷启动（loadItems）时随机抽取，刷新倒计时不重新随机

**版本：** categories.js v3 → v5，index.js v2

---

## 🐛 Bug #013："我的"页面头像📸相机图标冗余

**日期：** 2026-05-03 19:00

**文件：** `pages/mine/mine.wxml`

**症状：** 上传头像后，右下角📸相机图标仍然显示，与真实头像重叠

**修复方案：** 删除 `<view class="edit-badge">📸</view>` 元素（CSS `.edit-badge` 保留）

**版本：** 无版本变更

---

## 📋 变量名契约规范（经验总结）

> 以下变量名是首页模板（index.wxml）和逻辑层（index.js）之间的**契约**，修改任一方必须同步更新另一方：

| 用途 | JS data 字段 | WXML 引用 |
|------|-------------|-----------|
| 导航栏总高 | `totalTopHeight` | 占位块 `height: {{totalTopHeight + 10}}px` |
| 状态栏高 | `statusBarHeight` | 导航栏 `padding-top: {{statusBarHeight}}px` |
| 胶囊栏高 | `navHeight` | 导航栏内部 `height: {{navHeight}}px` |
| 卡片副标题 | `cardSubtitle` | `{{item.cardSubtitle}}` |
| 倒计天数 | `countdownPreciseDays` | `{{item.countdownPreciseDays}}` |
| 分类字段 | `category` | `theme-{{item.category}}` |

---

*文档版本：v6 | 最后更新：2026-05-03*
