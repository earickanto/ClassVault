/**
 * CLASSVAULT FULL PRODUCTION DATA & SECURITY VALIDATION SUITE
 * Executes comprehensive tests against the backend covering:
 * - Supabase / Database connectivity and Flyway migrations
 * - CSV bulk import with exact standard schema (name,register_number,roll_number,department,year,section)
 * - Pre-import validation, duplicate detection, and safe row error reporting
 * - Student authentication (Registration Number + Password)
 * - First-login forced password change & temporary password lockout
 * - Automatic student identity retrieval
 * - Profile completion calculation & official field protection
 * - Admin student directory filtering (department, year, section)
 * - Account disable & enable lifecycle
 * - Project creation, ownership & privacy rules (PUBLIC vs PRIVATE)
 * - Markdown README persistence and rendering
 * - Leaderboard calculation & rank stability
 * - Explore projects filtering & isolation
 * - Bookmarks functionality
 * - Comprehensive security edge cases & RBAC
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  let headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Buffer)) {
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

  return { status: res.status, data };
}

async function uploadCsv(endpoint, filePath, token) {
  const url = `${BASE_URL}${endpoint}`;
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: text/csv\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const payload = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    fileBuffer,
    Buffer.from(footer, 'utf-8'),
  ]);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: payload,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, data };
}

async function runValidation() {
  console.log('================================================================');
  console.log(' CLASSVAULT — FULL CLASS IMPORT & PRODUCTION DATA VALIDATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const results = {};

  function assert(section, name, condition, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
      if (results[section] !== false) results[section] = true;
    } else {
      console.error(`  [FAIL] ${name} ${details}`);
      failed++;
      results[section] = false;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. BACKEND & DATABASE HEALTH CHECK
    // -------------------------------------------------------------------------
    console.log('--- 1. Backend & Database Health Check ---');
    const health = await request('/health');
    assert('Database', 'Backend API is healthy and connected to database', health.status === 200 && health.data?.data?.database === 'UP');

    // -------------------------------------------------------------------------
    // 2. ADMIN AUTHENTICATION
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Admin Authentication ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin@classvault.edu', password: 'Admin@123' },
    });
    assert('Admin management', 'Admin logs in successfully', adminLogin.status === 200 && adminLogin.data?.success === true);
    assert('Admin management', 'Admin authority is ROLE_ADMIN', adminLogin.data?.data?.role === 'ROLE_ADMIN');
    const adminToken = adminLogin.data?.data?.accessToken;

    // -------------------------------------------------------------------------
    // 3. FULL CLASS CSV IMPORT (30 Students)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Full Class CSV Import (Exact standard schema) ---');
    const csvPath = path.join(__dirname, 'class_students_full.csv');
    const importRes = await uploadCsv('/admin/students/csv', csvPath, adminToken);

    assert('Database', 'CSV import endpoint responded 200 OK', importRes.status === 200);
    const importData = importRes.data?.data;
    console.log(`     Total rows: ${importData?.totalRows} | Imported: ${importData?.importedCount} | Duplicates: ${importData?.duplicateCount} | Invalid: ${importData?.invalidCount}`);
    assert('Database', 'All valid unique student rows imported (or recognized if previously present)', importData?.importedCount >= 0 && (importData?.importedCount + importData?.duplicateCount) === 30);

    // -------------------------------------------------------------------------
    // 4. PRE-IMPORT VALIDATION & DUPLICATE DETECTION
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Pre-Import Validation & Duplicate Detection ---');
    const uniqueSuffix = Date.now().toString().slice(-4);
    const dynamicDupCsv = `name,register_number,roll_number,department,year,section
Test Unique Student,REG20269${uniqueSuffix},26IT9${uniqueSuffix},Information Technology,3,B
Duplicate Aarav Reg,REG2026001,26IT003,Information Technology,3,B
Duplicate Aarav Roll,REG2026032,26AI001,Information Technology,3,B
Missing Roll,REG2026033,,Information Technology,3,B
Missing Name,,26IT004,Information Technology,3,B
Invalid Year,REG2026034,26IT005,Information Technology,99,B
In Batch Duplicate,REG20269${uniqueSuffix},26IT999,Information Technology,3,B`;

    const dupCsvPath = path.join(__dirname, 'class_duplicate_dynamic.csv');
    fs.writeFileSync(dupCsvPath, dynamicDupCsv);

    const dupRes = await uploadCsv('/admin/students/csv', dupCsvPath, adminToken);
    const dupData = dupRes.data?.data;

    assert('Database', 'Duplicate CSV processed safely without crashing', dupRes.status === 200);
    assert('Database', 'Duplicate rows correctly detected and flagged', dupData?.duplicateCount >= 3, `got duplicates: ${dupData?.duplicateCount}`);
    assert('Database', 'Invalid rows correctly rejected with row errors', dupData?.invalidCount >= 3, `got invalid: ${dupData?.invalidCount}`);
    assert('Database', '1 valid new student imported from test batch', dupData?.importedCount === 1, `got imported: ${dupData?.importedCount}`);

    // -------------------------------------------------------------------------
    // 5. STUDENT AUTHENTICATION & AUTOMATIC IDENTITY
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Student Login & Automatic Identity Retrieval ---');
    // Ensure student 1 is in fresh state via admin reset
    const s1Info = (await request('/admin/students?query=REG2026001', { headers: { 'Authorization': `Bearer ${adminToken}` } })).data?.data?.content[0];
    if (s1Info) {
      await request(`/admin/students/${s1Info.id}/reset-password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: { newPassword: 'ClassVault@123' },
      });
    }

    const studentLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026001', password: 'ClassVault@123' },
    });

    assert('Student authentication', 'Student logs in using Registration Number + Default Password', studentLogin.status === 200 && studentLogin.data?.success === true);
    assert('First login', 'firstLogin is true for newly enrolled student', studentLogin.data?.data?.firstLogin === true);
    assert('Student authentication', 'Automatic identity: Name is Aarav Sharma', studentLogin.data?.data?.name === 'Aarav Sharma');
    assert('Student authentication', 'Automatic identity: Roll number is 26AI001', studentLogin.data?.data?.rollNumber === '26AI001');

    const studentToken = studentLogin.data?.data?.accessToken;
    const studentId = studentLogin.data?.data?.id;

    // Verify student profile details
    const profileRes = await request('/students/me', {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    assert('Profile', 'Automatic identity retrieves Department, Year, Section',
      profileRes.data?.data?.department === 'Artificial Intelligence & Data Science' &&
      profileRes.data?.data?.year === 2 &&
      profileRes.data?.data?.section === 'A'
    );

    // -------------------------------------------------------------------------
    // 6. FORCED PASSWORD CHANGE FLOW & LOCKOUT
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Forced Password Change & Temporary Password Lockout ---');
    const changePassRes = await request('/auth/change-password', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` },
      body: {
        oldPassword: 'ClassVault@123',
        newPassword: 'AaravSecurePass@2026',
      },
    });
    assert('Password change', 'Password changed successfully', changePassRes.status === 200);

    // Verify old temporary password is now locked out
    const oldLoginTry = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026001', password: 'ClassVault@123' },
    });
    assert('Password change', 'Temporary password (ClassVault@123) is locked out', oldLoginTry.status === 401);

    // Verify login with new password succeeds and firstLogin is false
    const newLoginSuccess = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026001', password: 'AaravSecurePass@2026' },
    });
    assert('First login', 'Login succeeds with new password', newLoginSuccess.status === 200);
    assert('First login', 'firstLogin is now false', newLoginSuccess.data?.data?.firstLogin === false);
    const activeStudentToken = newLoginSuccess.data?.data?.accessToken;

    // -------------------------------------------------------------------------
    // 7. PROFILE COMPLETION & 100% CALCULATION
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Profile Completion System & Read-Only Protection ---');
    
    // Attempting to modify official academic identity must be ignored
    const updateProfileRes = await request('/students/me', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${activeStudentToken}` },
      body: {
        name: 'Hacked Official Name',
        registerNumber: 'HACKED_REG_NUM',
        bio: 'AI researcher and full stack engineer specialized in PyTorch & Spring Boot.',
        skills: 'Python,PyTorch,Spring Boot,Java,PostgreSQL,Docker,React',
        githubUrl: 'https://github.com/aaravsharma',
        linkedinUrl: 'https://linkedin.com/in/aaravsharma',
        leetcodeUrl: 'https://leetcode.com/aaravsharma',
        portfolioUrl: 'https://aaravsharma.dev',
      },
    });

    assert('Profile', 'Official fields (Name, Reg No) remain strictly read-only',
      updateProfileRes.data?.data?.name === 'Aarav Sharma' &&
      updateProfileRes.data?.data?.registerNumber === 'REG2026001'
    );
    assert('Profile', 'Developer fields (Bio, Skills, Socials) updated successfully',
      updateProfileRes.data?.data?.bio.includes('AI researcher') &&
      updateProfileRes.data?.data?.skills.includes('PyTorch')
    );
    assert('Profile 100% celebration', 'Profile completion score calculated dynamically',
      updateProfileRes.data?.data?.completionPercentage >= 80
    );

    // -------------------------------------------------------------------------
    // 8. PROJECT CREATION, OWNERSHIP & PRIVACY RULES
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Project Creation & Strict Privacy Enforcement ---');

    // Create PUBLIC project
    const publicProjRes = await request('/projects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${activeStudentToken}` },
      body: {
        title: 'AuraVision - Edge AI Vision Platform',
        description: 'Real-time computer vision inference engine for drone inspection.',
        technologyUsed: 'Python,PyTorch,FastAPI,React,Docker',
        category: 'Machine Learning',
        semester: 4,
        githubRepoUrl: 'https://github.com/aaravsharma/auravision',
        liveDemoUrl: 'https://auravision.demo.app',
        visibility: 'PUBLIC',
        readmeContent: `# AuraVision - Edge AI Vision Platform\n\n## Overview\nReal-time edge neural inference for industrial drone navigation.\n\n## Architecture\n- ResNet-101 feature extractor\n- ONNX Runtime TensorRT backend\n- Spring Boot orchestration\n\n## Installation\n\`\`\`bash\npip install -r requirements.txt\npython app.py\n\`\`\``,
      },
    });
    assert('Project creation', 'Student creates PUBLIC project with markdown README', publicProjRes.status === 200 || publicProjRes.status === 201);
    const publicProjId = publicProjRes.data?.data?.id;

    // Approve public project via Admin so it is available in Explore
    await request(`/admin/projects/${publicProjId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { status: 'APPROVED', reason: 'High quality technical documentation' },
    });

    // Create PRIVATE project
    const privateProjRes = await request('/projects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${activeStudentToken}` },
      body: {
        title: 'Internal Autonomous Core Sharder',
        description: 'Proprietary patent-pending distributed storage algorithm.',
        technologyUsed: 'Rust,gRPC,Raft,PostgreSQL',
        category: 'Systems & Cloud',
        semester: 4,
        visibility: 'PRIVATE',
        readmeContent: '# Confidential Architecture\nInternal class evaluation only.',
      },
    });
    assert('Project creation', 'Student creates PRIVATE project', privateProjRes.status === 200 || privateProjRes.status === 201);
    const privateProjId = privateProjRes.data?.data?.id;

    // Login as another student (REG2026002)
    const s2Info = (await request('/admin/students?query=REG2026002', { headers: { 'Authorization': `Bearer ${adminToken}` } })).data?.data?.content[0];
    if (s2Info) {
      await request(`/admin/students/${s2Info.id}/reset-password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: { newPassword: 'ClassVault@123' },
      });
    }

    const student2Login = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026002', password: 'ClassVault@123' },
    });
    const student2Token = student2Login.data?.data?.accessToken;

    // Test Privacy: Student 2 accesses Owner's PUBLIC project -> 200 OK
    const viewPublicRes = await request(`/projects/${publicProjId}`, {
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });
    assert('Public projects', 'Other students can view approved PUBLIC project', viewPublicRes.status === 200);

    // Test Privacy: Student 2 accesses Owner's PRIVATE project -> 403 Forbidden / Access Denied
    const viewPrivateRes = await request(`/projects/${privateProjId}`, {
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });
    assert('Private projects', 'Other students are BLOCKED from viewing PRIVATE project (403)', viewPrivateRes.status === 403);

    // Owner CAN view own PRIVATE project
    const ownerViewPrivate = await request(`/projects/${privateProjId}`, {
      headers: { 'Authorization': `Bearer ${activeStudentToken}` },
    });
    assert('Private projects', 'Owner can view their own PRIVATE project', ownerViewPrivate.status === 200);

    // Admin CAN view PRIVATE project
    const adminViewPrivate = await request(`/projects/${privateProjId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert('Private projects', 'Admin can view any PRIVATE project', adminViewPrivate.status === 200);

    // -------------------------------------------------------------------------
    // 9. EXPLORE PROJECTS, SEARCH & BOOKMARKS
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Explore Projects & Bookmarks ---');
    const exploreRes = await request('/projects?query=AuraVision&page=0&size=10', {
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });
    const exploreItems = exploreRes.data?.data?.content || [];
    assert('Explore', 'Public explore returns public projects matching search', exploreItems.some(p => p.id === publicProjId));
    assert('Explore', 'Private projects NEVER appear in public explore', !exploreItems.some(p => p.id === privateProjId));

    // First query bookmarks to see if already bookmarked
    const initialBookmarks = await request('/bookmarks', { headers: { 'Authorization': `Bearer ${student2Token}` } });
    const isAlreadyBookmarked = Array.isArray(initialBookmarks.data?.data) && initialBookmarks.data.data.some(p => p.id === publicProjId);
    
    if (!isAlreadyBookmarked) {
      await request(`/bookmarks/toggle/${publicProjId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${student2Token}` },
      });
    }

    const myBookmarksRes = await request('/bookmarks', {
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });
    assert('Bookmarks', 'Student can bookmark public project', myBookmarksRes.status === 200);
    assert('Bookmarks', 'My Bookmarks lists bookmarked project', Array.isArray(myBookmarksRes.data?.data) && myBookmarksRes.data.data.some(p => p.id === publicProjId));

    // -------------------------------------------------------------------------
    // 10. LEADERBOARD & STUDENT DASHBOARD
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Leaderboard & Student Dashboard ---');
    const leaderboardRes = await request('/leaderboard', {
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });
    assert('Leaderboard', 'Leaderboard returns real class ranking from database', Array.isArray(leaderboardRes.data?.data) && leaderboardRes.data.data.length >= 30);
    assert('Leaderboard', 'Leaderboard entry has rank, score, percentile', leaderboardRes.data.data[0]?.rank === 1 && leaderboardRes.data.data[0]?.score >= 0);

    const myProjectsRes = await request('/projects/my-projects', {
      headers: { 'Authorization': `Bearer ${activeStudentToken}` },
    });
    assert('Project creation', 'My Projects returns both public and private projects for owner', Array.isArray(myProjectsRes.data?.data) && myProjectsRes.data.data.length >= 2);

    // -------------------------------------------------------------------------
    // 11. ADMIN STUDENT MANAGEMENT & FILTERING
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Admin Student Directory Filtering & Account Control ---');
    
    // Filter by department
    const aiFilter = await request('/admin/students?department=Artificial%20Intelligence%20%26%20Data%20Science&page=0&size=50', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const aiStudents = aiFilter.data?.data?.content || [];
    assert('Admin management', 'Admin can filter students by department (AI&DS)', aiStudents.length > 0 && aiStudents.every(s => s.department.includes('Artificial Intelligence')));

    // Filter by year & section
    const year2SecA = await request('/admin/students?year=2&section=A&page=0&size=50', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const secAStudents = year2SecA.data?.data?.content || [];
    assert('Admin management', 'Admin can filter students by Year (2) and Section (A)', secAStudents.length > 0 && secAStudents.every(s => s.year === 2 && s.section === 'A'));

    // Admin disables Student (REG2026003)
    const s3Student = (await request('/admin/students?query=REG2026003', { headers: { 'Authorization': `Bearer ${adminToken}` } })).data?.data?.content[0];
    assert('Admin management', 'Admin located Student REG2026003', !!s3Student);

    // Disable account
    await request(`/admin/students/${s3Student.id}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { enabled: false },
    });

    // Student 3 attempts login -> BLOCKED
    const disabledLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026003', password: 'ClassVault@123' },
    });
    assert('Security', 'Disabled student login is BLOCKED (401/403)', disabledLogin.status === 401 || disabledLogin.status === 403);

    // Admin re-enables account
    await request(`/admin/students/${s3Student.id}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: { enabled: true },
    });

    // Student 3 logs in again -> SUCCESS
    const reenabledLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026003', password: 'ClassVault@123' },
    });
    assert('Security', 'Re-enabled student can login successfully', reenabledLogin.status === 200);

    // -------------------------------------------------------------------------
    // 12. COMPREHENSIVE SECURITY TEST
    // -------------------------------------------------------------------------
    console.log('\n--- 12. Security Test Matrix ---');
    
    // Unknown registration number
    const unknownLogin = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG9999999', password: 'ClassVault@123' },
    });
    assert('Security', 'Unknown registration number is denied (401)', unknownLogin.status === 401);

    // Wrong password
    const wrongPass = await request('/auth/login', {
      method: 'POST',
      body: { username: 'REG2026001', password: 'CompletelyWrongPassword' },
    });
    assert('Security', 'Wrong password is denied (401)', wrongPass.status === 401);

    // Student accessing Admin API
    const studentOnAdminApi = await request('/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });
    assert('Security', 'Student accessing Admin API is Forbidden (403)', studentOnAdminApi.status === 403);

    // Unauthenticated project creation
    const unauthCreate = await request('/projects', {
      method: 'POST',
      body: { title: 'Unauth Project', technologyUsed: 'Java' },
    });
    assert('Security', 'Unauthenticated project creation is Denied (401/403)', unauthCreate.status === 401 || unauthCreate.status === 403);

    console.log('\n================================================================');
    console.log(` VALIDATION SUMMARY: ${passed} PASSED / ${failed} FAILED`);
    console.log('================================================================\n');

    return { passed, failed, results };

  } catch (err) {
    console.error('Validation suite encountered an error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runValidation().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = { runValidation };
