const puppeteer = require('puppeteer');

async function testAdminStudents() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure().errorText));
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log('API RESPONSE:', res.status(), res.url());
      try {
        const json = await res.json();
        console.log('API DATA:', JSON.stringify(json).slice(0, 300));
      } catch (e) {}
    }
  });

  // Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', 'admin1@classvault.edu');
  await page.type('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.pathname.includes('/admin'));
  await new Promise(r => setTimeout(r, 1000));

  // Navigate to students
  console.log('Navigating to /admin/students...');
  await page.goto('http://localhost:5173/admin/students', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  const text = await page.evaluate(() => document.body.innerText);
  console.log('BODY TEXT PREVIEW:\n', text.slice(0, 800));

  await browser.close();
}

testAdminStudents().catch(console.error);
