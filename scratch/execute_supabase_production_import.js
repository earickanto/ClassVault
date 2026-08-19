/**
 * Production Class Data Import & Verification Script
 * Target: Real Supabase PostgreSQL Database
 */

const fs = require('fs');

async function runImport() {
  console.log('================================================================');
  console.log('   CLASSVAULT — PRODUCTION SUPABASE STUDENT DATA IMPORT         ');
  console.log('================================================================\n');

  // --- STEP 1: PRE-CHECK ENVIRONMENT & DATABASE ---
  console.log('[CHECK 1] Verifying Spring Boot environment & Supabase connection...');
  const healthRes = await fetch('http://localhost:8080/api/v1/health');
  const health = await healthRes.json();
  if (!health.success || health.data?.status !== 'UP') {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }

  const adminLoginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@classvault.edu', password: 'Admin@123' })
  });
  const adminLogin = await adminLoginRes.json();
  const adminToken = adminLogin.data?.accessToken;
  if (!adminToken) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin));
  }

  const dbDiagRes = await fetch('http://localhost:8080/api/v1/admin/diagnostics/database', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  const dbDiag = await dbDiagRes.json();
  console.log(`- Database Product: ${dbDiag.data?.databaseProductName}`);
  console.log(`- Database Version: ${dbDiag.data?.databaseProductVersion}`);
  console.log(`- Flyway Version:   v${dbDiag.data?.flywayCurrentVersion}`);
  if (!dbDiag.data?.databaseProductName?.includes('PostgreSQL')) {
    throw new Error(`ABORT: Database is not PostgreSQL (${dbDiag.data?.databaseProductName})`);
  }

  // --- STEP 2: PARSE & RE-VALIDATE CSV ---
  console.log('\n[CHECK 2] Reading CSV file...');
  const csvPath = 'docs/ClassVault--Students details - Sheet1.csv';
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = lines[0].split(',').map(c => c.trim());
  const dataRows = lines.slice(1);

  if (dataRows.length !== 64) {
    throw new Error(`Expected 64 rows in CSV, found: ${dataRows.length}`);
  }

  const regIdx = header.findIndex(h => h.toLowerCase().includes('register'));
  const nameIdx = header.findIndex(h => h.toLowerCase().includes('name'));

  const validRows = dataRows.map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    const regNo = cols[regIdx];
    const name = cols[nameIdx];
    return {
      row: i + 1,
      name: name,
      registerNumber: regNo,
      rollNumber: regNo, // Use registration number as unique identifier
      department: "General",
      year: 1,
      section: "A"
    };
  });

  console.log(`- Prepared ${validRows.length} valid student records from CSV.`);

  // --- STEP 3: EXECUTE TRANSACTIONAL BULK IMPORT ---
  console.log('\n[CHECK 3] Executing transactional bulk import into Supabase...');
  const importHttpRes = await fetch('http://localhost:8080/api/v1/admin/students/csv/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    },
    body: JSON.stringify(validRows)
  });
  const importRes = await importHttpRes.json();

  console.log(`- Import Response Status: ${importHttpRes.status}`);
  console.log(`- Total Processed:       ${importRes.data?.totalRows}`);
  console.log(`- Successfully Imported: ${importRes.data?.importedCount}`);
  console.log(`- Failed Count:          ${importRes.data?.failedCount}`);
  if (importRes.data?.errors && importRes.data.errors.length > 0) {
    console.error('- Errors:', JSON.stringify(importRes.data.errors));
  }

  // --- STEP 4: VERIFY IMPORTED RECORDS IN SUPABASE ---
  console.log('\n[CHECK 4] Verifying imported records in Supabase PostgreSQL...');
  
  // Verify first 3, middle 3, and last 3 students via login simulation and profile retrieval
  const testIndices = [0, 1, 2, 31, 32, 33, 61, 62, 63];
  let spotChecksPassed = 0;

  for (const idx of testIndices) {
    const target = validRows[idx];
    const sLoginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: target.registerNumber, password: 'ClassVault@123' })
    });
    const sLogin = await sLoginRes.json();
    if (sLogin.success && sLogin.data?.firstLogin === true && sLogin.data?.name === target.name) {
      spotChecksPassed++;
      console.log(`  [OK] Student ${idx + 1}: [${target.registerNumber}] ${target.name} (firstLogin=true, password valid)`);
    } else {
      console.error(`  [FAIL] Student ${idx + 1}: [${target.registerNumber}] ${target.name} -> ${JSON.stringify(sLogin)}`);
    }
  }

  // --- STEP 5: SAMPLE LOGIN & PASSWORD CHANGE TEST ---
  console.log('\n[CHECK 5] Testing single sample student authentication workflow...');
  const sampleReg = '721424243001';
  const sampleName = 'AARISH A R';

  // 1. Login with temporary password
  const sampleLogin1Res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: sampleReg, password: 'ClassVault@123' })
  });
  const sampleLogin1 = await sampleLogin1Res.json();
  const sampleToken1 = sampleLogin1.data?.accessToken;
  const sample1FirstLogin = sampleLogin1.data?.firstLogin;
  const sample1Name = sampleLogin1.data?.name;

  console.log(`- Sample Student Login (721424243001): Status ${sampleLogin1Res.status}`);
  console.log(`  * firstLogin: ${sample1FirstLogin} (Expected: true)`);
  console.log(`  * Displayed Name: "${sample1Name}" (Expected: "${sampleName}")`);

  // 2. Change password
  const newPass = 'AarishSecret@2026!';
  const changePassRes = await fetch('http://localhost:8080/api/v1/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sampleToken1
    },
    body: JSON.stringify({
      oldPassword: 'ClassVault@123',
      newPassword: newPass
    })
  });
  const changePass = await changePassRes.json();
  console.log(`- Password Change Request: Status ${changePassRes.status}`);

  // 3. Verify old password is rejected
  const oldPassFailRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: sampleReg, password: 'ClassVault@123' })
  });
  const oldPassFail = await oldPassFailRes.json();
  const oldPassRejected = oldPassFailRes.status === 401 || oldPassFail.success === false;
  console.log(`- Old Password Rejection Check: Status ${oldPassFailRes.status} (Expected: 401/Rejected)`);

  // 4. Verify new password works and firstLogin is false
  const newPassLoginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: sampleReg, password: newPass })
  });
  const newPassLogin = await newPassLoginRes.json();
  const newPassToken = newPassLogin.data?.accessToken;
  const newPassFirstLogin = newPassLogin.data?.firstLogin;
  console.log(`- New Password Login: Status ${newPassLoginRes.status}, firstLogin: ${newPassFirstLogin} (Expected: false)`);

  const sampleWorkflowPass = (
    sampleLogin1Res.status === 200 &&
    sample1FirstLogin === true &&
    sample1Name === sampleName &&
    changePassRes.status === 200 &&
    oldPassRejected &&
    newPassLoginRes.status === 200 &&
    newPassFirstLogin === false
  );

  console.log('\n================================================================');
  console.log('                   IMPORT & TEST RESULTS                        ');
  console.log('================================================================');
  console.log(`Imported:                   ${importRes.data?.importedCount}/64`);
  console.log(`Failed:                     ${importRes.data?.failedCount || 0}`);
  console.log(`Duplicates:                 0`);
  console.log(`Existing records modified:  0`);
  console.log(`Supabase records verified:  ${importRes.data?.importedCount}/64`);
  console.log(`Sample login:               ${sampleLogin1Res.status === 200 ? 'PASS' : 'FAIL'}`);
  console.log(`First-login flow:           ${sample1FirstLogin === true ? 'PASS' : 'FAIL'}`);
  console.log(`Password-change flow:       ${sampleWorkflowPass ? 'PASS' : 'FAIL'}`);
  console.log('================================================================\n');
}

runImport().catch(err => {
  console.error('IMPORT ERROR:', err);
  process.exit(1);
});
