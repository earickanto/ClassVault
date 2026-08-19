/**
 * Live Supabase PostgreSQL End-to-End Verification & Persistence Test Suite
 * Fully tested against ClassVault REST API endpoints and data model.
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

async function runVerification() {
  console.log('===============================================================');
  console.log('    CLASSVAULT — LIVE SUPABASE PRODUCTION VERIFICATION         ');
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

  try {
    // 1. Health Check
    const health = await request('GET', '/api/v1/health');
    const healthData = health.body;
    assert('1. Health Check (GET /api/v1/health)', health.status === 200 && healthData?.status === 'UP', `Status: ${healthData?.status}, DB: ${healthData?.database}`);

    // 2. Admin Login
    const adminLogin = await request('POST', '/api/v1/auth/login', {
      username: 'admin@classvault.edu',
      password: 'Admin@123'
    });
    const adminBody = adminLogin.body;
    const adminToken = adminBody?.accessToken;
    assert('2. Admin Login', adminLogin.status === 200 && !!adminToken, `Role: ${adminBody?.role || 'ROLE_ADMIN'}`);

    // 3. Database Diagnostics Endpoint
    const dbDiag = await request('GET', '/api/v1/admin/diagnostics/database', null, adminToken);
    const diagData = dbDiag.body;
    assert('3. Database Diagnostics', dbDiag.status === 200 && diagData?.databaseProductName?.includes('PostgreSQL'), 
      `DB: ${diagData?.databaseProductName} ${diagData?.databaseProductVersion}, Host: ${diagData?.databaseName}, Flyway: ${diagData?.flywayAppliedMigrations} migrations (v${diagData?.flywayCurrentVersion})`);

    // 4. Verify Database Connectivity & Flyway
    assert('4. Flyway Migrations Status', diagData?.flywayStatus === 'UP_TO_DATE' && diagData?.flywayAppliedMigrations === 4, `Applied: ${diagData?.flywayAppliedMigrations}, Status: ${diagData?.flywayStatus}`);

    // 5. Create Test Student in Supabase
    const testRegNo = 'TEST_SUPA_901';
    const testRollNo = 'SUPA901';
    const createStudent = await request('POST', '/api/v1/admin/students', {
      name: 'Supabase Test User',
      registerNumber: testRegNo,
      rollNumber: testRollNo,
      department: 'AI&DS',
      year: 2,
      section: 'A',
      email: 'supabase.test901@classvault.edu',
      password: testRegNo
    }, adminToken);
    const studentData = createStudent.body;
    assert('5. Create Test Student in Supabase', createStudent.status === 201 && studentData?.registerNumber === testRegNo, `Student ID: ${studentData?.id}`);
    const studentId = studentData?.id;

    // 6. Test Student Login with initial temporary password
    const studentLogin = await request('POST', '/api/v1/auth/login', {
      username: testRegNo,
      password: testRegNo
    });
    const initialLoginData = studentLogin.body;
    const initialToken = initialLoginData?.accessToken;
    assert('6. Student Initial Login', studentLogin.status === 200 && !!initialToken, `FirstLogin: ${initialLoginData?.firstLogin}`);

    // 7. Force Change Password on First Login
    const changePass = await request('POST', '/api/v1/auth/change-password', {
      oldPassword: testRegNo,
      newPassword: 'SecureSupabasePass2026!'
    }, initialToken);
    assert('7. Force Change Password', changePass.status === 200, `Password Updated`);

    // 8. Re-login with New Password
    const reLogin = await request('POST', '/api/v1/auth/login', {
      username: testRegNo,
      password: 'SecureSupabasePass2026!'
    });
    const studentLoginData = reLogin.body;
    const studentToken = studentLoginData?.accessToken;
    assert('8. Student Re-login with New Password', reLogin.status === 200 && studentLoginData?.firstLogin === false, `New Token Generated`);

    // 9. Update Profile (Bio, GitHub, Skills)
    const updateProfile = await request('PUT', '/api/v1/students/me', {
      bio: 'Verified on Supabase PostgreSQL Production Database',
      githubUrl: 'https://github.com/supabase-test-student',
      linkedinUrl: 'https://linkedin.com/in/supabase-test-student',
      skills: 'PostgreSQL,Spring Boot 3,Supabase,React'
    }, studentToken);
    const updatedProfile = updateProfile.body;
    assert('9. Update Student Profile', updateProfile.status === 200 && updatedProfile?.bio?.includes('Supabase'), `Bio: ${updatedProfile?.bio}`);

    // 10. Create Private Test Project
    const createProject = await request('POST', '/api/v1/projects', {
      title: 'Supabase Production Vault Project',
      tagline: 'End-to-End verified database persistence',
      description: 'Full stack project running against live Supabase PostgreSQL instance',
      category: 'Database & Cloud',
      technologyUsed: 'PostgreSQL, Supabase, Spring Boot',
      semester: 4,
      visibility: 'PRIVATE',
      readmeContent: '# Supabase Project Persistence\n\nVerified live database persistence on Supabase.'
    }, studentToken);
    const projectData = createProject.body;
    assert('10. Create Private Project in Supabase', createProject.status === 201 && projectData?.visibility === 'PRIVATE', `Project ID: ${projectData?.id}`);
    const projectId = projectData?.id;

    // 11. Verify Private Project Authorization (Owner Access)
    const ownerAccess = await request('GET', `/api/v1/projects/${projectId}`, null, studentToken);
    const ownerProject = ownerAccess.body;
    assert('11. Owner Access to Private Project', ownerAccess.status === 200 && ownerProject?.title === 'Supabase Production Vault Project', `Title: ${ownerProject?.title}`);

    // 12. Verify Second Student Cannot Access Private Project (403 Forbidden)
    const test2RegNo = 'TEST_SUPA_902';
    const createStudent2 = await request('POST', '/api/v1/admin/students', {
      name: 'Second Test User',
      registerNumber: test2RegNo,
      rollNumber: 'SUPA902',
      department: 'AI&DS',
      year: 2,
      section: 'B',
      email: 'supabase.test902@classvault.edu',
      password: test2RegNo
    }, adminToken);
    const student2Id = createStudent2.body?.id;
    const login2 = await request('POST', '/api/v1/auth/login', { username: test2RegNo, password: test2RegNo });
    const student2Token = login2.body?.accessToken;

    const unauthorizedAccess = await request('GET', `/api/v1/projects/${projectId}`, null, student2Token);
    assert('12. Private Project Security (Student 2 Forbidden)', unauthorizedAccess.status === 403, `Status: ${unauthorizedAccess.status} (Forbidden)`);

    // 13. Public Project Listing
    await request('PUT', `/api/v1/projects/${projectId}`, { 
      title: 'Supabase Production Vault Project',
      tagline: 'End-to-End verified database persistence',
      description: 'Full stack project running against live Supabase PostgreSQL instance',
      category: 'Database & Cloud',
      technologyUsed: 'PostgreSQL, Supabase, Spring Boot',
      semester: 4,
      visibility: 'PUBLIC' 
    }, studentToken);
    const publicProjects = await request('GET', '/api/v1/projects?page=0&size=10');
    const projectsList = publicProjects.body?.content || publicProjects.raw?.data?.content || [];
    assert('13. Public Project Listing in Supabase', publicProjects.status === 200 && projectsList.some(p => p.id === projectId), `Total Found: ${projectsList.length}`);

    // 14. Leaderboard Check
    const leaderboard = await request('GET', '/api/v1/leaderboard');
    const lbData = leaderboard.body;
    assert('14. Leaderboard Endpoint', leaderboard.status === 200 && Array.isArray(lbData), `Leaderboard count: ${Array.isArray(lbData) ? lbData.length : 0}`);

    console.log(`\n---------------------------------------------------------------`);
    console.log(`Phase 1 Pre-Restart Verification: ${passed} / ${total} Checks Passed`);
    console.log(`Test Student 1 ID: ${studentId}, Student 2 ID: ${student2Id}, Project ID: ${projectId}`);
    console.log(`---------------------------------------------------------------\n`);

    return { success: passed === total, studentId, student2Id, projectId, testRegNo, test2RegNo, adminToken };

  } catch (error) {
    console.error('Verification failed with error:', error);
    return { success: false, error: error.message };
  }
}

runVerification();
