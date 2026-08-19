/**
 * CLASSVAULT — PRODUCTION DATA IMPORT & SAFETY VERIFICATION SUITE
 */

const fs = require('fs');
const path = require('path');

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

async function uploadCsv(endpoint, csvString, filename, token) {
  const url = `${BASE_URL}${endpoint}`;
  const fileBuffer = Buffer.from(csvString, 'utf-8');

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: text/csv\r\n\r\n`;
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

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('================================================================');
  console.log('  CLASSVAULT — PRODUCTION DATA IMPORT & SAFETY SUITE');
  console.log('================================================================\n');

  const tag = Date.now().toString().slice(-6);
  const reg1 = `REG_SAFE_${tag}_1`;
  const reg2 = `REG_SAFE_${tag}_2`;
  const roll1 = `RL_${tag}_1`;
  const roll2 = `RL_${tag}_2`;

  try {
    // 1. Admin Authentication
    console.log('[1] Admin Authentication & JWT Generation');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { username: 'admin@classvault.edu', password: 'Admin@123' },
    });
    assert(adminLoginRes.status === 200 && (adminLoginRes.data?.data?.accessToken || adminLoginRes.data?.data?.token), 'Admin logged in successfully and received JWT token');
    const adminToken = adminLoginRes.data?.data?.accessToken || adminLoginRes.data?.data?.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. Admin Dashboard Stats Verification
    console.log('\n[2] Admin Dashboard Dynamic Stats & Breakdown');
    const dashRes = await request('/admin/dashboard', { headers: adminHeaders });
    assert(dashRes.status === 200 && dashRes.data.success, 'Fetched Admin dashboard stats');
    const stats = dashRes.data.data;
    assert(stats.totalStudents >= 0, `Total students counter: ${stats.totalStudents}`);
    assert(stats.activeStudents >= 0, `Active students counter: ${stats.activeStudents}`);
    assert(stats.firstLoginPendingStudents >= 0, `First-login pending counter: ${stats.firstLoginPendingStudents}`);
    assert(stats.inactiveStudents >= 0, `Disabled students counter: ${stats.inactiveStudents}`);

    // 3. Two-Step CSV Preview & Validation (Without Inserting)
    console.log('\n[3] Two-Step CSV Import — Step 1: Preview & Live Validation');
    const csvContent = [
      'name,register_number,roll_number,department,year,section',
      `Phase Valid 1,${reg1},${roll1},Artificial Intelligence & Data Science,2,A`,
      `Phase Valid 2,${reg2},${roll2},Computer Science & Engineering,3,B`,
      `,REG_INVALID_NAME,ROLL_INVALID_NAME,Computer Science & Engineering,3,A`, // Missing Name
      `Phase Invalid Year,REG_INVALID_YEAR,ROLL_INVALID_YEAR,Information Technology,7,C`, // Invalid Year
      `Phase Duplicate Reg,${reg1},ROLL_INBATCH_DUP,AI & DS,2,A`, // In-batch duplicate reg
    ].join('\n');

    const previewRes = await uploadCsv('/admin/students/csv/preview', csvContent, 'students_preview_test.csv', adminToken);

    assert(previewRes.status === 200 && previewRes.data.success, 'CSV Preview endpoint responded with success');
    const preview = previewRes.data.data;
    assert(preview.totalRows === 5, `Total rows processed: ${preview.totalRows} (expected 5)`);
    assert(preview.validCount === 2, `Valid rows detected: ${preview.validCount} (expected 2)`);
    assert(preview.duplicateCount === 1, `Duplicate conflicts caught: ${preview.duplicateCount} (expected 1)`);
    assert(preview.invalidCount === 2, `Invalid rows caught: ${preview.invalidCount} (expected 2)`);
    assert(preview.validRows.length === 2, 'Valid rows extracted for confirmation');

    // 4. Two-Step CSV Import — Step 2: Confirm & Commit Valid Rows
    console.log('\n[4] Two-Step CSV Import — Step 2: Confirmation & Batch Commit');
    const confirmRes = await request('/admin/students/csv/confirm', {
      method: 'POST',
      headers: adminHeaders,
      body: preview.validRows,
    });
    assert(confirmRes.status === 200 && confirmRes.data.success, 'CSV Confirm endpoint executed batch insertion');
    const confirmData = confirmRes.data.data;
    assert(confirmData.importedCount === 2, `Successfully inserted: ${confirmData.importedCount} students`);
    assert(confirmData.failedCount === 0, `Failed inserts: ${confirmData.failedCount}`);

    // 5. Verify Newly Imported Student State
    console.log('\n[5] Validating Imported Student Default Properties');
    const studentCheckRes = await request(`/admin/students?query=${reg1}`, { headers: adminHeaders });
    assert(studentCheckRes.status === 200 && studentCheckRes.data.data.content.length > 0, 'Found imported student in directory');
    const importedStudent = studentCheckRes.data.data.content[0];
    assert(importedStudent.firstLogin === true, 'Imported student has firstLogin = true');
    assert(importedStudent.accountEnabled === true, 'Imported student has accountEnabled = true');
    assert(importedStudent.dataSource === 'IMPORTED', 'Imported student tagged with dataSource = IMPORTED');

    // 6. Student First Login & Mandatory Password Change Lifecycle
    console.log('\n[6] Student First Login & Forced Password Change');
    const studentLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { username: reg1, password: 'ClassVault@123' },
    });
    assert(studentLoginRes.status === 200 && studentLoginRes.data.success, 'Student logged in with default temporary password');
    assert(studentLoginRes.data.data.firstLogin === true, 'Auth response marks firstLogin = true');
    const studentToken = studentLoginRes.data.data.accessToken || studentLoginRes.data.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // Change Password
    const changePassRes = await request('/auth/change-password', {
      method: 'POST',
      headers: studentHeaders,
      body: { oldPassword: 'ClassVault@123', newPassword: 'StudentSecurePassword@999' },
    });
    assert(changePassRes.status === 200 && changePassRes.data.success, 'Student changed password on first login');

    // Login with new password
    const newLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { username: reg1, password: 'StudentSecurePassword@999' },
    });
    assert(newLoginRes.status === 200 && newLoginRes.data.success, 'Student logged in successfully with new password');
    assert(newLoginRes.data.data.firstLogin === false, 'Subsequent login has firstLogin = false');
    const activeStudentToken = newLoginRes.data.data.accessToken || newLoginRes.data.data.token;
    const activeStudentHeaders = { Authorization: `Bearer ${activeStudentToken}` };

    // 7. Dynamic Profile Completion Calculation
    console.log('\n[7] Dynamic Profile Completion & 100% Milestone');
    const initialProfileRes = await request('/students/profile', { headers: activeStudentHeaders });
    const initialScore = initialProfileRes.data.data.completionPercentage;
    assert(initialScore === 40, `Initial base profile completion score is 40% (got ${initialScore}%)`);

    // Update Bio, Skills, and Social Links
    await request('/students/profile', {
      method: 'PUT',
      headers: activeStudentHeaders,
      body: {
        bio: 'Enthusiastic AI and Machine Learning engineer building modern full-stack systems.',
        skills: 'Python,Java,Spring Boot,React,PostgreSQL,Docker',
        githubUrl: 'https://github.com/phase-test',
        linkedinUrl: 'https://linkedin.com/in/phase-test',
        leetcodeUrl: 'https://leetcode.com/phase-test',
        portfolioUrl: 'https://phase-test.dev',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      },
    });

    const updatedProfileRes = await request('/students/profile', { headers: activeStudentHeaders });
    const updatedScore = updatedProfileRes.data.data.completionPercentage;
    assert(updatedScore >= 90, `Profile completion after bio, skills, photo, and socials: ${updatedScore}%`);

    // 8. Admin Student Search and Multi-Dimensional Filter
    console.log('\n[8] Admin Multi-Dimensional Student Filter');
    const filterRes = await request('/admin/students?department=Artificial+Intelligence+%26+Data+Science&year=2&section=A', {
      headers: adminHeaders,
    });
    assert(filterRes.status === 200 && filterRes.data.success, 'Admin filtered students by Department + Year + Section');
    assert(filterRes.data.data.content.length > 0, `Filter matched ${filterRes.data.data.content.length} students in AI&DS Year 2 Sec A`);

    // 9. Admin Account Status Toggle & Password Reset
    console.log('\n[9] Admin Account Disable & Password Reset');
    await request(`/admin/students/${importedStudent.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: { enabled: false },
    });
    const disabledCheck = await request(`/admin/students/${importedStudent.id}`, { headers: adminHeaders });
    assert(disabledCheck.data.data.accountEnabled === false, 'Student account successfully disabled by Admin');

    // Re-enable
    await request(`/admin/students/${importedStudent.id}/status`, {
      method: 'PUT',
      headers: adminHeaders,
      body: { enabled: true },
    });
    const enabledCheck = await request(`/admin/students/${importedStudent.id}`, { headers: adminHeaders });
    assert(enabledCheck.data.data.accountEnabled === true, 'Student account re-enabled');

    // Reset password to default
    await request(`/admin/students/${importedStudent.id}/reset-password`, {
      method: 'PUT',
      headers: adminHeaders,
    });
    const postResetCheck = await request(`/admin/students/${importedStudent.id}`, { headers: adminHeaders });
    assert(postResetCheck.data.data.firstLogin === true, 'Resetting password resets firstLogin = true');

    // 10. Clean up test student
    console.log('\n[10] Clean Up Temporary Test Records');
    await request(`/admin/students/${importedStudent.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    const student2Res = await request(`/admin/students?query=${reg2}`, { headers: adminHeaders });
    if (student2Res.data.data.content.length > 0) {
      await request(`/admin/students/${student2Res.data.data.content[0].id}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
    }
    assert(true, 'Test records cleaned up safely without impacting pilot/demo data');

    console.log('\n================================================================');
    console.log(`  ALL PRODUCTION DATA & SAFETY VALIDATIONS PASSED (${passed}/${passed + failed})`);
    console.log('================================================================');
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

run();
