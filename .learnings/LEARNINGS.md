# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## 2026-04-09

### insight (best_practice)
**Pattern**: 多Agent系统架构设计
**内容**: 使用 sessions_spawn 创建独立子Agent，每个Agent职责单一，互不干扰，可以有效防止报错交叉
**来源**: multi-agent-research subagent
**See Also**: multi-agent/agents/**

### knowledge_gap
**Pattern**: Hermes Agent 研究
**内容**: Hermes 有 Context Compaction 自动压缩机制，将"发生了什么"和"接下来做什么"分离保存。我们的系统通过 self-improvement skill 手动实现类似功能
**来源**: 研究 NousResearch/hermes-agent

---

## 2026-04-10

### insight (best_practice)
**Pattern**: 验证哲学（Verification Agent 模式）
**内容**: Claude Code 的验证 Agent 有两个失败模式：1) 验证逃避（只读代码不运行），2) 被前80%迷惑。真正的验证必须：运行实际命令、用对抗性探测（并发、边界值、幂等性、孤立操作）、输出格式必须包含 Command run + Output observed + Result
**来源**: Claude Code verificationAgent.ts
**Why valuable**: 我们生成报告时也应该有类似机制——不仅检查"看起来对"，还要用真实数据验证

### insight (best_practice)
**Pattern**: 四类记忆分类（Memory Taxonomy）
**内容**: Claude Code 将记忆分为4类：user（用户偏好）、feedback（工作指导，分纠错+确认两种）、project（项目事件）、reference（外部资源指针）。关键细节：feedback要同时记录"纠正"和"确认成功"
**来源**: Claude Code memoryTypes.ts
**Why valuable**: 比我们当前的MEMORY.md混存模式更有条理，已应用到MEMORY.md

### insight (best_practice)
**Pattern**: 内置 Skill 命令系统
**内容**: Claude Code 有 /commit（安全git提交）、/review（PR审查）、/plan（规划）、/verify（验证）等内置命令。每个都是独立 Agent，Coordinator 可调度
**来源**: Claude Code commands/commit.ts, review.ts, planAgent.ts
**Why valuable**: 我们可以为营销系统创建 /日报、/竞品分析、/客流报告 等 Skill

### insight (best_practice)
**Pattern**: Hook 生命周期系统
**内容**: Claude Code 支持在 SessionStart/End、PreToolUse/PostToolUse、TaskCreated/Completed、SubagentStart/Stop 等生命周期节点执行 hook。这可以实现自动化的预验证/后处理
**来源**: Claude Code hooks.ts, types/hooks.ts
**Why valuable**: 我们可以用 PostCompact hook 在会话压缩后自动整理记忆

### insight (best_practice)
**Pattern**: MEMORY.md 行数限制
**内容**: Claude Code 限制 MEMORY.md 最多 200 行或 25KB，超出截断并警告。单个 entry 最多 ~200 字符，详细内容移到独立 topic 文件
**来源**: Claude Code memdir.ts
**Why valuable**: 防止记忆无限膨胀，已应用

### insight (best_practice)
**Pattern**: Entry 格式标准（rule + why + how）
**内容**: Claude Code 的 feedback memory 格式为：规则描述 → Why（原因）→ How to apply（何时何地应用）
**来源**: Claude Code memoryTypes.ts
**Why valuable**: 统一格式让记忆更容易被理解和应用，已应用

### insight (knowledge_gap)
**Pattern**: agenticSessionSearch 会话语义搜索
**内容**: Claude Code 能跨会话搜索历史，发现相关工作。搜索策略：1) Tag完全匹配 2) Tag部分匹配 3) 标题匹配 4) 摘要/内容匹配 5) 语义相似。不确定时优先包含
**来源**: Claude Code agenticSessionSearch.ts
**Why valuable**: 我们可以用类似机制让 AI 在做决策前先搜索历史经验

### insight (best_practice)
**Pattern**: Coordinator 多Agent编排模式
**内容**: Claude Code 的 Coordinator 模式：1个主脑 + 多个 Worker 并行。Worker 结果通过 `<task-notification>` XML 标签返回（不是普通消息）。可用 SendMessage 继续 Worker，TaskStopTool 停止跑偏的 Worker
**来源**: Claude Code coordinatorMode.ts
**Why valuable**: 我们可以用这个模式优化多数据源采集的协调

### insight (knowledge_gap)
**Pattern**: Claude Code Recovery 项目
**内容**: cc-recovered-main 是从 Claude Code cli.js.map 重建的项目（版本 2.1.88），可 npm install + build，能运行。有 vendor/ 目录存放兼容层的 shim 模块
**来源**: cc-recovered-main/README.md
**Why valuable**: 如果要深入研究某模块的具体实现，可以在这个恢复版中调试

---

## 2026-04-08

### best_practice
**Pattern**: 抖音指数数据采集
**内容**: 使用浏览器自动化抓取抖音指数，需要登录态。建议固定浏览器session避免重复登录
**来源**: 实际操作

### correction
**Pattern**: feishu sheet 权限
**内容**: feishu_sheet 工具需要 application:application:self_manage 权限，站长会在明天开放
**来源**: 飞书权限测试

---

## 飞书交互式卡片格式调试（2026-04-10）

### 核心教训
1. **正确格式**: schema:"2.0" + header + body.elements + tag:markdown
2. **禁止内容**: 代码块```、原生表格、图片
3. **content要求**: 直接写Markdown文本、标题、管道符表格

### ⚠️ 最关键教训：card参数 vs message参数
**问题**: 把卡片JSON放在message参数里 → 飞书显示原始JSON字符串
**解决**: JSON必须放`card`参数，message参数只放备用文本

**错误做法:**
```
message工具 action=send
- message: "{\"schema\": \"2.0\", ...整个JSON...}"  ← 显示原始JSON！
```

**正确做法:**
```
message工具 action=send
- message: "请查看卡片"
- card: {"schema": "2.0", "header": {...}, "body": {"elements": [...]}}
```

### 正确结构
```json
{
  "schema": "2.0",
  "header": {
    "title": {"tag": "plain_text", "content": "标题"},
    "template": "blue"
  },
  "body": {
    "elements": [
      {"tag": "markdown", "content": "内容（管道符表格）"}
    ]
  }
}
```

### 错误示范
- 把JSON放message参数 → 显示原始JSON
- content里有```代码块 → 渲染失败
- 使用原生table标签 → 400错误

### 已完成改进
- ✅ openclaw.json添加 renderMode: card
- ✅ 所有11个cron任务的payload指令已更新
- ✅ MEMORY.md已更新卡片发送规则
- ✅ feishu-card SKILL.md已更新

---

## Claude Code源码核心亮点（2026-04-10研读）

### 核心架构启发
1. **QueryEngine编排引擎** - 13000+行，核心调度中心
2. **上下文5级压缩** - Token减少85%，关键信息保留99%
3. **多智能体编排** - 子智能体独立上下文，并行处理
4. **Skill系统** - Markdown定义工作流，参数化模板
5. **7层安全防御** - 渐进式权限验证

### 对景区Agent的启发
- **任务编排**：借鉴QueryEngine模式，建立大脑协调层
- **记忆压缩**：MEMORY.md应分层压缩，只保留关键决策
- **渐进自动化**：先手动再自动，给用户控制权
- **工具扩展**：继续扩展Skill工具箱（竞品分析、客流报告等）

### 关键洞察
- AI产品需要"人在回路"，不是完全替代人
- 声明式优于命令式，配置化降低维护成本
- 技术债可接受，先验证价值再重构

---

## 用户重要反馈（2026-04-10 23:14）

### feedback (user)
**规则：** 重大隐患和设置更改必须先确认，禁止私自修改
**来源：** 用户明确指示
**How to apply：** 任何涉及系统配置变更、重大决策，必须先向用户确认再执行
