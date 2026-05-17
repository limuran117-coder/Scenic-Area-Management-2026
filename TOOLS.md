# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)

---

## 电影小镇运营助手特殊工具配置

### peekaboo (macOS UI自动化) — 已安装未激活
- 位置：`/opt/homebrew/bin/peekaboo`（brew安装）
- 用途：CDP浏览器采集失败时的降级方案（抖音指数/竞品关键词）
- 前提：需授予Screen Recording + Accessibility权限
- 权限检查：`peekaboo permissions`
- 状态：🔴 未配置权限，不可用

### skill-creator (技能包创建)
- 位置：`~/.npm-global/lib/node_modules/openclaw/skills/skill-creator/`
- 脚本位置：`scripts/init_skill.py`、`scripts/package_skill.py`
- 用途：将SOP转化为可自动触发的正式技能
- 命名规范：自定义技能使用 `ops-*` 前缀
- 状态：✅ 可用

### summarize (URL/视频摘要)
- 安装：`brew install steipete/tap/summarize`
- 配置：需设置API Key（GOOGLE_GENERATIVE_AI_API_KEY等）
- 状态：🔴 未安装

### 已有但不常用技能索引
| 技能 | 用途 | 文件位置 |
|------|------|---------|
| gog | Google Workspace（Gmail/Calendar/Drive） | ~/.npm-global/.../skills/gog/ |
| session-logs | 会话日志检索 | ~/.npm-global/.../skills/session-logs/ |
| taskflow | 多步骤持久化工作流 | ~/.npm-global/.../skills/taskflow/ |
| model-usage | 模型使用成本统计 | ~/.npm-global/.../skills/model-usage/ |
