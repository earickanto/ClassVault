const http = require('http');

const API_BASE = 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const url = new URL(API_BASE + endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return {
    status: res.status,
    ok: res.ok,
    data
  };
}

const results = [];
function record(step, status, details) {
  results.push({ step, status, details });
  console.log(`[${status}] ${step}: ${details}`);
}

async function runE2E() {
  console.log('========================================================');
  console.log('CLASSVAULT END-TO-END AUTOMATED VERIFICATION');
  console.log('========================================================\n');

  // 1. Health Check
  const health = await request('/health');
  if (health.status === 200 && health.data?.data?.status === 'UP') {
    record('1. Backend Health Check', 'PASS', 'Database is UP, Spring Boot operational');
  } else {
    record('1. Backend Health Check', 'FAIL', `Health returned status ${health.status}`);
  }

  // 2. Student Activation
  // 2a. Unauthorized student attempt
  const badActivation = await request('/auth/activate', {
    method: 'POST',
    body: { identifier: '99CS999', email: 'intruder@gmail.com', password: 'Password@123' }
  });
  if (badActivation.status === 401) {
    record('2a. Unauthorized Student Activation', 'PASS', 'Unauthorized student correctly rejected (401)');
  } else {
    record('2a. Unauthorized Student Activation', 'FAIL', `Expected 401, got ${badActivation.status}`);
  }

  // 2b. Mismatched email attempt
  const mismatchActivation = await request('/auth/activate', {
    method: 'POST',
    body: { identifier: '21CS001', email: 'wrong@gmail.com', password: 'Password@123' }
  });
  if (mismatchActivation.status === 401) {
    record('2b. Mismatched Email Activation', 'PASS', 'Mismatched email correctly rejected (401)');
  } else {
    record('2b. Mismatched Email Activation', 'FAIL', `Expected 401, got ${mismatchActivation.status}`);
  }

  // 2c. Authorized student activation
  const goodActivation = await request('/auth/activate', {
    method: 'POST',
    body: { identifier: '21CS001', email: 'john.doe@classvault.edu', password: 'Student@123' }
  });
  if (goodActivation.status === 200 && goodActivation.data?.data?.accessToken) {
    record('2c. Authorized Student Activation', 'PASS', 'John Doe activated account and received JWT token');
  } else {
    record('2c. Authorized Student Activation', 'FAIL', `Activation failed with status ${goodActivation.status}`);
  }

  // 3. Student Login & Auth
  // 3a. Invalid password attempt
  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: '21CS001', password: 'WrongPassword!123' }
  });
  if (badLogin.status === 401) {
    record('3a. Invalid Password Login', 'PASS', 'Invalid password rejected (401)');
  } else {
    record('3a. Invalid Password Login', 'FAIL', `Expected 401, got ${badLogin.status}`);
  }

  // 3b. Student A (John) Login with Roll Number (21CS001)
  const studentALogin = await request('/auth/login', {
    method: 'POST',
    body: { username: '21CS001', password: 'Student@123' }
  });
  let tokenA = studentALogin.data?.data?.accessToken;
  if (studentALogin.status === 200 && tokenA && studentALogin.data?.data?.role === 'ROLE_STUDENT') {
    record('3b. Student A (John) Roll Number Login', 'PASS', `Logged in successfully via Roll Number (21CS001)`);
  } else {
    record('3b. Student A (John) Roll Number Login', 'FAIL', `Login failed with status ${studentALogin.status}`);
  }

  // 3c. Student A (John) Login with Register Number (REG2021001)
  const regLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: 'REG2021001', password: 'Student@123' }
  });
  if (regLogin.status === 200 && regLogin.data?.data?.accessToken) {
    record('3c. Student A (John) Register Number Login', 'PASS', `Logged in successfully via Register Number (REG2021001)`);
  } else {
    record('3c. Student A (John) Register Number Login', 'FAIL', `Register number login failed with status ${regLogin.status}`);
  }

  // 3d. Student A (John) Login with Email (john.doe@classvault.edu)
  const emailLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: 'john.doe@classvault.edu', password: 'Student@123' }
  });
  if (emailLogin.status === 200 && emailLogin.data?.data?.accessToken) {
    record('3d. Student A (John) Email Login', 'PASS', `Logged in successfully via Email (john.doe@classvault.edu)`);
  } else {
    record('3d. Student A (John) Email Login', 'FAIL', `Email login failed with status ${emailLogin.status}`);
  }

  // 3e. Student B (Jane) Login with seeded password
  const studentBLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: '21CS002', password: 'Student@123' }
  });
  let tokenB = studentBLogin.data?.data?.accessToken;
  if (studentBLogin.status === 200 && tokenB) {
    record('3e. Student B (Jane) Login', 'PASS', `Logged in successfully as ${studentBLogin.data.data.name} (Roll: 21CS002)`);
  } else {
    record('3e. Student B (Jane) Login', 'FAIL', `Login failed with status ${studentBLogin.status}`);
  }

  // 4. Student Dashboard / Profile Metrics
  const studentMe = await request('/students/me', {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  if (studentMe.status === 200 && studentMe.data?.data?.leaderboardRank !== undefined) {
    const d = studentMe.data.data;
    record('4. Student Dashboard Metrics', 'PASS', `Dynamic Rank #${d.leaderboardRank}, Percentile: ${d.percentileAhead}%, Total Projects: ${d.projectCount}`);
  } else {
    record('4. Student Dashboard Metrics', 'FAIL', `Failed to load student profile (Status ${studentMe.status})`);
  }

  // 5. Create Private Project
  const newProject = {
    title: 'ClassVault Automated Private Verification Repo',
    description: 'A private repository specifically created to test access-control isolation.',
    technologyUsed: 'React,Java,Spring Boot,PostgreSQL',
    category: 'Security & Privacy',
    semester: 6,
    githubRepoUrl: 'https://github.com/test/vault',
    liveDemoUrl: 'https://vault.demo.com',
    visibility: 'PRIVATE'
  };
  const createdProject = await request('/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: newProject
  });
  const projectId = createdProject.data?.data?.id;
  if (createdProject.status === 201 && projectId && createdProject.data?.data?.visibility === 'PRIVATE') {
    record('5. Create Private Project', 'PASS', `Created private project ID #${projectId} ("${createdProject.data.data.title}")`);
  } else {
    record('5. Create Private Project', 'FAIL', `Failed to create private project (Status ${createdProject.status})`);
  }

  // 6. Private Project Security Checks
  // 6a. Search projects (Student B querying public projects)
  const publicExplore = await request('/projects', {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const inPublicList = publicExplore.data?.data?.content?.some(p => p.id === projectId);
  if (!inPublicList) {
    record('6a. Private Project Hidden in Public Explore', 'PASS', `Private project #${projectId} is NOT listed in public explore`);
  } else {
    record('6a. Private Project Hidden in Public Explore', 'FAIL', `Private project #${projectId} leaked into public explore!`);
  }

  // 6b. Search query for private project title
  const searchQuery = await request(`/projects?query=${encodeURIComponent('Automated Private Verification')}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const inSearch = searchQuery.data?.data?.content?.some(p => p.id === projectId);
  if (!inSearch) {
    record('6b. Private Project Hidden in Search', 'PASS', `Private project #${projectId} is NOT found in search results`);
  } else {
    record('6b. Private Project Hidden in Search', 'FAIL', `Private project #${projectId} leaked in search results!`);
  }

  // 6c. Direct API access by other student (IDOR attempt)
  const directUnauthorized = await request(`/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (directUnauthorized.status === 403) {
    record('6c. Direct Private Project Access (IDOR Prevention)', 'PASS', `Direct access by Student B rejected with 403 Forbidden ("${directUnauthorized.data?.message}")`);
  } else {
    record('6c. Direct Private Project Access (IDOR Prevention)', 'FAIL', `Direct access returned unexpected status ${directUnauthorized.status}`);
  }

  // 7. Owner Access & Visibility Modification
  // 7a. Owner views private project
  const ownerAccess = await request(`/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  if (ownerAccess.status === 200 && ownerAccess.data?.data?.id === projectId) {
    record('7a. Owner Private Project Access', 'PASS', `Owner John can view private project #${projectId}`);
  } else {
    record('7a. Owner Private Project Access', 'FAIL', `Owner could not view own project (Status ${ownerAccess.status})`);
  }

  // 7b. Owner toggles visibility to PUBLIC
  const makePublic = await request(`/projects/${projectId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: { ...newProject, visibility: 'PUBLIC' }
  });
  if (makePublic.status === 200 && makePublic.data?.data?.visibility === 'PUBLIC') {
    record('7b. Owner Change Visibility to PUBLIC', 'PASS', `Visibility toggled to PUBLIC`);
  } else {
    record('7b. Owner Change Visibility to PUBLIC', 'FAIL', `Failed to update visibility (Status ${makePublic.status})`);
  }

  // 8. Public Access and Interactions
  // 8a. Student B can now view the project
  const publicAccess = await request(`/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (publicAccess.status === 200 && publicAccess.data?.data?.id === projectId) {
    record('8a. Student B Access to Now-Public Project', 'PASS', `Student B can view public project #${projectId}`);
  } else {
    record('8a. Student B Access to Now-Public Project', 'FAIL', `Student B could not view public project (Status ${publicAccess.status})`);
  }

  // 8b. Student B likes the project
  const likeRes = await request(`/projects/${projectId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (likeRes.status === 200) {
    record('8b. Student B Like Public Project', 'PASS', `Project #${projectId} liked by Jane`);
  } else {
    record('8b. Student B Like Public Project', 'FAIL', `Failed to like project (Status ${likeRes.status})`);
  }

  // 8c. Student B comments on project
  const commentRes = await request(`/projects/${projectId}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: { content: 'Fantastic architecture! Verified working end to end.' }
  });
  if (commentRes.status === 201 && commentRes.data?.data?.content) {
    record('8c. Student B Comment on Project', 'PASS', `Comment posted: "${commentRes.data.data.content}"`);
  } else {
    record('8c. Student B Comment on Project', 'FAIL', `Failed to post comment (Status ${commentRes.status})`);
  }

  // 9. Admin Management & Moderation
  // 9a. Admin Login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: 'admin@classvault.edu', password: 'Admin@123' }
  });
  let adminToken = adminLogin.data?.data?.accessToken;
  if (adminLogin.status === 200 && adminToken && adminLogin.data?.data?.role === 'ROLE_ADMIN') {
    record('9a. Admin Login', 'PASS', `Logged in as System Admin (Role: ${adminLogin.data.data.role})`);
  } else {
    record('9a. Admin Login', 'FAIL', `Admin login failed (Status ${adminLogin.status})`);
  }

  // 9b. Admin Analytics Dashboard
  const adminStats = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (adminStats.status === 200 && adminStats.data?.data?.totalStudents !== undefined) {
    const s = adminStats.data.data;
    record('9b. Admin Dynamic Analytics', 'PASS', `Total Students: ${s.totalStudents}, Total Projects: ${s.totalProjects}, Views: ${s.totalViews}, Likes: ${s.totalLikes}`);
  } else {
    record('9b. Admin Dynamic Analytics', 'FAIL', `Failed to load admin analytics (Status ${adminStats.status})`);
  }

  // 9c. Admin Moderation & Feature Toggle
  const featureRes = await request(`/admin/projects/${projectId}/feature`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const statusRes = await request(`/admin/projects/${projectId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'APPROVED' }
  });
  if (featureRes.status === 200 && statusRes.status === 200) {
    record('9c. Admin Moderate & Feature Project', 'PASS', `Project #${projectId} approved and marked as Featured by Admin`);
  } else {
    record('9c. Admin Moderate & Feature Project', 'FAIL', `Moderation failed`);
  }

  // 10. Account Status Toggle Test
  // 10a. Admin disables student A
  const disableRes = await request(`/admin/students/1/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { enabled: false }
  });
  if (disableRes.status === 200) {
    record('10a. Admin Disables Student Account', 'PASS', `Student John Doe account status set to DISABLED`);
  } else {
    record('10a. Admin Disables Student Account', 'FAIL', `Failed to toggle student status`);
  }

  // 10b. Disabled student login attempt
  const disabledLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: '21CS001', password: 'Student@123' }
  });
  if (disabledLogin.status === 401) {
    record('10b. Disabled Student Login Attempt', 'PASS', `Disabled student login correctly DENIED (401 Unauthorized)`);
  } else {
    record('10b. Disabled Student Login Attempt', 'FAIL', `Disabled student login allowed (Status ${disabledLogin.status})`);
  }

  // 10c. Re-enable student A
  const reEnableRes = await request(`/admin/students/1/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { enabled: true }
  });
  const reLogin = await request('/auth/login', {
    method: 'POST',
    body: { username: '21CS001', password: 'Student@123' }
  });
  if (reEnableRes.status === 200 && reLogin.status === 200) {
    record('10c. Re-enabled Student Login', 'PASS', `Re-enabled student successfully logged in again (200 OK)`);
  } else {
    record('10c. Re-enabled Student Login', 'FAIL', `Re-enabled student login failed`);
  }

  // 11. Leaderboard Dynamic Calculation
  const leaderboard = await request('/leaderboard', {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  if (leaderboard.status === 200 && Array.isArray(leaderboard.data?.data) && leaderboard.data.data.length > 0) {
    const top = leaderboard.data.data[0];
    record('11. Dynamic Leaderboard Calculation', 'PASS', `Leaderboard active with ${leaderboard.data.data.length} students. Top student: ${top.name} (Score: ${top.score}, Rank #${top.rank}, Percentile: ${top.percentile}%)`);
  } else {
    record('11. Dynamic Leaderboard Calculation', 'FAIL', `Leaderboard failed to return valid rankings`);
  }

  console.log('\n========================================================');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================\n');
}

runE2E();
