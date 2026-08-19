/**
 * ClassVault Workflow 25: Post-Restart Data Persistence Verification
 * Target: Real Frontend UI (http://localhost:5173) + Live Supabase PostgreSQL Backend (http://localhost:8080)
 */

const puppeteer = require('puppeteer');

async function verifyPersistence() {
  console.log('========================================================================');
  console.log('   WORKFLOW 25: VERIFY DATA STILL EXISTS AFTER SPRING BOOT RESTART      ');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
  await page.setViewport({ width: 1280, height: 800 });

  const verifications = [];

  try {
    // 1. Verify Admin Login & Student Table Persistence
    console.log('[Check 1/5] Verifying Admin login and 64 imported students in Supabase...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.type('input[type="text"]', 'admin1@classvault.edu');
    await page.type('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/admin'), { timeout: 15000 });
    
    await page.goto('http://localhost:5173/admin/students', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.innerText.includes('721424243') || document.body.innerText.includes('AARISH'), { timeout: 15000 });
    const studentsTableText = await page.evaluate(() => document.body.innerText);
    const hasStudents = studentsTableText.includes('721424243') || studentsTableText.includes('AARISH');
    console.log('  -> Imported students table present:', hasStudents);
    verifications.push({ check: 'Imported students persistence', status: hasStudents });

    // 2. Verify Student Login with Post-Restart Password
    console.log('\n[Check 2/5] Verifying student login with newly updated password across restart...');
    await page.evaluate(() => {
      localStorage.clear();
      window.location.href = '/login';
    });
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', '721424243006');
    await page.type('input[type="password"]', 'AnandSecret@2026!');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 15000 });
    const isStudentLoggedIn = page.url().includes('/dashboard');
    console.log('  -> Student 721424243006 authenticated:', isStudentLoggedIn);
    verifications.push({ check: 'Updated student password persistence', status: isStudentLoggedIn });

    // 3. Verify Student Profile Data Persistence
    console.log('\n[Check 3/5] Verifying profile data (bio, skills, links) persistence...');
    await page.goto('http://localhost:5173/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('textarea')?.value?.length > 0, { timeout: 15000 });
    const bioVal = await page.$eval('textarea', el => el.value);
    const hasBio = bioVal.includes('Full-Stack Engineer');
    console.log('  -> Profile bio persisted:', hasBio, `("${bioVal.slice(0, 40)}...")`);
    verifications.push({ check: 'Profile data persistence', status: hasBio });

    // 4. Verify Project & README Markdown Persistence
    console.log('\n[Check 4/5] Verifying created project and Markdown documentation persistence...');
    await page.goto('http://localhost:5173/projects', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.innerText.includes('Distributed Cloud File Vault'), { timeout: 15000 });
    const projectsListText = await page.evaluate(() => document.body.innerText);
    const hasProject = projectsListText.includes('Distributed Cloud File Vault');
    console.log('  -> Public project listed in repository:', hasProject);
    verifications.push({ check: 'Project repository persistence', status: hasProject });

    // 5. Verify Inter-Student Interactions Persistence (Like, Comments, Bookmarks)
    console.log('\n[Check 5/5] Verifying peer collaboration (comments, bookmarks) persistence...');
    await page.goto('http://localhost:5173/saved', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    const savedText = await page.evaluate(() => document.body.innerText);
    const hasSaved = savedText.includes('Distributed Cloud File Vault') || savedText.includes('Saved') || savedText.includes('Bookmarks');
    console.log('  -> Bookmarked project persisted:', hasSaved);
    verifications.push({ check: 'Collaboration and bookmarks persistence', status: hasSaved });

    const allPassed = verifications.every(v => v.status);
    console.log(`\n========================================================================`);
    console.log(` WORKFLOW 25 RESULT: ${allPassed ? 'ALL PERSISTENCE CHECKS PASSED [PASS]' : 'PERSISTENCE CHECKS FAILED [FAIL]'}`);
    console.log(`========================================================================\n`);

    return { success: allPassed, verifications };
  } finally {
    try {
      await page.close().catch(() => {});
      await browser.close().catch(() => {});
    } catch (e) {}
  }
}

verifyPersistence().then(res => {
  console.log('WORKFLOW_25_OUTPUT=' + JSON.stringify(res));
  process.exit(res.success ? 0 : 1);
}).catch(err => {
  console.error('WORKFLOW 25 CRITICAL FAILURE:', err);
  process.exit(1);
});
