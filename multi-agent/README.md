# 多Agent系统

## 概述
基于 OpenClaw sessions_spawn 实现的多Agent协作系统，用于景区营销日报的自动化采集与分析。

## 目录结构
```
~/.openclaw/workspace/multi-agent/
├── README.md                        # 本文件
├── agents/                         # 各专业Agent定义
│   ├── douyin-agent.md            # 抖音指数Agent
│   ├── xiaohongshu-agent.md       # 小红书数据Agent
│   ├── competitor-agent.md         # 竞品动态监控Agent
│   ├── passenger-agent.md          # 客流数据分析Agent（未来）
│   └── revenue-agent.md           # 收入分析Agent（未来）
└── workflows/
    └── daily-report-coordinator.md # 日报协调工作流
```

## Agent职责

| Agent | 状态 | 职责 |
|-------|------|------|
| douyin-agent | ✅ 已上线 | 抖音指数数据采集分析 |
| xiaohongshu-agent | ✅ 已上线 | 小红书UGC数据采集分析 |
| competitor-agent | ✅ 已上线 | 竞品动态监控 |
| passenger-agent | 🔄 待接入 | 客流Excel数据分析 |
| revenue-agent | 🔄 待接入 | 营收数据分析 |
| reviewer-agent | ✅ 已上线 | 每日复盘+Skill生成 |

### reviewer-agent 职责
每周日18:00执行（配合每周复盘）：
1. 收集今日事件（session日志、learnings）
2. 识别值得沉淀的模式/方法/教训
3. 生成可复用Skill
4. 更新MEMORY.md/AGENTS.md等记忆文件

## 工作流程

```
主Agent（我）
  ↓
1. 读取各Agent定义
2. 并行spawn各专业Agent
3. 收集汇总结果
4. 生成结构化日报
5. 发送飞书消息
```

## 扩展新Agent

1. 在 `agents/` 创建 `[name]-agent.md`
2. 定义角色、数据源、输出格式
3. 遵循响应格式规范

## 错误隔离

每个Agent独立运行，单个失败不影响其他。
主Agent汇总时跳过失败数据，继续生成报告。
