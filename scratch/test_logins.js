async function testLogins() {
  const tests = [
    { label: 'Demo Student Roll Number (21CS001)', username: '21CS001', password: 'Student@123' },
    { label: 'Demo Student Register Number (REG2021001)', username: 'REG2021001', password: 'Student@123' },
    { label: 'Demo Student Email (john.doe@classvault.edu)', username: 'john.doe@classvault.edu', password: 'Student@123' },
    { label: 'Demo Admin Email (admin@classvault.edu)', username: 'admin@classvault.edu', password: 'Admin@123' },
  ];

  for (const t of tests) {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: t.username, password: t.password })
    });
    const data = await res.json();
    console.log(`[${res.status}] ${t.label}:`, data.success ? `SUCCESS (Role: ${data.data?.role}, User: ${data.data?.name})` : `FAILED (${data.message})`);
  }
}
testLogins();
