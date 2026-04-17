#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright

async def test_browser():
    async with async_playwright() as p:
        # Connect to Chrome CDP
        browser = await p.chromium.connect_over_cdp('http://localhost:9222')
        print('Connected to Chrome!')
        
        # Get existing pages or create new page
        if browser.contexts:
            context = browser.contexts[0]
            pages = context.pages
            if pages:
                page = pages[0]
                await page.bring_to_front()
                print(f'Page URL: {page.url}')
                print(f'Page Title: {await page.title()}')
        else:
            page = await browser.new_page()
            await page.goto('https://www.baidu.com')
            print(f'New Page Title: {await page.title()}')
        
        await browser.close()
        print('Done!')

asyncio.run(test_browser())
