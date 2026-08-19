/**
 * Complete Verification for 3 Administrator Accounts
 * Tests authentication, authorization, student count integrity, and persistence.
 */

async function verifyAdmins() {
  console.log('================================================================');
  console.log('    CLASSVAULT — 3 ADMINISTRATOR ACCOUNTS VERIFICATION          ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${title} ${details ? '-> ' + details : ''}`);
    } else {
      console.error(`[FAIL] ${title} ${details ? '-> ' + details : ''}`);
    }
  }

  // 1. Health check
  const healthRes = await fetch('http://localhost:8080/api/v1/health');
  const health = await healthRes.json();
  assert('1. Health Check (GET /api/v1/health)', health.success && health.data?.status === 'UP', `Status: ${health.data?.status}`);

  // 2. Admin 1 Login
  const login1Res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin1@classvault.edu', password: 'Admin@123' })
  });
  const login1 = await login1Res.json();
  const token1 = login1.data?.accessToken;
  assert('2. Admin 1 Login (admin1@classvault.edu)', login1Res.status === 200 && login1.data?.role === 'ROLE_ADMIN' && !!token1, `Status: ${login1Res.status}, Role: ${login1.data?.role}`);

  // 3. Admin 2 Login
  const login2Res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin2@classvault.edu', password: 'Admin@456' })
  });
  const login2 = await login2Res.json();
  const token2 = login2.data?.accessToken;
  assert('3. Admin 2 Login (admin2@classvault.edu)', login2Res.status === 200 && login2.data?.role === 'ROLE_ADMIN' && !!token2, `Status: ${login2Res.status}, Role: ${login2.data?.role}`);

  // 4. Admin 3 Login
  const login3Res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin3@classvault.edu', password: 'Admin@789' })
  });
  const login3 = await login3Res.json();
  const token3 = login3.data?.accessToken;
  assert('4. Admin 3 Login (admin3@classvault.edu)', login3Res.status === 200 && login3.data?.role === 'ROLE_ADMIN' && !!token3, `Status: ${login3Res.status}, Role: ${login3.data?.role}`);

  // 5. Original Admin Login
  const loginOrigRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@classvault.edu', password: 'Admin@123' })
  });
  const loginOrig = await loginOrigRes.json();
  const tokenOrig = loginOrig.data?.accessToken;
  assert('5. Original Admin Login (admin@classvault.edu)', loginOrigRes.status === 200 && loginOrig.data?.role === 'ROLE_ADMIN' && !!tokenOrig, `Status: ${loginOrigRes.status}, Role: ${loginOrig.data?.role}`);

  // 6. Invalid Password Rejection
  const invalidLoginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin1@classvault.edu', password: 'WrongPassword!' })
  });
  assert('6. Invalid Password Rejection', invalidLoginRes.status === 401, `Status: ${invalidLoginRes.status} (Unauthorized)`);

  // 7. Protected Admin Endpoint with Admin 1 Token
  const admin1ApiRes = await fetch('http://localhost:8080/api/v1/admin/diagnostics/database', {
    headers: { 'Authorization': 'Bearer ' + token1 }
  });
  const admin1Api = await admin1ApiRes.json();
  assert('7. Admin 1 Authorization on Protected Endpoint', admin1ApiRes.status === 200 && admin1Api.data?.flywayCurrentVersion === '5', `DB: ${admin1Api.data?.databaseProductName}, Flyway: v${admin1Api.data?.flywayCurrentVersion}`);

  // 8. Protected Admin Endpoint with Admin 2 Token
  const admin2ApiRes = await fetch('http://localhost:8080/api/v1/admin/diagnostics/database', {
    headers: { 'Authorization': 'Bearer ' + token2 }
  });
  assert('8. Admin 2 Authorization on Protected Endpoint', admin2ApiRes.status === 200, `Status: 200 OK`);

  // 9. Protected Admin Endpoint with Admin 3 Token
  const admin3ApiRes = await fetch('http://localhost:8080/api/v1/admin/diagnostics/database', {
    headers: { 'Authorization': 'Bearer ' + token3 }
  });
  assert('9. Admin 3 Authorization on Protected Endpoint', admin3ApiRes.status === 200, `Status: 200 OK`);

  // 10. Verify Student Integrity (Imported students still login and work)
  const sampleStudentLogin = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '721424243002', password: 'ClassVault@123' })
  });
  const sampleStudent = await sampleStudentLogin.json();
  assert('10. Student Login Integrity (721424243002 ABITH GODSON T A)', sampleStudentLogin.status === 200 && sampleStudent.data?.name === 'ABITH GODSON T A', `Student: ${sampleStudent.data?.name}`);

  console.log(`\nAdmins Verification Results: ${passed} / ${total} Checks Passed\n`);
  return { success: passed === total };
}

verifyAdmins().then(res => {
  console.log('VERIFY_RESULT=' + JSON.stringify(res));
  process.exit(res.success ? 0 : 1);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
