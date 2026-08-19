/**
 * Complete Supabase Production Lifecycle & Persistence Verification Suite
 * Phase 1: Pre-restart workflow tests
 * Phase 2: Post-restart persistence & cleanup tests
 */

const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:8080${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(url, { method, headers }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        let json = null;
        try { 
          json = JSON.parse(resData);
        } catch (e) { 
          json = resData; 
        }
        const inner = (json && typeof json === 'object' && 'data' in json) ? json.data : json;
        resolve({ status: res.statusCode, raw: json, body: inner });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function phase1() {
  console.log('===============================================================');
  console.log('    PHASE 1: LIVE SUPABASE POSTGRESQL WORKFLOW VERIFICATION    ');
  console.log('===============================================================\n');

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

  // 1. Health Check
  const health = await request('GET', '/api/v1/health');
  assert('1. Health Check (GET /api/v1/health)', health.status === 200 && health.body?.status === 'UP', `Status: ${health.body?.status}, DB: ${health.body?.database}`);

  // 2. Admin Login
  const adminLogin = await request('POST', '/api/v1/auth/login', {
    username: 'admin@classvault.edu',
    password: 'Admin@123'
  });
  const adminToken = adminLogin.body?.accessToken;
  assert('2. Admin Login', adminLogin.status === 200 && !!adminToken, `Role: ${adminLogin.body?.role || 'ROLE_ADMIN'}`);

  // 3. Database Diagnostics Endpoint
  const dbDiag = await request('GET', '/api/v1/admin/diagnostics/database', null, adminToken);
  assert('3. Database Diagnostics', dbDiag.status === 200 && dbDiag.body?.databaseProductName?.includes('PostgreSQL'), 
    `DB: ${dbDiag.body?.databaseProductName} ${dbDiag.body?.databaseProductVersion}, Host: ${dbDiag.body?.databaseName}, Flyway: ${dbDiag.body?.flywayAppliedMigrations} migrations (v${dbDiag.body?.flywayCurrentVersion})`);

  // 4. Create Distinct Test Student 1
  const testRegNo1 = 'TEST_PERSIST_201';
  const testRollNo1 = 'PER201';
  const createStudent1 = await request('POST', '/api/v1/admin/students', {
    name: 'Supabase Persist User',
    registerNumber: testRegNo1,
    rollNumber: testRollNo1,
    department: 'AI&DS',
    year: 2,
    section: 'A',
    email: 'persist.test201@classvault.edu',
    password: testRegNo1
  }, adminToken);
  const student1Id = createStudent1.body?.id;
  assert('4. Create Test Student in Supabase', (createStudent1.status === 201 || createStudent1.status === 200) && !!student1Id, `Student ID: ${student1Id}`);

  // 5. Initial Student Login (First Login)
  const login1 = await request('POST', '/api/v1/auth/login', {
    username: testRegNo1,
    password: testRegNo1
  });
  const token1 = login1.body?.accessToken;
  assert('5. Student Initial Login', login1.status === 200 && login1.body?.firstLogin === true, `FirstLogin: ${login1.body?.firstLogin}`);

  // 6. Force Change Password
  const changePass = await request('POST', '/api/v1/auth/change-password', {
    oldPassword: testRegNo1,
    newPassword: 'PersistSecret2026!'
  }, token1);
  assert('6. First-Login Password Change', changePass.status === 200, `Password Updated`);

  // 7. Student Re-login with New Password
  const reLogin1 = await request('POST', '/api/v1/auth/login', {
    username: testRegNo1,
    password: 'PersistSecret2026!'
  });
  const student1Token = reLogin1.body?.accessToken;
  assert('7. Student Login with New Password', reLogin1.status === 200 && reLogin1.body?.firstLogin === false, `New Token Generated`);

  // 8. Update Student Profile in Supabase
  const updateProfile = await request('PUT', '/api/v1/students/me', {
    bio: 'Supabase Persistence Certified Student',
    githubUrl: 'https://github.com/supabase-persist-student',
    linkedinUrl: 'https://linkedin.com/in/supabase-persist-student',
    skills: 'PostgreSQL,Spring Boot 3,Supabase,React'
  }, student1Token);
  assert('8. Update Student Profile', updateProfile.status === 200 && updateProfile.body?.bio?.includes('Supabase'), `Bio: ${updateProfile.body?.bio}`);

  // 9. Create Private Project in Supabase
  const createProject = await request('POST', '/api/v1/projects', {
    title: 'Supabase Persistence Vault Project',
    tagline: 'End-to-End verified database persistence across restarts',
    description: 'Project created in Supabase PostgreSQL that persists through server restart cycles',
    category: 'Cloud & Database',
    technologyUsed: 'PostgreSQL, Supabase, Spring Boot 3',
    semester: 4,
    visibility: 'PRIVATE',
    readmeContent: '# Supabase Persistence Project\n\nVerified persistence across server restarts.'
  }, student1Token);
  const projectId = createProject.body?.id;
  assert('9. Create Private Project in Supabase', createProject.status === 201 && createProject.body?.visibility === 'PRIVATE', `Project ID: ${projectId}`);

  // 10. Owner Access to Private Project
  const ownerAccess = await request('GET', `/api/v1/projects/${projectId}`, null, student1Token);
  assert('10. Owner Access to Private Project', ownerAccess.status === 200 && ownerAccess.body?.title === 'Supabase Persistence Vault Project', `Title: ${ownerAccess.body?.title}`);

  // 11. Create Test Student 2 and Verify 403 Forbidden on Private Project
  const testRegNo2 = 'TEST_PERSIST_202';
  const createStudent2 = await request('POST', '/api/v1/admin/students', {
    name: 'Second Test User',
    registerNumber: testRegNo2,
    rollNumber: 'PER202',
    department: 'AI&DS',
    year: 2,
    section: 'B',
    email: 'persist.test202@classvault.edu',
    password: testRegNo2
  }, adminToken);
  const student2Id = createStudent2.body?.id;
  const login2 = await request('POST', '/api/v1/auth/login', { username: testRegNo2, password: testRegNo2 });
  const student2Token = login2.body?.accessToken;

  const forbiddenAccess = await request('GET', `/api/v1/projects/${projectId}`, null, student2Token);
  assert('11. Private Project Security (Student 2 Forbidden)', forbiddenAccess.status === 403, `Status: ${forbiddenAccess.status} (Forbidden)`);

  // 12. Student My Projects Endpoint
  const myProjects = await request('GET', '/api/v1/projects/my-projects', null, student1Token);
  const myProjectsList = Array.isArray(myProjects.body) ? myProjects.body : [];
  assert('12. Student My Projects Endpoint', myProjects.status === 200 && myProjectsList.some(p => p.id === projectId), `Projects count: ${myProjectsList.length}`);

  // 13. Authenticated Leaderboard Check
  const leaderboard = await request('GET', '/api/v1/leaderboard', null, student1Token);
  assert('13. Authenticated Leaderboard Endpoint', leaderboard.status === 200 && Array.isArray(leaderboard.body) && leaderboard.body.length > 0, `Leaderboard entries: ${Array.isArray(leaderboard.body) ? leaderboard.body.length : 0}`);

  console.log(`\nPhase 1 Pre-Restart Results: ${passed} / ${total} Checks Passed\n`);
  return {
    success: passed === total,
    student1Id,
    student2Id,
    projectId,
    testRegNo1,
    testRegNo2,
    adminToken
  };
}

async function phase2(state) {
  console.log('===============================================================');
  console.log('    PHASE 2: POST-RESTART DATABASE PERSISTENCE VERIFICATION     ');
  console.log('===============================================================\n');

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

  // 1. Health Check after restart
  const health = await request('GET', '/api/v1/health');
  assert('1. Health Check after Restart', health.status === 200 && health.body?.status === 'UP', `Status: ${health.body?.status}`);

  // 2. Admin Login after restart
  const adminLogin = await request('POST', '/api/v1/auth/login', {
    username: 'admin@classvault.edu',
    password: 'Admin@123'
  });
  const adminToken = adminLogin.body?.accessToken;
  assert('2. Admin Login after Restart', adminLogin.status === 200 && !!adminToken, `Admin Token Acquired`);

  // 3. Test Student Login with changed password after restart
  const studentLogin = await request('POST', '/api/v1/auth/login', {
    username: state.testRegNo1,
    password: 'PersistSecret2026!'
  });
  const studentToken = studentLogin.body?.accessToken;
  assert('3. Test Student Login with New Password after Restart', studentLogin.status === 200 && !!studentToken, `Login Successful across Restart`);

  // 4. Verify Student Profile persisted in Supabase
  const profile = await request('GET', '/api/v1/students/me', null, studentToken);
  assert('4. Student Profile Persisted in Supabase', profile.status === 200 && profile.body?.bio === 'Supabase Persistence Certified Student', `Bio: ${profile.body?.bio}`);

  // 5. Verify Project Persisted in Supabase
  const project = await request('GET', `/api/v1/projects/${state.projectId}`, null, studentToken);
  assert('5. Project Persisted in Supabase', project.status === 200 && project.body?.title === 'Supabase Persistence Vault Project', `Title: ${project.body?.title}`);

  // 6. Verify README Content Persisted
  assert('6. Project README Persisted in Supabase', project.body?.readmeContent?.includes('Supabase Persistence Project'), `README Size: ${project.body?.readmeContent?.length} chars`);

  // 7. Cleanup ONLY temporary test data
  console.log('\n--- CLEANING UP TEMPORARY TEST DATA ONLY ---');
  if (state.student1Id) {
    const del1 = await request('DELETE', `/api/v1/admin/students/${state.student1Id}`, null, adminToken);
    assert('7. Cleaned Test Student 1', del1.status === 200, `ID: ${state.student1Id}`);
  }
  if (state.student2Id) {
    const del2 = await request('DELETE', `/api/v1/admin/students/${state.student2Id}`, null, adminToken);
    assert('8. Cleaned Test Student 2', del2.status === 200, `ID: ${state.student2Id}`);
  }

  console.log(`\nPhase 2 Post-Restart Results: ${passed} / ${total} Checks Passed\n`);
  return { success: passed === total };
}

if (process.argv[2] === 'phase1') {
  phase1().then(res => {
    console.log('PHASE1_RESULT=' + JSON.stringify(res));
  });
} else if (process.argv[2] === 'phase2') {
  const state = JSON.parse(process.argv[3]);
  phase2(state).then(res => {
    console.log('PHASE2_RESULT=' + JSON.stringify(res));
  });
}

module.exports = { request, phase1, phase2 };
