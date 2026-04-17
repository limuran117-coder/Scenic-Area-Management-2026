# Skill注册表

## Skill位置
所有Skill在: `/Users/tianjinzhan/.openclaw/workspace/skills/`

## Skill分类

### 🔵 浏览器自动化类
| Skill | 路径 | 用途 |
|-------|------|------|
| browser-agent | skills/browser-agent/ | Chrome CDP自动化 |
| ai-web-automation | skills/ai-web-automation/ | AI网页自动化 |
| playwright | npm内置 | 浏览器控制 |

### 🔴 竞品/市场分析类
| Skill | 路径 | 用途 |
|-------|------|------|
| competitor-analyst | skills/competitor-analyst/ | 竞品分析 |
| market-research-agent | skills/market-research-agent/ | 市场调研 |
| deepresearchwork | skills/deepresearchwork/ | 深度研究 |
| ai-researcher | skills/ai-researcher/ | AI研究助手 |

### 🟢 记忆/知识类
| Skill | 路径 | 用途 |
|-------|------|------|
| neural-memory | skills/neural-memory/ | 神经记忆 |
| jpeng-knowledge-graph-memory | skills/jpeng-knowledge-graph-memory/ | 知识图谱记忆 |
| elite-longterm-memory | skills/elite-longterm-memory/ | 长期记忆 |

### 🟡 增强框架类
| Skill | 路径 | 用途 |
|-------|------|------|
| apex-stack-claude-code | skills/apex-stack-claude-code/ | APEX认知框架 |
| agent-swarm-ex | skills/agent-swarm-ex/ | 多Agent编排 |
| agentic-workflow-automation | skills/agentic-workflow-automation/ | 工作流自动化 |
| agent-autonomy-kit | skills/agent-autonomy-kit/ | 自主Agent框架 |
| agent-spawner | skills/agent-spawner/ | Agent生成器 |

### 🟣 Claude相关类
| Skill | 路径 | 用途 |
|-------|------|------|
| claude-api-cost-optimizer | skills/claude-api-cost-optimizer/ | API成本优化 |
| claude-code-claude-api-builder | skills/claude-code-claude-api-builder/ | API集成指南 |
| ezrouter | skills/ezrouter/ | 统一API网关 |
| call-claude-sonnet-4-agent | skills/call-claude-sonnet-4-agent/ | Agent模板 |

### 🔷 AI Agent类
| Skill | 路径 | 用途 |
|-------|------|------|
| manus-agent | skills/manus-agent/ | 通用AI Agent |

### ⚪ 其他类
| Skill | 路径 | 用途 |
|-------|------|------|
| api-tester | skills/api-tester/ | API测试工具 |
| agentgo-browser | skills/agentgo-browser/ | 云端浏览器 |

---

## Agent-Skill分配表

| Agent | 配置的Skill |
|-------|-----------|
| **douyin-agent** | browser-agent, ai-web-automation, ai-researcher |
| **xiaohongshu-agent** | browser-agent, ai-web-automation |
| **competitor-agent** | competitor-analyst, market-research-agent, deepresearchwork |
| **review-agent** | ai-researcher, deepresearchwork, elite-longterm-memory |
| **evolution-agent** | neural-memory, jpeng-knowledge-graph-memory, elite-longterm-memory, apex-stack-claude-code |
| **coordinator** | agent-swarm-ex, agentic-workflow-automation, agent-spawner |
| **主Agent** | 所有Skill可调用 |

---

## 使用方式

在Agent配置中引用Skill：
```markdown
## 配置的Skill
- skill-name - 用途
```

主Agent可直接读取所有Skill文件来获取指令。
