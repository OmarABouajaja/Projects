const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
      console.log('PAGE LOG:', msg.type(), msg.text());
  });
  
  page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
      console.log('STACK:', error.stack);
  });

  console.log('Navigating to http://localhost:8080/...');
  await page.goto('http://localhost:8080/');
  
  console.log('Waiting 5s...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('Done.');
})();
