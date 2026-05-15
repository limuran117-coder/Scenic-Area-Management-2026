# NoForget 代码全面检查计划

## 检查目标
覆盖所有页面 × 所有函数 × 所有逻辑链路 × 所有边界条件
发现问题立即记录，发现bug立即修复commit，发现架构风险单独报告

---

## 五轮检查安排

### 🔴 第一轮 09:00 — 数据流链路审查（从新建到展示）
**策略：跟踪每一条数据的完整生命周期**

1. 新建日期：add.js → countdownStore.saveItem → Storage/云端
2. 返回首页：index.js onShow → countdownStore.getItems → 渲染
3. 编辑日期：detail.js → saveItem → 返回首页
4. 删除日期：detail.js → countdownStore.removeItem → 首页
5. 姨妈周期：period.js → countdownStore.saveItem → 首页
6. 全部检查是否有遗漏的中间状态/无await/无错误处理

**预期输出：数据流链路完整性报告**

---

### 🟡 第二轮 11:00 — 防御性审查（边界条件+异常处理）
**策略：假设每个API/变量/数组/对象都可能出问题**

1. 所有 `item.xxx` 读取前是否有空值判断
2. 所有 `array.filter/find/map` 是否有 .length 保护
3. 所有 async 函数是否都有 try-catch
4. 所有 `wx.getStorageSync` 是否都有默认值
5. 所有云函数调用（callFunction）是否都有异常fallback
6. 日期字符串解析（'YYYY-MM-DD'）是否处理iOS NaN问题
7. 新建页面所有必填字段是否有空值拦截

**预期输出：防御性漏洞清单**

---

### 🔵 第三轮 13:00 — 云端同步专项审查
**策略：云端函数 + 离线队列 + 多设备场景**

1. countdownStore 所有导出函数（getItems/saveItem/removeItem/bootstrapSync/flushPendingOps）是否都有正确实现
2. saveItem：是否还有地方调用 syncFromCloud（应该没有了）
3. removeItem：是否还有地方调用 syncFromCloud（应该没有了）
4. 离线队列 enqueuePendingOp → flushPendingOps → upsertCloudItem 链路是否完整
5. period.js 删除时的 getItems 是否加了 await（上一轮已修，确认）
6. 多设备并发写：数据是否会互相覆盖（云函数 upsert 逻辑审查）
7. bootstrapSync 在 app.js 的 onLaunch 中调用是否正确

**预期输出：云端同步风险评估报告**

---

### 🟢 第四轮 15:00 — UI交互与反馈完整性审查
**策略：用户每个操作是否都有明确反馈**

1. 所有按钮点击是否都有视觉/文字反馈（Toast/Loading/Modal）
2. 异步操作（保存/删除/同步）是否在完成前禁止重复点击
3. 操作失败时是否有错误提示（不只是console.warn）
4. 首页下拉刷新是否显示Loading
5. 姨妈记录日期选择是否有点击反馈
6. 删除操作是否有确认步骤
7. 所有页面生命周期 onLoad/onShow/onHide 是否正确处理数据刷新

**预期输出：用户体验漏洞清单**

---

### 🟣 第五轮 17:00 — 业务逻辑一致性审查
**策略：业务规则是否在所有地方一致执行**

1. 周期纪念日（isRecurring）是否在新建/编辑/展示/删除全链路一致
2. 姨妈追踪（categoryId='period'）是否只在period页操作，不在add页
3. 纪念日方向（direction）是否在所有计算场景一致
4. 删除纪念日时：countdownStore + periodEntries 是否同时清理
5. 设置页面修改分类/排序后首页是否正确响应
6. 分享转发是否正确携带纪念日数据
7. 所有常量（STORAGE_KEY/CLOUD_FUNCTION）是否全局唯一

**预期输出：业务逻辑一致性报告**

---

## 报告发送规则
- 每轮检查完成后，私信站长报告（飞书chat_id: ou_f308d672765ecf1be73a75eb5e5f0f48）
- 发现bug立即修复并commit，报告中注明commit hash
- 如发现重大架构风险，单独标注「🚨 严重」
- 五轮全部完成后再发一条总结，包含当前代码健康度评分
