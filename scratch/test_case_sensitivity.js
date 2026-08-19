async function testCaseSensitivity() {
  const tests = [
    { label: 'Lowercase Roll Number (21cs001)', username: '21cs001', password: 'Student@123' },
    { label: 'Lowercase Register Number (reg2021001)', username: 'reg2021001', password: 'Student@123' },
    { label: 'Uppercase Email (JOHN.DOE@CLASSVAULT.EDU)', username: 'JOHN.DOE@CLASSVAULT.EDU', password: 'Student@123' },
    { label: 'Uppercase Admin Email (ADMIN@CLASSVAULT.EDU)', username: 'ADMIN@CLASSVAULT.EDU', password: 'Admin@123' },
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
testCaseSensitivity();
