const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type().toUpperCase()} - ${msg.text()}`));
  page.on('pageerror', e => console.log(`[PAGE ERROR] ${e.message}`));
  
  await page.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Clicking Skip...");
  await page.evaluate(() => {
    const skipBtn = document.getElementById('btn-skip-cinematic');
    if (skipBtn) skipBtn.click();
    else console.log("Skip button not found in DOM");
  });
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
