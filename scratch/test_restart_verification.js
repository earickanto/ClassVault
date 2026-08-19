const BASE_URL = 'http://localhost:8080/api/v1';

async function verifyAfterRestart() {
  console.log('====================================================');
  console.log('POST-RESTART DATA PERSISTENCE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 1. Admin login
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@classvault.edu', password: 'Admin@123' })
  }).then(r => r.json());

  assert('Admin logs in successfully after restart', adminRes.success === true);
  const adminToken = adminRes.data?.accessToken;

  // 2. Student A logs in with changed password
  const studentARes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'TESTREG001', password: 'StudentOneSecurePass@123' })
  }).then(r => r.json());

  assert('Test Student A logs in with updated password', studentARes.success === true && studentARes.data?.firstLogin === false);
  const studentAToken = studentARes.data?.accessToken;

  // 3. Verify Student A's persisted profile
  const profileRes = await fetch(`${BASE_URL}/students/me`, {
    headers: { 'Authorization': `Bearer ${studentAToken}` }
  }).then(r => r.json());

  assert('Student A profile persists name "Test Student One"', profileRes.data?.name === 'Test Student One');
  assert('Student A bio and skills persisted', profileRes.data?.skills?.includes('PostgreSQL'));

  // 4. Verify Student B login
  const studentBRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'TESTREG002', password: 'StudentB@123' })
  }).then(r => r.json());

  assert('Test Student B logs in successfully', studentBRes.success === true);

  // 5. Verify created projects exist
  const projectsRes = await fetch(`${BASE_URL}/projects`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  const foundSharder = projectsRes.data?.content?.some(p => p.title.includes('Supabase Autonomous Sharding Engine'));
  assert('Created project "Supabase Autonomous Sharding Engine" persisted', foundSharder);

  // 6. Verify Leaderboard calculation persists
  const leaderboardRes = await fetch(`${BASE_URL}/leaderboard`, {
    headers: { 'Authorization': `Bearer ${studentAToken}` }
  }).then(r => r.json());

  assert('Leaderboard snapshot data persists and calculates', Array.isArray(leaderboardRes.data?.data) && leaderboardRes.data.data.length >= 2);

  console.log('\n====================================================');
  console.log(`TOTAL POST-RESTART CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

verifyAfterRestart().catch(err => {
  console.error('Post-restart verification failed:', err);
  process.exit(1);
});
