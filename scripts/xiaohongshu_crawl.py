#!/usr/bin/env python3
"""
小红书数据采集脚本
使用Playwright + 代理 + Cookie采集数据

景区列表：
1. 建业电影小镇
2. 万岁山武侠城
3. 清明上河园
4. 只有河南戏剧幻城
5. 郑州方特欢乐世界
6. 郑州海昌海洋公园
7. 郑州银基动物王国
8. 只有红楼梦戏剧幻城

输出：/tmp/crawl_xhs_unified.json
Cookie存储：/tmp/xiaohongshu_cookies.json
"""

import json
import datetime
import asyncio
import os
import re
import random
import subprocess
from playwright.async_api import async_playwright

def cleanup_stale_browsers():
    """采集前清理残留的 browser-use daemon 进程，避免资源臃肿"""
    try:
        subprocess.run(['pkill', '-9', '-f', 'browser_use.skill_cli.daemon'], 
                      capture_output=True, timeout=5)
        subprocess.run(['pkill', '-9', '-f', 'playwright'], 
                      capture_output=True, timeout=5)
        print("[清理] 已清除残留 browser-use/playwright 进程")
    except Exception as e:
        print(f"[清理] 清理残留进程时出错（忽略）: {e}")

# 景区关键词列表
SCENIC_SPOTS = [
    "建业电影小镇",
    "万岁山武侠城",
    "清明上河园",
    "只有河南戏剧幻城",
    "郑州方特欢乐世界",
    "郑州海昌海洋公园",
    "郑州银基动物王国",
    "只有红楼梦戏剧幻城"
]

COOKIE_FILE = "/tmp/xiaohongshu_cookies.json"
PROXY = {"server": "http://127.0.0.1:7897"}

def random_delay(min_sec=1, max_sec=3):
    """生成随机延迟，模拟人类操作间隔"""
    return random.uniform(min_sec, max_sec)

async def load_cookies(context):
    """加载Cookie"""
    if os.path.exists(COOKIE_FILE):
        with open(COOKIE_FILE, 'r', encoding='utf-8') as f:
            cookies = json.load(f)
        await context.add_cookies(cookies)
        print(f"已加载Cookie: {len(cookies)}个")
        return True
    return False

async def search_keyword(page, keyword):
    """搜索关键词（已降速防AI检测）"""
    try:
        # 访问小红书搜索页面
        search_url = f"https://www.xiaohongshu.com/search_result?keyword={keyword}&source=web_explore_feed"
        await page.goto(search_url, timeout=30000)
        await page.wait_for_load_state("domcontentloaded", timeout=10000)
        
        # 人类操作：随机延迟2-5秒，模拟阅读页面
        await asyncio.sleep(random_delay(2, 5))
        
        # 滚动页面（人类不会一上来就看完）
        await page.evaluate("window.scrollBy(0, 300)")
        await asyncio.sleep(random_delay(1, 3))
        
        # 获取页面内容
        content = await page.content()
        text = await page.inner_text('body')
        
        # 提取笔记数量等简单信息
        notes_count = 0
        likes_count = 0
        
        # TODO: 根据实际页面结构调整解析逻辑
        # 简化处理
        print(f"  已访问: {keyword}")
        
        return {
            "keyword": keyword,
            "notes_count": notes_count,
            "likes_count": likes_count,
            "content_length": len(content)
        }
    except Exception as e:
        print(f"  失败: {e}")
        return {"keyword": keyword, "error": str(e)}

async def crawl_xiaohongshu():
    """采集小红书数据"""
    results = []
    
    # 采集前先清理残留进程
    cleanup_stale_browsers()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            proxy=PROXY
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        # 加载Cookie
        await load_cookies(context)
        
        page = await context.new_page()
        
        print("开始采集小红书数据...")
        
        for spot in SCENIC_SPOTS:
            result = await search_keyword(page, spot)
            results.append(result)
            # 每个关键词搜索后随机等待3-8秒，模拟人类操作
            await asyncio.sleep(random_delay(3, 8))
        
        await browser.close()
    
    return results

def save_data(data, filepath="/tmp/crawl_xhs_unified.json"):
    """保存数据"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"数据已保存: {filepath}")

async def main():
    print("=" * 50)
    print("小红书数据采集")
    print("=" * 50)
    
    results = await crawl_xiaohongshu()
    
    output = {
        "date": datetime.date.today().strftime("%Y-%m-%d"),
        "crawled_at": datetime.datetime.now().isoformat(),
        "data_source": "小红书",
        "results": results
    }
    
    save_data(output)
    print("采集完成!")
    return output

if __name__ == "__main__":
    asyncio.run(main())
