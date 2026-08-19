const fs = require('fs');
const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:8080${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(url, { method, headers, timeout: 3000 }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(resData); } catch (e) { json = resData; }
        const inner = (json && typeof json === 'object' && 'data' in json) ? json.data : json;
        resolve({ status: res.statusCode, raw: json, body: inner });
      });
    });

    req.on('timeout', () => { req.destroy(); resolve({ status: 504, body: null }); });
    req.on('error', (err) => resolve({ status: 500, error: err.message, body: null }));
    if (data) req.write(data);
    req.end();
  });
}

async function validate() {
  const csvPath = 'docs/ClassVault--Students details - Sheet1.csv';
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

  const header = lines[0].split(',').map(c => c.trim());
  const dataRows = lines.slice(1);

  const regIdx = header.findIndex(h => h.toLowerCase().includes('register'));
  const nameIdx = header.findIndex(h => h.toLowerCase().includes('name'));
  const snoIdx = header.findIndex(h => h.toLowerCase().includes('s.no') || h.toLowerCase().includes('sno'));

  const validStudents = [];
  const invalidRows = [];
  const regNoCounts = {};
  const duplicateInCsv = [];

  dataRows.forEach((line, i) => {
    const rowNum = i + 2;
    const cols = line.split(',').map(c => c.trim());
    
    const sno = cols[snoIdx] || '';
    const regNo = cols[regIdx] || '';
    const name = cols[nameIdx] || '';

    const issues = [];
    if (!regNo) issues.push('Missing Register Number');
    if (!name) issues.push('Missing Student Name');

    if (regNo) {
      regNoCounts[regNo] = (regNoCounts[regNo] || 0) + 1;
      if (regNoCounts[regNo] > 1) {
        duplicateInCsv.push({ rowNum, regNo, name });
        issues.push(`Duplicate Register No: ${regNo}`);
      }
    }

    if (issues.length > 0) {
      invalidRows.push({ rowNum, line, issues });
    } else {
      validStudents.push({ rowNum, sno, registerNumber: regNo, name });
    }
  });

  // Query existing database students
  let existingInDb = [];
  try {
    const adminLogin = await request('POST', '/api/v1/auth/login', {
      username: 'admin@classvault.edu',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.body?.accessToken;
    if (adminToken) {
      const dbStudents = await request('GET', '/api/v1/admin/students?page=0&size=200', null, adminToken);
      const studentList = dbStudents.body?.content || [];
      const dbRegNos = new Set(studentList.map(s => (s.registerNumber || '').toUpperCase()));

      validStudents.forEach(s => {
        if (dbRegNos.has(s.registerNumber.toUpperCase())) {
          existingInDb.push(s);
        }
      });
    }
  } catch (e) {
    // Ignore error
  }

  console.log('VALIDATION_OUTPUT_START');
  console.log(JSON.stringify({
    totalRows: dataRows.length,
    headerColumns: header,
    validStudentsCount: validStudents.length,
    invalidRowsCount: invalidRows.length,
    invalidRowsDetail: invalidRows,
    duplicateInCsvCount: duplicateInCsv.length,
    duplicateInCsvDetail: duplicateInCsv,
    existingInDbCount: existingInDb.length,
    existingInDbDetail: existingInDb,
    readyForImportCount: validStudents.length - existingInDb.length,
    first5Students: validStudents.slice(0, 5),
    last5Students: validStudents.slice(-5),
    allValidStudents: validStudents
  }, null, 2));
  console.log('VALIDATION_OUTPUT_END');
}

validate();
