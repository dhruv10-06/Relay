import puppeteer from 'puppeteer-core';

async function debugBrowser() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  console.log('Opening http://localhost:5000...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });

  // Click "Load Sample Scenario"
  console.log('Clicking Load Sample Scenario...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((x) => x.textContent.includes('Load Sample Scenario') || x.textContent.includes('Load Sample Project'));
    if (b) b.click();
  });

  await new Promise((r) => setTimeout(r, 4000));

  // Check what HTML is rendered inside #root
  const html = await page.evaluate(() => document.querySelector('#root').innerHTML);
  console.log('Rendered HTML length inside #root:', html.length);
  console.log('Snippet:', html.slice(0, 300));

  await browser.close();
}

debugBrowser().catch(console.error);
