async function testJane() {
  const res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '21CS002', password: 'Student@123' })
  });
  console.log('Jane login with Student@123:', res.status, await res.json());

  const resSarah = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '21CS004', password: 'Student@123' })
  });
  console.log('Sarah login with Student@123:', resSarah.status, await resSarah.json());
}
testJane();
