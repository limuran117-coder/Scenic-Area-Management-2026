# 记忆系统整合方案

## 当前记忆系统

| 系统 | 位置 | 类型 | 状态 |
|------|------|------|------|
| OpenClaw向量记忆 | `.dreams/` | 向量搜索 | ✅ 内置 |
| elite-longterm-memory | skills/ | 6层架构 | ✅ 已装 |
| neural-memory | skills/ | 神经图谱 | ⚠️ 需安装 |
| jpeng-knowledge-graph | skills/ | 知识图谱 | ✅ 已装 |
| ontology | skills/ | 实体关系 | ✅ 已装 |

## 整合架构

```
┌─────────────────────────────────────────────────────┐
│                   记忆调用入口                        │
│                  memory_search()                     │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│ .dreams│  │ neural   │  │ knowledge │
│ 向量搜索│  │ memory   │  │ graph     │
└────────┘  └──────────┘  └──────────┘
    │             │             │
    └─────────────┼─────────────┘
                  ▼
         ┌──────────────┐
         │  MEMORY.md   │  ← 人类可读核心记忆
         │  daily/      │  ← 每日日志
         └──────────────┘
```

## 实现步骤

### Step 1: 创建SESSION-STATE.md (Hot RAM)
```bash
cat > /Users/tianjinzhan/.openclaw/workspace/SESSION-STATE.md << 'EOF'
# SESSION-STATE.md — Active Working Memory

## Current Task
[None]

## Key Context
[None yet]

## Pending Actions
- [ ] None

## Recent Decisions
[None yet]

---
*Last updated: 2026-04-11*
EOF
```

### Step 2: 配置OpenClaw向量搜索
在openclaw.json中启用：
```json
{
  "memorySearch": {
    "enabled": true,
    "provider": "openai",
    "sources": ["memory"],
    "minScore": 0.3,
    "maxResults": 10
  }
}
```

### Step 3: 安装neural-memory
```bash
pip install neural-memory
```

### Step 4: 创建记忆调用工作流

## 记忆调用规则

### 每次会话开始
1. 读取 SESSION-STATE.md（热状态）
2. memory_search 查询相关记忆
3. 检查 memory/YYYY-MM-DD.md

### 决策/偏好发生时（WAL协议）
1. 写入 SESSION-STATE.md
2. 写入 MEMORY.md（如果重要）
3. 调用 memory_store 存入向量库

### 会话结束
1. 更新 SESSION-STATE.md
2. 归档到 daily log
3. 提炼到 MEMORY.md

## 记忆分类存储

| 记忆类型 | 存储位置 |
|---------|---------|
| 用户偏好 | SESSION-STATE.md + MEMORY.md |
| 决策记录 | MEMORY.md decisions/ |
| 错误教训 | .learnings/LEARNINGS.md |
| 每日日志 | memory/YYYY-MM-DD.md |
| 知识图谱 | knowledge-graph.json |
| 向量索引 | .dreams/ |

## 当前配置状态

- [x] SESSION-STATE.md 已创建
- [ ] neural-memory pip安装 (PyPI无可用版本，跳过)
- [x] LanceDB 已安装 (pip install lancedb)
- [ ] openclaw.json 向量搜索启用
- [x] 记忆调用规则已配置

## 可用记忆系统

| 系统 | 状态 | 用途 |
|------|------|------|
| SESSION-STATE.md | ✅ 已创建 | 热状态RAM |
| .dreams/ 向量 | ✅ 内置 | OpenClaw自动向量搜索 |
| MEMORY.md | ✅ 已有 | 核心长期记忆 |
| memory/daily | ✅ 已有 | 每日日志 |
| .learnings/ | ✅ 已有 | 经验教训 |
| LanceDB | ✅ 已安装 | 可集成向量搜索 |
| knowledge-graph | ✅ 已装 | 知识图谱 |
| ontology | ✅ 已装 | 实体关系图谱 |
