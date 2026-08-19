/**
 * Safe Diagnostic for Database & Environment Configuration
 * Never leaks passwords or secrets. Masks all sensitive values as ********.
 */

const fs = require('fs');

function maskString(str) {
  if (!str) return '(empty)';
  return '********';
}

function checkConfig() {
  console.log('====================================================');
  console.log('   CLASSVAULT — PRODUCTION ENVIRONMENT DIAGNOSTIC   ');
  console.log('====================================================\n');

  // Load .env if present
  const envVars = {};
  if (fs.existsSync('.env')) {
    const raw = fs.readFileSync('.env', 'utf-8');
    raw.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const idx = line.indexOf('=');
      if (idx > 0) {
        const k = line.substring(0, idx).trim();
        let v = line.substring(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.substring(1, v.length - 1);
        }
        envVars[k] = v;
      }
    });
  }

  const profile = envVars.SPRING_PROFILES_ACTIVE || process.env.SPRING_PROFILES_ACTIVE || '(not set)';
  const dbUrl = envVars.DATABASE_URL || process.env.DATABASE_URL || '';
  const dbUser = envVars.DATABASE_USERNAME || process.env.DATABASE_USERNAME || '';
  const dbPass = envVars.DATABASE_PASSWORD || process.env.DATABASE_PASSWORD || '';
  const jwtSecret = envVars.JWT_SECRET || process.env.JWT_SECRET || '';
  const serverPort = envVars.SERVER_PORT || process.env.SERVER_PORT || '8080';

  console.log(`1. .env File Exists:        ${fs.existsSync('.env') ? 'YES' : 'NO'}`);
  console.log(`2. SPRING_PROFILES_ACTIVE:  ${profile} ${profile === 'prod' ? '✓ (PASS)' : '✗ (FAIL)'}`);
  console.log(`3. DATABASE_USERNAME:       ${dbUser} ${dbUser === 'postgres' ? '✓ (PASS)' : '✗'}`);
  console.log(`4. DATABASE_PASSWORD:       ${dbPass ? '******** (Length: ' + dbPass.length + ' chars) ✓ (PASS)' : '(empty) ✗ (FAIL)'}`);
  console.log(`5. JWT_SECRET:              ${jwtSecret ? '******** (Length: ' + jwtSecret.length + ' chars) ✓ (PASS)' : '(empty) ✗ (FAIL)'}`);
  console.log(`6. SERVER_PORT:             ${serverPort} ${serverPort === '8080' ? '✓ (PASS)' : ''}`);

  if (dbUrl) {
    const usesJdbc = dbUrl.startsWith('jdbc:postgresql://');
    const isSupabase = dbUrl.includes('supabase.co') || dbUrl.includes('supabase.com');
    const usesSsl = dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true');

    try {
      const cleaned = dbUrl.replace(/^jdbc:/, '');
      const parsed = new URL(cleaned);
      console.log(`7. DATABASE_URL Protocol:   ${parsed.protocol.replace(':', '')} ${usesJdbc ? '✓ (PASS: uses jdbc:postgresql://)' : '✗'}`);
      console.log(`8. DATABASE_URL Host:       ${parsed.hostname} ${isSupabase ? '✓ (PASS: points to Supabase)' : '✗'}`);
      console.log(`9. DATABASE_URL SSL Mode:   ${parsed.search || '(none)'} ${usesSsl ? '✓ (PASS: sslmode=require)' : '✗'}`);
    } catch (e) {
      console.log(`7. DATABASE_URL Valid:      ${usesJdbc && isSupabase ? '✓ (PASS)' : '✗'}`);
    }
  } else {
    console.log(`7. DATABASE_URL:            (not set) ✗ (FAIL)`);
  }

  console.log('\n====================================================');
}

checkConfig();
