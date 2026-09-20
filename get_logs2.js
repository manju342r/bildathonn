const puppeteer = require('puppeteer');
const fs = require('fs');

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

  console.log("Navigating to local site...");
  // Serve the files via a simple local server to avoid file:// CORS issues
  // Or just load file:///
  await page.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle2' });
  
  console.log("Waiting a few seconds...");
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
