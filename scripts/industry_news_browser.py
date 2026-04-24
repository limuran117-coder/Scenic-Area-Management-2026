#!/usr/bin/env python3
"""
行业热点浏览器采集脚本 v2
策略：36氪站内搜索 + 百度搜索，直接命中文旅相关
使用 Playwright + CDP (port 18800)
"""

import json
import datetime
import asyncio
import re

async def search_36kr(page, keyword, max_results=5):
    """在36氪搜索指定关键词，返回文章标题+摘要"""
    results = []
    try:
        url = f"https://www.36kr.com/search/articles/{keyword}"
        await page.goto(url, timeout=20000, wait_until="domcontentloaded")
        await asyncio.sleep(4)

        # 等文章卡片加载
        cards = await page.query_selector_all(".search-result-item, .article-item, .kr-search-result-item")
        if not cards:
            # 降级：找所有链接
            links = await page.query_selector_all("a")
            cards = []
            for link in links:
                href = await link.get_attribute("href") or ""
                if "/p/" in href and "36kr.com" in (href or ""):
                    text = await link.inner_text() or ""
                    if len(text) > 10:
                        cards.append(link)

        for card in cards[:max_results]:
            try:
                text = await card.inner_text() or ""
                href = await card.get_attribute("href") or ""
                if href.startswith("//"):
                    href = "https:" + href
                elif href.startswith("/"):
                    href = "https://www.36kr.com" + href
                text = text.strip().replace("\n", " ")[:200]
                if text and len(text) > 10:
                    results.append({"title": text, "url": href, "source": "36氪"})
            except:
                pass
    except Exception as e:
        print(f"[警告] 36氪搜索失败: {e}", flush=True)
    return results

async def search_baidu(page, keyword, max_results=5):
    """百度搜索"""
    results = []
    try:
        encoded = keyword.replace(" ", "+")
        url = f"https://www.baidu.com/s?wd={encoded}&rn=10"
        await page.goto(url, timeout=20000, wait_until="domcontentloaded")
        await asyncio.sleep(3)

        items = await page.query_selector_all("h3 a, .c-title a")
        for item in items[:max_results]:
            try:
                text = await item.inner_text() or ""
                href = await item.get_attribute("href") or ""
                if text and len(text) > 10:
                    results.append({"title": text.strip(), "url": href, "source": "百度"})
            except:
                pass
    except Exception as e:
        print(f"[警告] 百度搜索失败: {e}", flush=True)
    return results

async def main():
    from playwright.async_api import async_playwright

    today = datetime.date.today().strftime("%Y-%m-%d")
    print(f"📡 行业热点采集... ({today})", flush=True)

    # 搜索关键词组合
    search_queries = [
        "文旅行业热点 2026",
        "景区营销案例 五一",
        "主题公园游客趋势",
        "文旅部政策公告",
        "沉浸式演出景区",
    ]

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:18800")
        context = await browser.new_context()
        page = await context.new_page()

        all_results = []
        seen_titles = set()

        for query in search_queries:
            print(f"  搜索: {query}...", flush=True)

            # 36氪搜索
            kr_results = await search_36kr(page, query)
            for r in kr_results:
                key = r["title"][:30]
                if key not in seen_titles:
                    seen_titles.add(key)
                    all_results.append(r)

            # 百度搜索
            bd_results = await search_baidu(page, query)
            for r in bd_results:
                key = r["title"][:30]
                if key not in seen_titles:
                    seen_titles.add(key)
                    all_results.append(r)

            await asyncio.sleep(2)

        await page.close()
        await context.close()
        await browser.close()

    result = {
        "date": today,
        "crawled_at": datetime.datetime.now().isoformat(),
        "total": len(all_results),
        "articles": all_results[:15]
    }

    output_path = "/tmp/industry_news.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 完成，共 {len(all_results)} 条", flush=True)
    for a in all_results[:8]:
        print(f"  [{a['source']}] {a['title'][:60]}", flush=True)

    return result

if __name__ == "__main__":
    asyncio.run(main())
