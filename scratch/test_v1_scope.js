async function runTests() {
  console.log('====================================================');
  console.log('CLASSVAULT V1 SCOPE VERIFICATION SUITE');
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

  const BASE_URL = 'http://localhost:8080/api/v1';

  try {
    // 1. Primary Student Login with Registration Number
    console.log('--- Step 1: Student Login with Registration Number ---');
    const loginRegRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'REG2021001', password: 'Student@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Student logs in using Registration Number (REG2021001)', loginRegRes.status === 200 && loginRegRes.data.success === true);
    assert('JWT response contains registerNumber and firstLogin: false', 
      loginRegRes.data.data?.registerNumber === 'REG2021001' && loginRegRes.data.data?.firstLogin === false);
    const student1Token = loginRegRes.data.data?.accessToken;

    // 2. Admin Login
    console.log('\n--- Step 2: Admin Login ---');
    const loginAdminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@classvault.edu', password: 'Admin@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Admin logs in with email', loginAdminRes.status === 200 && loginAdminRes.data.data?.role === 'ROLE_ADMIN');
    const adminToken = loginAdminRes.data.data?.accessToken;

    // 3. Unknown Registration Number Generic Denial
    console.log('\n--- Step 3: Unauthorized Account Denial ---');
    const loginUnknown = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'REG9999999', password: 'SomePassword@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Unknown registration number receives 401 Unauthorized', loginUnknown.status === 401);
    assert('Generic denial message does not reveal account existence', 
      loginUnknown.data?.message === 'Access Denied: Invalid credentials or unknown account');

    // 4. Admin Bulk Import 6-column CSV with ClassVault@123 and firstLogin = true
    console.log('\n--- Step 4: Admin 6-Column CSV Import with Default Password ---');
    const csvContent = `name,register_number,roll_number,department,year,section
David Vance,REG2021005,21CS005,Computer Science & Engineering,3,A
Elena Rostova,REG2021006,21CS006,Computer Science & Engineering,3,A
Duplicate David,REG2021005,21CS007,Computer Science & Engineering,3,A
,REG2021008,,Computer Science & Engineering,3,A`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', blob, 'students.csv');

    const csvImportRes = await fetch(`${BASE_URL}/admin/students/csv`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Admin CSV import endpoint responds 200 OK', csvImportRes.status === 200 && csvImportRes.data.success === true);
    assert('Import summary reports 2 successful imports', csvImportRes.data.data?.importedCount === 2);
    assert('Import summary detects duplicate registerNumber', csvImportRes.data.data?.duplicateCount >= 1);
    assert('Import summary detects invalid rows', csvImportRes.data.data?.invalidCount >= 1);

    // 5. First Login Forced Password Change Flow
    console.log('\n--- Step 5: First-Time Student Login & Forced Password Change ---');
    const firstLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'REG2021005', password: 'ClassVault@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Newly imported student logs in with default ClassVault@123', firstLoginRes.status === 200 && firstLoginRes.data.success === true);
    assert('firstLogin flag is TRUE for newly imported student', firstLoginRes.data.data?.firstLogin === true);
    const newStudentToken = firstLoginRes.data.data?.accessToken;

    // Change Password
    const changePassRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newStudentToken}`
      },
      body: JSON.stringify({ newPassword: 'DavidSecurePass@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Student successfully changes password via POST /auth/change-password', 
      changePassRes.status === 200 && changePassRes.data.success === true);

    // Old default password must now be rejected
    const oldLoginTry = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'REG2021005', password: 'ClassVault@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Old default password ClassVault@123 is rejected after password change', oldLoginTry.status === 401);

    // New password succeeds and firstLogin is now FALSE
    const newLoginTry = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'REG2021005', password: 'DavidSecurePass@123' })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('New password DavidSecurePass@123 succeeds', newLoginTry.status === 200);
    assert('firstLogin flag is now FALSE', newLoginTry.data.data?.firstLogin === false);

    // 6. Academic Identity Lockdown
    console.log('\n--- Step 6: Academic Identity Lockdown Verification ---');
    const updateProfileTry = await fetch(`${BASE_URL}/students/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1Token}`
      },
      body: JSON.stringify({
        name: 'HACKED NAME',
        rollNumber: '99HACK99',
        registerNumber: 'REG9999999',
        department: 'Hacked Department',
        bio: 'Verified cloud architect and open source contributor.',
        skills: 'Go,Kubernetes,React,Spring Boot'
      })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Student profile update responds 200 OK', updateProfileTry.status === 200);
    assert('Official academic name remains John Doe (unchanged)', updateProfileTry.data.data?.name === 'John Doe');
    assert('Official registration number remains REG2021001 (unchanged)', updateProfileTry.data.data?.registerNumber === 'REG2021001');
    assert('Official roll number remains 21CS001 (unchanged)', updateProfileTry.data.data?.rollNumber === '21CS001');
    assert('Self-managed bio was updated', updateProfileTry.data.data?.bio?.includes('Verified cloud architect'));
    assert('Self-managed skills were updated', updateProfileTry.data.data?.skills?.includes('Kubernetes'));

    // 7. Project Creation with Markdown README Documentation
    console.log('\n--- Step 7: Project Creation with Markdown README ---');
    const readmeDoc = `# CloudPulse - Kubernetes Cluster Telemetry

## Overview
A real-time telemetry agent for distributed k8s pods.

## Features
- Prometheus metric scraping
- Grafana dashboard embedding
- WebSocket alert streaming

## Setup
\`\`\`bash
kubectl apply -f deploy/
\`\`\`
`;

    const createProjRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1Token}`
      },
      body: JSON.stringify({
        title: 'CloudPulse Telemetry',
        description: 'Distributed Kubernetes cluster telemetry daemon',
        readmeContent: readmeDoc,
        technologyUsed: 'Go,Kubernetes,React,Prometheus',
        category: 'Systems & Cloud',
        semester: 6,
        githubRepoUrl: 'https://github.com/johndoe/cloudpulse',
        liveDemoUrl: 'https://cloudpulse.demo.com',
        visibility: 'PUBLIC',
        status: 'APPROVED'
      })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Project created with status 200/201', createProjRes.status === 200 || createProjRes.status === 201);
    const createdId = createProjRes.data.data?.id;
    assert('Created project includes readmeContent', createProjRes.data.data?.readmeContent?.includes('Kubernetes Cluster Telemetry'));

    // Fetch Project by ID
    const fetchProjRes = await fetch(`${BASE_URL}/projects/${createdId}`, {
      headers: { 'Authorization': `Bearer ${student1Token}` }
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    assert('Project detail returns full Markdown README', fetchProjRes.data.data?.readmeContent?.includes('kubectl apply -f deploy/'));

    // 8. Project Privacy Security
    console.log('\n--- Step 8: Project Privacy Enforcement ---');
    const privateProjRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1Token}`
      },
      body: JSON.stringify({
        title: 'Confidential Exam System',
        description: 'Private faculty project',
        readmeContent: '# Confidential Exam System\nFaculty only.',
        technologyUsed: 'Java,Spring Security',
        category: 'Web Application',
        semester: 6,
        visibility: 'PRIVATE',
        status: 'APPROVED'
      })
    }).then(r => r.json().then(data => ({ status: r.status, data })));

    const privateId = privateProjRes.data.data?.id;

    // Student 2 (David) tries to view John's private project -> 403 Forbidden
    const unauthView = await fetch(`${BASE_URL}/projects/${privateId}`, {
      headers: { 'Authorization': `Bearer ${newStudentToken}` }
    }).then(r => ({ status: r.status }));

    assert('Other student is denied access to private project (403)', unauthView.status === 403);

    // Admin views private project -> 200 OK
    const adminView = await fetch(`${BASE_URL}/projects/${privateId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => ({ status: r.status }));

    assert('Admin can view private project (200)', adminView.status === 200);

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

runTests();
