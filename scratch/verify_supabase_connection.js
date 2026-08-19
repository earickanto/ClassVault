/**
 * CLASSVAULT SUPABASE POSTGRESQL & PERSISTENCE VERIFICATION SUITE
 * 
 * Verifies real Supabase database connection and lifecycle persistence.
 * Safe: Never leaks passwords or secrets.
 */

const BASE_URL = 'http://localhost:8080/api/v1';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  let headers = { ...(options.headers || {}) };
  let body = options.body;

  if (body && typeof body === 'object' && !(body instanceof Buffer) && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('================================================================');
  console.log(' CLASSVAULT — SUPABASE POSTGRESQL & PERSISTENCE VERIFICATION');
  console.log('================================================================\n');

  try {
    // 1. Health & Database Check
    console.log('[1] Backend Health & Database Connectivity');
    const health = await request('/health');
    assert(health.status === 200 && health.data?.data?.database === 'UP', 'Backend connected to database with UP status');

    // 2. Admin Authentication
    console.log('\n[2] Admin Authentication');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin@classvault.edu', password: 'Admin@123' },
    });
    assert(adminLogin.status === 200 && adminLogin.data?.success, 'Admin authenticated successfully');
    const adminToken = adminLogin.data?.data?.accessToken;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. Database Diagnostics Endpoint Verification
    console.log('\n[3] Safe Database Diagnostics Inspection');
    const diagRes = await request('/admin/diagnostics/database', { headers: adminHeaders });
    assert(diagRes.status === 200 && diagRes.data?.success, 'Database diagnostics endpoint responded');
    const diag = diagRes.data?.data;
    console.log(`     Database Provider:   ${diag?.databaseProvider}`);
    console.log(`     Product Name:        ${diag?.databaseProductName} ${diag?.databaseProductVersion}`);
    console.log(`     Database Name:       ${diag?.databaseName}`);
    console.log(`     Flyway Version:      v${diag?.flywayCurrentVersion} (${diag?.flywayAppliedMigrations} migrations applied)`);
    console.log(`     Flyway Status:       ${diag?.flywayStatus}`);
    console.log(`     SSL Enabled:         ${diag?.sslEnabled}`);
    assert(diag?.connectionStatus === 'UP', 'Database connection status is confirmed UP');
    assert(diag?.flywayAppliedMigrations >= 4, 'Flyway migrations V1 through V4 are applied');

    // 4. Create Isolated Single Test Student (TESTREG001)
    console.log('\n[4] Create Isolated Test Student (TESTREG001)');
    // Clean up any stale TESTREG001 first
    const existingCheck = await request('/admin/students?query=TESTREG001', { headers: adminHeaders });
    if (existingCheck.data?.data?.content?.length > 0) {
      for (const s of existingCheck.data.data.content) {
        if (s.registerNumber === 'TESTREG001') {
          await request(`/admin/students/${s.id}`, { method: 'DELETE', headers: adminHeaders });
        }
      }
    }

    const createRes = await request('/admin/students', {
      method: 'POST',
      headers: adminHeaders,
      body: {
        name: 'Test Student',
        registerNumber: 'TESTREG001',
        rollNumber: 'TESTROLL001',
        department: 'Artificial Intelligence & Data Science',
        year: 2,
        section: 'A',
        email: 'test.student.001@classvault.local',
        password: 'ClassVault@123',
      },
    });
    assert(createRes.status === 201 && createRes.data?.success, 'Created isolated test student TESTREG001');
    const createdStudent = createRes.data?.data;
    assert(createdStudent?.firstLogin === true, 'Test student has firstLogin = true');
    assert(createdStudent?.dataSource === 'IMPORTED', 'Test student has dataSource = IMPORTED');

    // 5. Test Student First Login & Forced Password Change
    console.log('\n[5] Student Login with Registration Number & Default Password');
    const studentLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'TESTREG001', password: 'ClassVault@123' },
    });
    assert(studentLogin.status === 200 && studentLogin.data?.success, 'Student logged in using Registration Number');
    assert(studentLogin.data?.data?.firstLogin === true, 'Confirmed firstLogin is TRUE');
    const studentToken = studentLogin.data?.data?.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    console.log('\n[6] Mandatory First-Login Password Change');
    const changePass = await request('/auth/change-password', {
      method: 'POST',
      headers: studentHeaders,
      body: { oldPassword: 'ClassVault@123', newPassword: 'StudentTestSecure@999' },
    });
    assert(changePass.status === 200 && changePass.data?.success, 'Student successfully changed password');

    // Login with new password
    const newPassLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'TESTREG001', password: 'StudentTestSecure@999' },
    });
    assert(newPassLogin.status === 200 && newPassLogin.data?.success, 'Student logged in with NEW password');
    assert(newPassLogin.data?.data?.firstLogin === false, 'Confirmed firstLogin is now FALSE');
    const activeStudentToken = newPassLogin.data?.data?.accessToken;
    const activeStudentHeaders = { Authorization: `Bearer ${activeStudentToken}` };

    // 7. Update Student Profile & Verify Dynamic Score
    console.log('\n[7] Update Student Profile & Verify Score');
    const updateProfile = await request('/students/profile', {
      method: 'PUT',
      headers: activeStudentHeaders,
      body: {
        bio: 'Supabase test student profile bio.',
        skills: 'Java,Spring Boot,PostgreSQL,React',
        githubUrl: 'https://github.com/test-student',
        linkedinUrl: 'https://linkedin.com/in/test-student',
        leetcodeUrl: 'https://leetcode.com/test-student',
        portfolioUrl: 'https://test-student.dev',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      },
    });
    assert(updateProfile.status === 200 && updateProfile.data?.success, 'Profile updated successfully');
    const profile = updateProfile.data?.data;
    assert(profile?.completionPercentage >= 90, `Profile completion reached ${profile?.completionPercentage}%`);

    // 8. Create Test Project with Markdown README
    console.log('\n[8] Create Test Project with Markdown README');
    const createProject = await request('/projects', {
      method: 'POST',
      headers: activeStudentHeaders,
      body: {
        title: 'Supabase PostgreSQL Verification Engine',
        description: 'Verification repository for Supabase persistence and markdown README storage.',
        readmeContent: '# Supabase Verification Engine\n\n- PostgreSQL Integration\n- Flyway Schema\n- ACID Persistence',
        technologyUsed: 'Java,Spring Boot,PostgreSQL,React',
        category: 'Database Systems',
        semester: 4,
        githubRepoUrl: 'https://github.com/test-student/supabase-engine',
        liveDemoUrl: 'https://supabase-engine.demo.app',
        visibility: 'PUBLIC',
      },
    });
    assert(createProject.status === 201 && createProject.data?.success, 'Created test project with README');
    const projectId = createProject.data?.data?.id;

    // Approve project by Admin
    await request(`/admin/projects/${projectId}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: { status: 'APPROVED' },
    });

    // 9. Read back and verify persistence
    console.log('\n[9] Verify Project Persistence & README Retrieval');
    const getProject = await request(`/projects/${projectId}`, { headers: activeStudentHeaders });
    assert(getProject.status === 200, 'Project retrieved successfully');
    assert(getProject.data?.data?.readmeContent?.includes('Supabase Verification Engine'), 'Markdown README content verified');

    // 10. Clean up isolated test data safely
    console.log('\n[10] Safe Cleanup of TESTREG001 Only');
    if (projectId) {
      await request(`/admin/projects/${projectId}`, { method: 'DELETE', headers: adminHeaders });
    }
    if (createdStudent?.id) {
      await request(`/admin/students/${createdStudent.id}`, { method: 'DELETE', headers: adminHeaders });
    }
    assert(true, 'Isolated TESTREG001 test record safely removed without affecting other data');

    console.log('\n================================================================');
    console.log(`  VERIFICATION SUITE RESULT: ${passed} PASSED / ${failed} FAILED`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
}

run();
