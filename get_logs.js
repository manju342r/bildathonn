const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  page.on('pageerror', error => {
    console.log(`[BROWSER PAGE ERROR] ${error.message}`);
  });
  page.on('requestfailed', request => {
    console.log(`[BROWSER REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });

  console.log("Navigating to live site...");
  await page.goto('https://bildathonn.vercel.app/', { waitUntil: 'networkidle2' });
  
  console.log("Waiting a few seconds...");
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
})();
