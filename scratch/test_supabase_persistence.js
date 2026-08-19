/**
 * CLASSVAULT SUPABASE POSTGRESQL VERIFICATION SUITE
 * This script tests the entire authentication, RBAC, project privacy, README documentation,
 * profile protection, leaderboard calculations, and data persistence against the live backend.
 */

const BASE_URL = 'http://localhost:8080/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, data };
}

async function runSuite() {
  console.log('====================================================');
  console.log('CLASSVAULT SUPABASE / POSTGRESQL PERSISTENCE SUITE');
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

  try {
    // 1. Health & Database Check
    console.log('--- 1. Backend Health Check ---');
    const health = await request('/health');
    assert('Spring Boot backend is healthy (200 OK)', health.status === 200);

    // 2. Admin Authentication
    console.log('\n--- 2. Admin Authentication ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin@classvault.edu',
        password: 'Admin@123'
      })
    });
    assert('Admin logs in with email (200 OK)', adminLogin.status === 200 && adminLogin.data.success === true);
    assert('Admin has ROLE_ADMIN authority', adminLogin.data?.data?.role === 'ROLE_ADMIN');
    const adminToken = adminLogin.data?.data?.accessToken;

    // 3. Create Tiny Test Dataset via Admin API (Student A & Student B)
    console.log('\n--- 3. Provision Test Student A (TESTREG001) & Student B (TESTREG002) ---');
    
    // Check if Student A exists or create
    let studentAReg = await request('/admin/students', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Test Student One',
        rollNumber: 'TEST001',
        registerNumber: 'TESTREG001',
        department: 'Computer Science & Engineering',
        year: 3,
        section: 'A',
        email: 'teststudent1@classvault.edu',
        password: 'ClassVault@123'
      })
    });

    if (studentAReg.status === 200 || studentAReg.status === 201) {
      assert('Created Test Student A (TESTREG001)', true);
    } else {
      assert('Test Student A (TESTREG001) already exists / ready', studentAReg.status === 400 || studentAReg.status === 409);
    }

    // Check if Student B exists or create
    let studentBReg = await request('/admin/students', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Test Student Two',
        rollNumber: 'TEST002',
        registerNumber: 'TESTREG002',
        department: 'Computer Science & Engineering',
        year: 3,
        section: 'B',
        email: 'teststudent2@classvault.edu',
        password: 'StudentB@123'
      })
    });

    if (studentBReg.status === 200 || studentBReg.status === 201) {
      assert('Created Test Student B (TESTREG002)', true);
    } else {
      assert('Test Student B (TESTREG002) already exists / ready', studentBReg.status === 400 || studentBReg.status === 409);
    }

    // 4. Student A First Login & Forced Password Change
    console.log('\n--- 4. Test Student A Login & Forced Password Change ---');
    let studentALogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'TESTREG001', password: 'ClassVault@123' })
    });

    let studentAToken = null;

    if (studentALogin.status === 200) {
      assert('Student A logs in with temporary default password ClassVault@123', true);
      assert('firstLogin flag is TRUE for Student A', studentALogin.data?.data?.firstLogin === true);
      studentAToken = studentALogin.data?.data?.accessToken;

      // Perform forced password change
      const changePass = await request('/auth/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentAToken}` },
        body: JSON.stringify({ newPassword: 'StudentOneSecurePass@123' })
      });
      assert('Student A completes forced password change', changePass.status === 200 && changePass.data.success === true);

      // Verify old password fails
      const oldPassTry = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'TESTREG001', password: 'ClassVault@123' })
      });
      assert('Old temporary password ClassVault@123 is rejected (401)', oldPassTry.status === 401);

      // Verify new password succeeds
      const newPassTry = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'TESTREG001', password: 'StudentOneSecurePass@123' })
      });
      assert('New password StudentOneSecurePass@123 succeeds (200 OK)', newPassTry.status === 200);
      assert('firstLogin is now FALSE', newPassTry.data?.data?.firstLogin === false);
      studentAToken = newPassTry.data?.data?.accessToken;
    } else {
      const loginUpdated = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'TESTREG001', password: 'StudentOneSecurePass@123' })
      });
      assert('Student A logs in with password StudentOneSecurePass@123', loginUpdated.status === 200);
      studentAToken = loginUpdated.data?.data?.accessToken;
    }

    // Login Student B
    let studentBLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'TESTREG002', password: 'StudentB@123' })
    });
    assert('Student B (TESTREG002) logs in successfully', studentBLogin.status === 200);
    const studentBToken = studentBLogin.data?.data?.accessToken;

    // 5. Test Student Profile & Academic Record Protection
    console.log('\n--- 5. Student Profile & Academic Record Lockdown ---');
    const profileUpdate = await request('/students/me', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${studentAToken}` },
      body: JSON.stringify({
        name: 'ATTEMPTED MALICIOUS NAME',
        rollNumber: 'MALICIOUS_ROLL',
        registerNumber: 'MALICIOUS_REG',
        department: 'MALICIOUS_DEPT',
        bio: 'Cloud and distributed systems researcher at ClassVault.',
        githubUrl: 'https://github.com/teststudent1',
        skills: 'Java,Spring Boot,PostgreSQL,Docker'
      })
    });
    assert('Profile update endpoint responds 200 OK', profileUpdate.status === 200);
    assert('Official Name remains "Test Student One" (locked)', profileUpdate.data?.data?.name === 'Test Student One');
    assert('Registration Number remains "TESTREG001" (locked)', profileUpdate.data?.data?.registerNumber === 'TESTREG001');
    assert('Roll Number remains "TEST001" (locked)', profileUpdate.data?.data?.rollNumber === 'TEST001');
    assert('Bio updated to self-managed bio', profileUpdate.data?.data?.bio?.includes('Cloud and distributed systems'));
    assert('Skills updated to self-managed skills', profileUpdate.data?.data?.skills?.includes('PostgreSQL'));

    // 6. Test Project Creation with Markdown README (PRIVATE Visibility)
    console.log('\n--- 6. Private Project Creation with Markdown README ---');
    const privateProject = await request('/projects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentAToken}` },
      body: JSON.stringify({
        title: 'Supabase Autonomous Sharding Engine',
        description: 'High-concurrency PostgreSQL connection and query sharding gateway.',
        readmeContent: `# Supabase Autonomous Sharding Engine

## Overview
A high-throughput PostgreSQL horizontal partitioning coordinator.

## Architecture
- Spring Boot 3 + JDBC
- Supabase PostgreSQL Storage Engine
- Connection multiplexing

## Setup
\`\`\`bash
git clone https://github.com/teststudent1/pg-sharder.git
mvn clean install
\`\`\`
`,
        technologyUsed: 'Java,Spring Boot,PostgreSQL,Supabase,Docker',
        category: 'Systems & Cloud',
        semester: 6,
        githubRepoUrl: 'https://github.com/teststudent1/pg-sharder',
        liveDemoUrl: 'https://pg-sharder.demo.com',
        visibility: 'PRIVATE',
        status: 'APPROVED'
      })
    });

    assert('Private project created successfully (200/201)', privateProject.status === 200 || privateProject.status === 201);
    const projectId = privateProject.data?.data?.id;
    assert('Project record contains full Markdown README', privateProject.data?.data?.readmeContent?.includes('Supabase Autonomous Sharding Engine'));

    // 7. Test Private Project Security Enforcement
    console.log('\n--- 7. Private Project Security Enforcement ---');
    // Owner view -> 200 OK
    const ownerView = await request(`/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${studentAToken}` }
    });
    assert('Owner can view private project (200 OK)', ownerView.status === 200);

    // Other Student (Student B) view -> 403 Forbidden
    const unauthStudentView = await request(`/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${studentBToken}` }
    });
    assert('Other student (TESTREG002) is denied access to private project (403 Forbidden)', unauthStudentView.status === 403);

    // Admin view -> 200 OK
    const adminView = await request(`/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert('Admin can view private project (200 OK)', adminView.status === 200);

    // 8. Test Public Project Transition, Likes, and Comments
    console.log('\n--- 8. Public Project Transition, Likes, and Comments ---');
    // Update project visibility to PUBLIC
    const makePublic = await request(`/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${studentAToken}` },
      body: JSON.stringify({
        title: 'Supabase Autonomous Sharding Engine',
        visibility: 'PUBLIC'
      })
    });
    assert('Project visibility updated to PUBLIC', makePublic.status === 200 && makePublic.data?.data?.visibility === 'PUBLIC');

    // Student B can now view public project
    const studentBPublicView = await request(`/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${studentBToken}` }
    });
    assert('Student B can view public project (200 OK)', studentBPublicView.status === 200);
    assert('Student B receives full Markdown README', studentBPublicView.data?.data?.readmeContent?.includes('Supabase Autonomous Sharding Engine'));

    // Student B likes the project
    const likeRes = await request(`/projects/${projectId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentBToken}` }
    });
    assert('Student B likes the project', likeRes.status === 200);

    // Student B comments on the project
    const commentRes = await request(`/projects/${projectId}/comments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentBToken}` },
      body: JSON.stringify({ content: 'Excellent PostgreSQL sharding architecture!' })
    });
    assert('Student B adds a constructive comment', commentRes.status === 200 || commentRes.status === 201);

    // 9. Test Leaderboard Calculation
    console.log('\n--- 9. Leaderboard Score & Rank Calculations ---');
    const leaderboard = await request('/leaderboard', {
      headers: { 'Authorization': `Bearer ${studentAToken}` }
    });
    assert('Leaderboard calculation endpoint returns 200 OK', leaderboard.status === 200);
    assert('Leaderboard contains entries', Array.isArray(leaderboard.data?.data) && leaderboard.data.data.length > 0);
    const topEntry = leaderboard.data.data[0];
    assert('Leaderboard entry has score, rank, and project stats', topEntry.rank >= 1 && topEntry.score >= 0);

    console.log('\n====================================================');
    console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runSuite();
