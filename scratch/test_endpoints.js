async function debugEndpoints() {
  const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '21CS001', password: 'Student@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const meRes = await fetch('http://localhost:8080/api/v1/students/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('GET /students/me:', await meRes.json());

  const lbRes = await fetch('http://localhost:8080/api/v1/leaderboard');
  console.log('GET /leaderboard:', await lbRes.json());
}
debugEndpoints();
