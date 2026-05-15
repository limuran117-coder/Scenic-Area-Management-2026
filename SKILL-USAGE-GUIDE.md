# Skill使用指南

## 本地系统架构

```
OpenClaw (主Agent)
├── 调度层 (coordinator)
├── 执行层 (各子Agent)
│   ├── douyin-agent
│   ├── xiaohongshu-agent
│   ├── competitor-agent
│   └── review-agent
└── 能力层 (30个Skill)
```

---

## Skill使用优先级

### 🔴 P0 - 立即可用（无需任何配置）

| Skill | 用途 | 使用方式 |
|-------|------|----------|
| **browser-agent** | Chrome CDP自动化 | 直接调用，采集抖音/小红书数据 |
| **ai-web-automation** | AI网页自动化 | 配合browser-agent使用 |
| **competitor-analyst** | 竞品分析 | 分析竞品动态 |
| **market-research-agent** | 市场调研 | 生成调研报告 |
| **ai-researcher** | AI研究助手 | 深度研究任务 |
| **deepresearchwork** | 深度研究工作流 | 复杂研究任务 |
| **elite-longterm-memory** | 长期记忆 | 保存重要记忆 |
| **neural-memory** | 神经记忆 | 学习模式识别 |
| **jpeng-knowledge-graph-memory** | 知识图谱 | 构建知识关系 |

**当前主力Skill组合：**
- 数据采集：browser-agent + ai-web-automation
- 分析报告：competitor-analyst + market-research-agent + ai-researcher
- 记忆系统：elite-longterm-memory + neural-memory

---

### 🟡 P1 - 需要配置（1-2步可完成）

| Skill | 用途 | 配置需求 |
|-------|------|----------|
| **apex-stack-claude-code** | APEX认知框架 | 阅读文档即可使用 |
| **agent-swarm-ex** | 多Agent编排 | 阅读文档，调用子Agent |
| **agentic-workflow-automation** | 工作流自动化 | 阅读文档 |
| **agent-autonomy-kit** | 自主Agent框架 | 阅读文档 |
| **agent-spawner** | Agent生成器 | 阅读文档 |
| **claude-api-cost-optimizer** | API成本优化 | 阅读文档获取方法 |
| **claude-code-claude-api-builder** | API集成指南 | 阅读文档 |
| **api-tester** | API测试 | 直接使用 |

**使用方法：** 阅读Skill的SKILL.md，按文档调用

---

### 🟢 P2 - 需要外部服务

| Skill | 用途 | 依赖服务 |
|-------|------|----------|
| **agentgo-browser** | 云端浏览器 | 注册 https://app.agentgo.live/ |
| **ezrouter** | 统一API网关 | 注册 https://openrouter.ezsite.ai/ |
| **manus-agent** | 通用AI Agent | 需要Manus账号 |
| **bytebot** | Claude桌面Agent | Railway部署 |
| **bytebot-api** | Bytebot API | Railway部署 |

**优先级：** agentgo-browser > ezrouter > manus > bytebot

---

### ⚪ P3 - 备用/研究类

| Skill | 用途 | 说明 |
|-------|------|------|
| **computer-use-skill** | 电脑控制 | 学习中 |
| **gemini-computer-use** | Gemini电脑控制 | 备用方案 |
| **human-browser-use** | 人类浏览器模拟 | 备用方案 |
| **agent-automation-scripter** | 自动化脚本 | 备用 |
| **claude-code-integration** | Claude Code集成 | 已安装Claude Code |

---

## 每日工作流中的Skill使用

### 08:00 抖音指数日报
```
使用Skill: browser-agent + ai-web-automation + ai-researcher
流程:
1. browser-agent → 打开Chrome → 访问抖音创作者平台
2. 采集8个景区指数数据
3. ai-researcher → 分析数据趋势
4. 生成飞书卡片 → 发送
```

### 10:00 小红书日报
```
使用Skill: browser-agent + ai-web-automation
流程:
1. browser-agent → 打开Chrome → 访问小红书
2. 搜索景区关键词
3. 采集爆款笔记数据
4. competitor-analyst → 分析竞品内容
5. 生成报告 → 发送
```

### 14:00 竞品内容动态
```
使用Skill: competitor-analyst + market-research-agent + deepresearchwork
流程:
1. deepresearchwork → 深度研究竞品动态
2. competitor-analyst → 输出竞品分析
3. 生成报告 → 发送
```

### 21:00 每日复盘
```
使用Skill: ai-researcher + elite-longterm-memory + neural-memory
流程:
1. ai-researcher → 汇总全天数据
2. elite-longterm-memory → 读取历史记忆
3. neural-memory → 发现规律
4. 生成优化建议 → 发送
```

---

## Skill调用方式

### 方式1：直接读取Skill文档
```markdown
读取: ~/.openclaw/workspace/skills/{skill-name}/SKILL.md
按文档指引使用
```

### 方式2：通过子Agent调用
```markdown
配置Agent时指定Skill:
## 配置的Skill
- browser-agent - 数据采集
- ai-researcher - 分析报告
```

### 方式3：通过主Agent协调
```
我(主Agent) → 协调各子Agent使用对应Skill
```

---

## Skill性能优化

### 快速任务（<5分钟）
- 使用 browser-agent 直接采集
- 使用 ai-researcher 快速分析

### 复杂任务（>5分钟）
- 使用 deepresearchwork 深度研究
- 使用 elite-longterm-memory 保存上下文

### 长期项目
- 使用 jpeng-knowledge-graph-memory 构建知识图谱
- 使用 neural-memory 持续学习优化

---

## 下一步行动计划

1. **立即** - 使用P0级别Skill优化日报流程
2. **本周** - 配置P1级别Skill到对应Agent
3. **下周** - 部署AgentGo浏览器测试
4. **下周** - Railway部署Bytebot（如需要）

---

## 维护记录

- 2026-04-11: 完成Skill分配，发布本指南
