# 开发历史归档 (2026-04 ~ 2026-05)

> 从 MEMORY.md 提取的历史 Bug 修复、开发经验、已完成项目

## NoForget 小程序开发经验

- WXSS括号错位→白屏 | 多余require→编译崩溃 | hashDate碰撞→YYYYMMDD修复
- 白屏调试顺序：WXSS括号→JS require→setData格式→API/业务逻辑
- path混淆：正确路径~/.openclaw/workspace/noforget/
- saveItem云端读写一致性：upsertLocalItem()后不调syncFromCloud()
- period.js姨妈不同步countdownStore，修复已合并
- countdownStore syncFromCloud异常覆盖本地，云端失败时保护本地
- index.js onShow竞态：loadItems()未await，_refreshCountdowns拿旧数据

## 飞书系统修复记录

- 私信DM allowlist配置 ✅
- 群聊allowlist配置 ✅
- announcement模式bug：多余兜底投递，已改none
- 飞书卡片\n→\<br/\> 换行修复
- 跨租户问题：oc_f109...不可达，改用oc_2581...
- 案例库cron Edit报错：edit工具无法匹配动态内容 → 改用write+exec

## Bug修复记录 (关键)

- countdown.js d借位错误 getMonth()-1→基于now而非start ✅
- getDiff引用错误 ✅
- hashDate YYYYMMDD 碰撞修复 ✅
- lunar MONTHS[0]空字符串修复 ✅
- Swap压力89.7%：主因Ollama 26GB模型blob
- detail.js toggleRemind async/await修复 ✅
