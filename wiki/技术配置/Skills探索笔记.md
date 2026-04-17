# Skills 探索笔记

> 记录新发现/测试的技能，每周更新
> 最后更新：2026-04-18

---

## 2026-W16 探索记录

### 1. agent-swarm（多智能体集群编排）✅ 已深入研究

**定位：** 多智能体团队指挥官，适合复杂任务拆解并行执行

**核心能力：**
- 9种专业角色（pm/researcher/coder/writer/designer/analyst/reviewer/assistant/automator）
- 支持并行+串行混合编排
- 经验记忆积累机制
- 模型成本优化分配

**适用场景：**
- 竞品深度调研（并行抓取多个竞品）
- 多维度日报生成（数据+文案+图表分工）
- 复杂项目规划与审核链路

**关键语法：**
```javascript
sessions_spawn({
  task: "具体任务",
  agentId: "researcher", // 指定角色
  label: "task-name",
  runTimeoutSeconds: 300
})
```

**注意：** 该技能需要子Agent配置，当前主要用 sessions_spawn 做并行调研

---

### 2. knowledge-graph-memory（知识图谱记忆）✅ 已深入研究

**定位：** 结构化长期记忆，支持概念漂移检测和时间推理

**核心能力：**
- 知识图谱：节点（概念）+ 边（关系）
- 概念漂移检测：ADWIN/DDM/统计方法
- 时间推理：事件追踪、时间范围查询
- 记忆整合：短时→长时自动晋升

**适用场景：**
- 建立景区运营知识图谱（竞品/用户/内容关系）
- 长期跟踪概念变化（如竞品热度趋势）
- 复杂知识结构化存储

**关键API：**
```javascript
const kg = new KnowledgeGraph();
kg.addConcept('电影小镇', { category: '景区' });
kg.link('电影小镇', '建业', 'owns');
kg.getRelated('电影小镇');
```

**注意：** 是JS库，需要Node环境；更适合知识库构建而非日常日报

---

## 后续探索计划

- [ ] gemini-computer-use（Gemini浏览器控制）
- [ ] apex-stack-claude-code（APEX认知框架）
- [ ] agentic-workflow-automation（工作流自动化）
- [ ] deep-research（深度研究框架）

---

*由 AI Agent 维护 | 随周度探索更新*
