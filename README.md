# 🎬 Scenic Area Marketing Agent

> An AI-powered marketing operations agent for scenic area management, featuring multi-platform data monitoring, competitor analysis, and passenger flow insights.

[English](#features) | [核心能力](#核心能力) | [Wiki架构](#wiki架构) | [技术栈](#技术栈)

---

## 重大更新 2026-04-25

### karpathy-wiki 知识层重组完成

Wiki 架构从「文档仓库」升级为「知识图谱」，按 karpathy-wiki 标准分层：

| 层级 | 目录 | 内容 |
|------|------|------|
| **知识抽象层** | concepts/ | 11个概念（演艺景区/内容爆款规律/情绪营销/季节性客流…） |
| **知识抽象层** | entities/ | 10个实体（电影小镇+7竞品+抖音/小红书平台） |
| **知识抽象层** | sources/ | 5个源文档摘要（穿越德化街数据/抖音指数追踪/客流营收…） |
| **知识抽象层** | queries/ | 4个有价值问答归档 |
| **业务执行层** | 电影小镇/ | 每日客流/演出数据（不动） |
| **业务执行层** | 竞品分析/ | 每日追踪数据（不动） |
| **业务执行层** | 全国景区案例库/ | 爆款案例按周归档（不动） |

**重组原则**：纯添加不修改不删除，业务层原封不动，知识层可完全重建。

**详见**：[wiki/overview.md](wiki/overview.md) · [wiki/schema.md](wiki/schema.md) · [queries/2026-04-25-Wiki重组决策.md](wiki/queries/2026-04-25-Wiki重组决策.md)

---

## 重大更新 2026-04-24

### 日报SOP全面标准化（13个任务全部专属SOP）

**根因修复**：cron isolated session 不自动加载 wiki，导致 SOP 规则无法落地。

**修复方案**：每个 cron prompt 第一步强制读对应 SOP 文件。

新建专属 SOP 文件：
- `wiki/SOP/抖音指数日报.md` — 订阅页Tab2 + 关键词页Tab4，4板块格式
- `wiki/SOP/小红书日报.md` — 灵犀后台 + 关键词笔记搜索Tab6
- `wiki/SOP/竞品爆款拆解.md` — 四平台深度拆解，触发条件 + 落地建议
- `wiki/SOP/竞品内容动态.md` — 8大竞品追踪，3板块格式
- `wiki/SOP/每日复盘整合.md` — 任务执行/数据发现/问题/改进建议
- `wiki/SOP/案例库更新.md` — 仅写 wiki，不发群
- `wiki/SOP/Wiki健康检查.md` — karpathy-wiki LINT
- `wiki/SOP/代码库Wiki漂移检查.md` — karpathy-project-wiki LINT

---

## 重大更新 2026-04-22

### 年度目标调增：132万→153万
- YTD 51.1万，完成度33.4%（时间进度37.5%，滞后4.1pp）
- 散客/渠道结构：散客占85%+，渠道为淡季补充

### 穿越德化街深度分析完成（数据里程碑）
基于《穿越德化街》数据分析-4.16v4(1).xlsx全部5个子表格：
- **扩建分界线：2025-01-01正式运营**，2024年10-12月扩建施工，数据不可比
- **2025年质变：** 入园133.8万(-15%)但转化率35.2%(+17.2pp)，观演47.1万(+65.8%)，演出收入4266万(+35.9%)
- **客单价：** 套票101.59元 / 德化街39.54元 / 加购52.80元
- **六大洞察：** 扩建悖论 / 平日>大假 / 国庆入园崩-41% / ⚠️2026Q1加购占比超50%预警 / 8月vs10月差异逻辑 / 受众画像
- **文档：** `wiki/电影小镇/演出节目/穿越德化街.md`

---

## Features

### 📊 Daily Automated Reports
| Report | Time | Content |
|--------|------|---------|
| Douyin Index Daily | 08:00 | 8 scenic areas ranked by search & synthesis index |
| Travel Hotspots | 10:00 | Nationwide travel industry trends |
| Competitor Case Studies | 12:00 | 爆款 Content analysis across scenic areas |
| Industry Trends | 14:00 | Tourism sector news & policies |
| Weekly Passenger Insights | Mon 09:00 | 散客/渠道 Structure + monthly progress |

### 🔍 Core Capabilities
- **Douyin Platform Monitoring** — Real-time index tracking for 8 competitor scenic areas
- **Xiaohongshu Analytics** — 灵犀后台 data (search volume, 笔记 insights, crowd profiling)
- **Passenger Flow Analysis** — 散客 vs 渠道 Structure, historical comparison, weather correlation
- **Competitor Deep Dive** — 竞品深度分析 SOP: 4 platforms × standard flow
- **Case Library** — Nationwide scenic area marketing case studies (updated weekly)
- **Knowledge Graph** — karpathy-wiki structure: concepts/entities/sources/queries/

---

## Wiki架构

### karpathy-wiki 标准结构

```
wiki/
├── index.md              # 内容总目录（知识层+业务层）
├── overview.md          # 全域知识总览 🆕
├── schema.md            # wiki编写规范 🆕
├── log.md               # 追加式操作日志
├── concepts/            # 概念页（11个）🆕
│   ├── 演艺景区.md
│   ├── 内容爆款规律.md
│   ├── 情绪营销.md
│   ├── 季节性客流规律.md
│   ├── 景区营销漏斗.md
│   ├── 景区抖音运营.md
│   ├── 景区小红书运营.md
│   ├── 内容发布节奏.md
│   ├── ROI分析.md
│   ├── 景区类型.md
│   └── 平台算法规则.md
├── entities/            # 实体页（10个）🆕
│   ├── 建业电影小镇.md
│   ├── 万岁山武侠城.md
│   ├── 只有河南.md
│   ├── 清明上河园.md
│   ├── 银基动物王国.md
│   ├── 郑州方特欢乐世界.md
│   ├── 大唐不夜城.md
│   ├── 只有红楼梦戏剧幻城.md
│   ├── 抖音平台.md
│   └── 小红书平台.md
├── sources/             # 源文档摘要（5个）🆕
│   ├── 穿越德化街数据分析.md
│   ├── 抖音指数追踪日报.md
│   ├── 竞品深度档案.md
│   ├── 客流营收历年分析.md
│   └── 2026-04-25Wiki重组.md
├── queries/             # 问答归档（4个）🆕
│   ├── 2026-04-25-Wiki重组决策.md
│   ├── 知识层与业务层关系.md
│   ├── 抖音与小红书平台差异.md
│   └── 旧目录与知识层重叠分析.md
├── 电影小镇/            # 业务执行层（不动）
├── 竞品分析/            # 业务执行层（不动）
├── 全国景区案例库/       # 业务执行层（不动）
├── 行业知识/            # 业务执行层（不动）
├── SOP/                 # 业务执行层（不动）
└── 技术配置/            # 业务执行层（不动）
```

### 知识层 vs 业务层

| 层级 | 回答问题 | 维护方式 |
|------|---------|---------|
| **知识层**（concepts/entities/sources/queries/） | 为什么/是什么/有什么关系 | INGEST时提炼，一次写入 |
| **业务层**（电影小镇/竞品分析/…） | 做什么/怎么做/什么数据 | cron任务直接写入 |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| AI Agent | OpenClaw + MiniMax-M2.7 |
| Knowledge Base | Obsidian Vault + karpathy-wiki |
| Browser Automation | CDP (Chrome DevTools Protocol) — stabilized 2026-04-20 |
| Data Sources | Douyin Creator Hub · Xiaohongshu 灵犀 · Feishu Bitable · Baidu |
| Scheduled Tasks | Cron (automated jobs) |
| Memory System | Multi-tier: daily logs → weekly dreaming → long-term MEMORY.md |

---

## Repository Structure

```
wiki/
├── concepts/                     # 🆕 11个知识概念
├── entities/                    # 🆕 10个实体（景区/平台）
├── sources/                     # 🆕 5个源文档摘要
├── queries/                     # 🆕 4个问答归档
├── overview.md                  # 🆕 全域知识总览
├── schema.md                    # 🆕 wiki编写规范
├── 电影小镇/                    # 景区核心数据
├── 竞品分析/                    # 7大竞品数据追踪
├── 全国景区案例库/               # 爆款案例（按周归档）
├── SOP/                        # 标准化操作流程
└── 技术配置/                    # Browser/CDP/Skills配置

scripts/
├── douyin_index_v9.py           # 抖音指数采集
├── xiaohongshu_crawl.py        # 小红书数据采集
└── send_feishu_card.py         # 飞书卡片发送

memory/
└── YYYY-MM-DD.md               # 每日会话日志
```

---

## 核心竞品关键词

建业电影小镇 · 万岁山武侠城 · 清明上河园 · 只有河南戏剧幻城 · 郑州方特欢乐世界 · 郑州海昌海洋公园 · 郑州银基动物王国 · 只有红楼梦戏剧幻城

---

## License

MIT License

---

> Built with [OpenClaw](https://github.com/openclaw/openclaw) · Powered by [MiniMax](https://minimax.io/)
