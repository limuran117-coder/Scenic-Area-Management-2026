#!/usr/bin/env python3
"""
行业热点采集脚本 v4（完整版）
目标：每条资讯包含【标题 + 正文摘要 + 对电影小镇影响判断】

流程：
  1. Bing搜索7组关键词
  2. 取TOP20最相关URL
  3. 逐个访问URL，提取正文摘要
  4. 生成三段式格式输出
  5. 结果存入 /tmp/industry_news_full.json
"""

import json
import datetime
import asyncio
import re
import urllib.request
from playwright.async_api import async_playwright

# ─── 配置 ─────────────────────────────────────────
CDP_ENDPOINT = "http://127.0.0.1:18800"
OUTPUT_FILE = "/tmp/industry_news_full.json"
MAX_VISIT = 8          # 最多访问文章数
SEARCH_QUERIES = [
    "文旅行业热点 2026 五一",
    "景区营销案例 2026",
    "主题公园客流趋势 2026",
    "文旅部政策 2026",
    "沉浸式演出景区爆款",
]

文旅_KW = [
    "旅游", "文旅", "景区", "游客", "酒店", "OTA",
    "文旅部", "主题公园", "乐园", "文化", "演艺",
    "抖音", "小红书", "营销", "客流", "五一", "端午",
    "沉浸", "演出", "夜游", "打卡", "爆款", "网红",
    "度假", "旅行", "目的地", "游乐园",
]

# ─── 工具 ──────────────────────────────────────────
def clean_text(text):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()

def is_relevant(title, snippet=""):
    text = (title + " " + snippet).lower()
    for kw in 文旅_KW:
        if kw in text:
            return True
    return False

async def search_bing(page, query):
    results = []
    try:
        encoded = query.replace(" ", "+")
        url = f"https://www.bing.com/search?q={encoded}&setlang=zh-CN&cc=CN"
        await page.goto(url, timeout=20000, wait_until="domcontentloaded")
        await asyncio.sleep(3)
        items = await page.query_selector_all("li.b_algo")
        for item in items[:12]:
            try:
                title_el = await item.query_selector("h2 a")
                if not title_el:
                    continue
                title = await title_el.inner_text()
                href = await title_el.get_attribute("href") or ""
                snippet_el = await item.query_selector(".b_desc")
                snippet = ""
                if snippet_el:
                    s = await snippet_el.inner_text()
                    snippet = clean_text(s)[:200]
                if len(title) > 8 and href.startswith("http") and is_relevant(title, snippet):
                    results.append({
                        "title": title.strip(),
                        "url": href,
                        "snippet": snippet,
                        "source": "Bing搜索"
                    })
            except:
                pass
    except Exception as e:
        print(f"  [警告] Bing搜索失败: {e}", flush=True)
    return results

async def fetch_article_content(page, article):
    """访问文章URL，提取正文摘要（前500字）"""
    try:
        await page.goto(article["url"], timeout=15000, wait_until="domcontentloaded")
        await asyncio.sleep(2)
        text = await page.evaluate('document.body.innerText')
        text = clean_text(text)
        # 取前600字作为摘要
        summary = text[:600]
        # 清理开头（通常是导航/订阅等无用内容）
        for sep in ["↓ 我来说两句", "打开话题", "相关推荐", "热门内容", "相关阅读", "相关搜索"]:
            if sep in summary:
                summary = summary[:summary.index(sep)]
        return summary.strip()
    except Exception as e:
        return article.get("snippet", "")

def generate_analysis(article):
    """根据标题+摘要，自动生成对电影小镇的影响判断"""
    title = article.get("title", "")
    snippet = article.get("snippet", "")[:200]
    text = title + " " + snippet

    # 基于关键词的模式匹配
    if "AI" in text or "人工智能" in text or "智能" in text:
        return "AI技术降低内容生产成本，电影小镇可探索AI生成短视频/互动体验，降低营销成本"
    if "五一" in text or "端午" in text or "暑假" in text or "国庆" in text:
        return "节庆营销节点，需提前规划专题活动，提前2周启动预热"
    if "沉浸" in text or "演出" in text or "演艺" in text:
        return "沉浸式演艺是核心竞争力，电影小镇《穿越德化街》可结合热点做二次传播"
    if "小红书" in text or "抖音" in text or "打卡" in text:
        return "内容平台是主要获客渠道，加强KOC合作，提升景区UGC内容产出"
    if "客流" in text or "人次" in text or "入园" in text:
        return "客流数据直接影响营收，需持续监控并与竞品对比，适时调整营销力度"
    if "政策" in text or "文旅部" in text or "补贴" in text:
        return "关注政策红利，如夜游补贴/文旅专项债，可主动申报获取支持"
    if "趋势" in text or "报告" in text or "数据" in text:
        return "行业报告反映大方向，可作为季度策略调整参考"
    if "营销" in text or "推广" in text or "品牌" in text:
        return "优秀营销案例可借鉴，但需结合电影小镇调性，避免同质化"
    if "爆款" in text or "出圈" in text or "热搜" in text:
        return "热点事件可借势营销，快速响应制作相关内容，抢占流量窗口"
    if "竞品" in text or "万岁山" in text or "清明上河园" in text or "只有河南" in text:
        return "竞品动态需持续追踪，分析其内容策略，取长补短"
    return "该内容与电影小镇运营存在关联，建议结合实际情况参考"

# ─── 主流程 ─────────────────────────────────────────
async def main():
    print(f"📡 行业热点采集开始 ({datetime.date.today()})", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(CDP_ENDPOINT)
        page = await browser.new_page()

        # Step1: Bing搜索
        print("  [1/3] Bing搜索...", flush=True)
        all_results = []
        seen = set()
        for query in SEARCH_QUERIES:
            print(f"    搜: {query[:25]}...", end="", flush=True)
            results = await search_bing(page, query)
            for r in results:
                key = r["title"][:20]
                if key not in seen:
                    seen.add(key)
                    all_results.append(r)
            print(f" +{len(results)}条", flush=True)
            await asyncio.sleep(2)

        print(f"    → Bing共获得 {len(all_results)} 条", flush=True)

        # Step2: 访问TOP文章提取摘要
        print(f"  [2/3] 访问TOP{MAX_VISIT}篇文章提取摘要...", flush=True)
        articles_to_visit = all_results[:MAX_VISIT]
        for i, article in enumerate(articles_to_visit):
            print(f"    [{i+1}/{MAX_VISIT}] {article['title'][:40]}...", end="", flush=True)
            content = await fetch_article_content(page, article)
            article["content"] = content
            article["analysis"] = generate_analysis(article)
            print(f" ✓", flush=True)
            await asyncio.sleep(2)

        # 补充其余文章的分析（无正文但有snippet）
        for article in all_results[MAX_VISIT:]:
            if "content" not in article:
                article["content"] = article.get("snippet", "")
                article["analysis"] = generate_analysis(article)

        await browser.close()

    # Step3: 整理输出
    print(f"  [3/3] 整理输出...", flush=True)
    result = {
        "date": datetime.date.today().strftime("%Y-%m-%d"),
        "crawled_at": datetime.datetime.now().isoformat(),
        "total": len(all_results),
        "articles": all_results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 完成！共处理 {len(all_results)} 条", flush=True)
    for a in all_results[:5]:
        print(f"  [{a['source']}] {a['title'][:45]}", flush=True)
        print(f"    摘要: {a.get('content','')[:80]}...", flush=True)

    return result

if __name__ == "__main__":
    asyncio.run(main())
