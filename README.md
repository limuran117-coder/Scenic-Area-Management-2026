# 🎬 Scenic Area Marketing Agent

> An AI-powered marketing operations agent for scenic area management, featuring multi-platform data monitoring, competitor analysis, and passenger flow insights.

[中文说明](#中文说明) | [Features](#features) | [Tech Stack](#tech-stack) | [Repository Structure](#repository-structure)

---

## Features

### 📊 Daily Automated Reports
| Report | Time | Content |
|--------|------|---------|
| Douyin Index Daily | 08:00 | 8 scenic areas ranked by search & synthesis index |
| Travel Hotspots | 10:00 | Nationwide travel industry trends |
| Competitor Case Studies | 12:00 |爆款Content analysis across scenic areas |
| Industry Trends | 14:00 | Tourism sector news & policies |
| Weekly Passenger Insights | Mon 09:00 |散客/渠道Structure + monthly progress |

### 🔍 Core Capabilities
- **Douyin Platform Monitoring** — Real-time index tracking for 8 competitor scenic areas
- **Xiaohongshu Analytics** — 灵犀后台 data (search volume,笔记 insights, crowd profiling)
- **Passenger Flow Analysis** —散客 vs 渠道Structure, historical comparison, weather correlation
- **Competitor Deep Dive** — Weekly keyword analysis across 4 data platforms
- **Case Library** — Nationwide scenic area marketing case studies

### 🎯 Marketing Intelligence
- **Content Strategy** — UGC/KOL trends, POV/互动挑战 formats
- **Crowd Profiling** — Demographic insights from Douyin + Xiaohongshu
- **舆情 Monitoring** — Sentiment tracking and crisis alerts
- **Seasonal Patterns** — Spring Festival/Summer/National Day peak analysis

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| AI Agent | OpenClaw + MiniMax-M2.7 |
| Knowledge Base | Obsidian Vault + LLMWiki |
| Browser Automation | CDP (Chrome DevTools Protocol) |
| Data Sources | Douyin Creator Hub · Xiaohongshu 灵犀 · Feishu Bitable |
| Scheduled Tasks | Cron (16 automated jobs) |
| Memory System | Multi-tier: daily logs → weekly dreaming → long-term MEMORY.md |

---

## Repository Structure

```
wiki/
├── 电影小镇/                    # 景区核心数据
│   ├── 基础档案.md              # 年度目标/配置
│   ├── 战略框架.md              # SWOT/渠道策略
│   ├── 人群画像.md              # 人群画像/关联词
│   ├── 历史数据/                # 历年客流营收
│   │   ├── 客流营收分析.md      # 月度/年度汇总
│   │   ├── 规律洞察.md          # 散客/渠道/季节性规律
│   │   ├── 2023年/数据.md
│   │   ├── 2024年/数据.md
│   │   ├── 2025年/数据.md
│   │   └── 2026年/数据.md
│   └── 运营方法/                # SOP文档
│       ├── 抖音运营方法.md
│       ├── 小红书运营方法.md
│       └── 小红书灵犀后台运营方法.md
├── 竞品分析/                    # 7大竞品数据追踪
│   ├── 抖音指数每日追踪.md
│   ├── 竞品深度档案.md
│   └── 清明上河园深度分析.md
├── 全国景区案例库/               # 爆款案例（按周归档）
│   ├── 万岁山武侠城标杆.md       # 王婆说媒/假大象
│   ├── 只有河南排队情景剧.md
│   └── ...
├── SOP/                        # 标准化操作流程
│   ├── 飞书卡片视觉规范.md
│   ├── 周度客流营收洞察报告.md
│   └── 文旅活动热点追踪日报.md
└── 技术配置/                    # Browser/CDP/Skills配置
    ├── 浏览器操作规范.md
    └── 搜索关键词规范.md

scripts/                        # 自动化脚本
├── douyin_index_v9.py           # 抖音指数采集
├── cdp_keyword_deep.py          # 关键词深度分析
├── xiaohongshu_crawl.py        # 小红书数据采集
└── sync_obsidian_daily.py       # Feishu → Wiki同步
```

---

## Data Architecture

```
┌─────────────────────────────────────────┐
│  Data Sources (Daily Auto-Sync)         │
│  • Douyin Creator Hub → 抖音指数        │
│  • Xiaohongshu 灵犀 → 搜索/内容/人群    │
│  • Feishu Bitable → 客流数据            │
└────────────────┬────────────────────────┘
                 │ 05:00 Daily Sync
                 ▼
┌─────────────────────────────────────────┐
│  Obsidian Wiki Knowledge Base            │
│  • 38+ interconnected notes           │
│  • 4-year historical comparison        │
│  •散客/渠道Structure tracking          │
└────────────────┬────────────────────────┘
                 │ AI Agent Processing
                 ▼
┌─────────────────────────────────────────┐
│  Feishu Group Delivery                 │
│  • 08:00 抖音指数日报                  │
│  • 10:00 文旅热点追踪                  │
│  • Mon 09:00 周度客流洞察             │
│  • 21:00 竞品爆款拆解                 │
└─────────────────────────────────────────┘
```

---

## 中文说明

本仓库是**建业电影小镇**景区营销中心的AI运营助手，基于OpenClaw框架构建。

### 核心功能
- **抖音指数监测** — 每日08:00追踪8大竞品景区排名
- **小红书运营** — 灵犀后台替代爬虫，获取搜索/内容/人群数据
- **客流营收分析** — 散客/渠道结构拆分，历年同期对比
- **竞品深度分析** — 每日15:00四平台全量数据采集
- **案例库积累** — 全国景区爆款营销案例学习

### 数据来源
- 抖音创作者平台（指数/关键词/人群画像）
- 小红书灵犀后台（搜索量/笔记/趋势）
- 飞书多维表格（客流/营收/渠道）
- 历年数据：桌面 `2023-2025年门票销售及客流统计数据表.xlsx`

### 8大竞品关键词
建业电影小镇 | 万岁山武侠城 | 清明上河园 | 只有河南戏剧幻城 | 郑州方特欢乐世界 | 郑州海昌海洋公园 | 郑州银基动物王国 | 只有红楼梦戏剧幻城

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

> Built with [OpenClaw](https://github.com/openclaw/openclaw) · Powered by [MiniMax](https://minimax.io/)
