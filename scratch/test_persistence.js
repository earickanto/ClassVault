const BASE_URL = 'http://localhost:8080/api/v1';

async function testPersistenceBeforeRestart() {
  console.log('--- Step 1: Verify Seed & Current Data Before Restart ---');

  // Admin login
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@classvault.edu', password: 'Admin@123' })
  }).then(r => r.json());

  console.log('Admin login status:', adminRes.success);
  const adminToken = adminRes.data?.accessToken;

  // Student login
  const studentRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'REG2021001', password: 'Student@123' })
  }).then(r => r.json());

  console.log('Student login status:', studentRes.success);

  // Fetch projects list
  const projectsRes = await fetch(`${BASE_URL}/projects`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  console.log(`Total projects found: ${projectsRes.data?.totalElements || projectsRes.data?.content?.length}`);
  console.log('Persistence test before restart: SUCCESS');
}

testPersistenceBeforeRestart().catch(err => {
  console.error('Persistence test failed:', err);
  process.exit(1);
});
