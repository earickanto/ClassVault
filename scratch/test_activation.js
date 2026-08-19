async function test() {
  const activateRes = await fetch('http://localhost:8080/api/v1/auth/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '21CS003', email: 'alex.chen@classvault.edu', password: 'AlexNewPassword@123' })
  });
  console.log('Activate status:', activateRes.status, await activateRes.json());

  const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '21CS003', password: 'AlexNewPassword@123' })
  });
  console.log('Login status:', loginRes.status, await loginRes.json());
}
test();
