# 日报协调工作流

## 概述
这是日报系统的主协调工作流。由主Agent（我）执行，负责：
1. 读取各专业Agent的定义
2. 并行派发任务给各Agent
3. 收集汇总结果
4. 生成完整日报
5. 发送飞书消息

---

## Agent定义路径

```
~/.openclaw/workspace/multi-agent/agents/
├── douyin-agent.md         # 抖音指数Agent
├── xiaohongshu-agent.md   # 小红书数据Agent
├── competitor-agent.md     # 竞品动态监控Agent
├── passenger-agent.md      # 客流数据分析Agent（未来）
└── revenue-agent.md        # 收入分析Agent（未来）
```

---

## 执行流程

### 阶段1：并行数据采集（当前已上线）
并行spawn以下Agent：
- **抖音指数Agent** → 采集抖音指数数据
- **小红书Agent** → 采集小红书UGC数据
- **竞品监控Agent** → 采集竞品动态

### 阶段2：数据汇总（当前已上线）
汇总各Agent返回结果，生成结构化日报

### 阶段3：飞书推送（当前已上线）
将日报发送给飞书群：oc_2581c03b79e4893cc3616b253d60f34e

---

## Agent响应格式规范

每个Agent返回时必须遵循以下格式：

```
## [Agent名称] 结果

### 数据摘要
（具体数据内容）

### 简要分析
（2-3句话分析）

### 状态
- 状态：成功/部分成功/失败
- 数据完整度：100%/80%/50%/0%
- 备注：（如有数据缺失或异常）
```

---

## 错误隔离机制

- 每个Agent独立运行，互不干扰
- 单个Agent失败不影响其他Agent继续执行
- 失败的Agent输出"数据暂不可用"
- 主Agent汇总时跳过失败数据，继续生成报告

---

## 日报输出模板

```
📊 [日期] 日报 | [星期]

━━━━━━━━━━━━━━━━━━━━

## 一、抖音指数
（各景区搜索/综合指数对比）

## 二、小红书UGC数据
（新发笔记、爆款、舆情）

## 三、竞品动态
（各竞品近期动向）

## 四、综合结论
（优势/劣势/策略建议）

━━━━━━━━━━━━━━━━━━━━
数据来源：抖音指数、小红书、公开数据
```

---

## 使用方式

主Agent调用时：
```
1. 读取各Agent定义文件
2. 并行执行 sessions_spawn
3. 等待所有Agent返回
4. 按模板汇总
5. 调用 message 发送飞书
```

---

## 扩展说明

### 添加新Agent
1. 在 agents/ 目录创建新的 [name]-agent.md
2. 定义角色、数据源、输出格式
3. 在spawn时指定该文件内容作为prompt

### 当前状态
- ✅ douyin-agent     # 已上线
- ✅ xiaohongshu-agent # 已上线
- ✅ competitor-agent  # 已上线
- 🔄 passenger-agent  # 待接入客流Excel
- 🔄 revenue-agent    # 待接入营收数据
- ⏳ 其他扩展Agent     # 未来可添加
