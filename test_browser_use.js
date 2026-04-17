import { chromium } from 'browser-use';

(async () => {
  console.log('Connecting to Chrome...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  console.log('Connected!');
  
  const context = browser.contexts()[0];
  if (!context) {
    console.log('No context, creating new page...');
    const page = await browser.newPage();
    await page.goto('https://www.baidu.com');
    console.log('Page title:', await page.title());
  } else {
    console.log('Existing context found');
    const pages = context.pages();
    if (pages.length > 0) {
      console.log('Existing pages:', pages.length);
      await pages[0].bringToFront();
      console.log('Page title:', await pages[0].title());
    }
  }
  
  await browser.close();
  console.log('Done!');
})();
