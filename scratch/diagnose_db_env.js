/**
 * Safe Diagnostic for Database & Environment Configuration
 * Never leaks passwords or secrets.
 */

function maskString(str) {
  if (!str || str.length <= 4) return '****';
  return str.substring(0, 2) + '****' + str.substring(str.length - 2);
}

function checkConfig() {
  console.log('====================================================');
  console.log('   CLASSVAULT — ENVIRONMENT & DATABASE DIAGNOSTIC   ');
  console.log('====================================================\n');

  const profile = process.env.SPRING_PROFILES_ACTIVE || '(not set, defaults to dev)';
  const dbUrl = process.env.DATABASE_URL || process.env.SPRING_DATASOURCE_URL || '';
  const dbUser = process.env.DATABASE_USERNAME || process.env.SPRING_DATASOURCE_USERNAME || '';
  const dbPass = process.env.DATABASE_PASSWORD || process.env.SPRING_DATASOURCE_PASSWORD || '';
  const jwtSecret = process.env.JWT_SECRET || '';

  console.log(`Spring Active Profile: ${profile}`);
  console.log(`Database Username:     ${dbUser ? dbUser : '(not set)'}`);
  console.log(`Database Password Set: ${dbPass ? 'YES (Length: ' + dbPass.length + ' chars)' : 'NO'}`);
  console.log(`JWT Secret Set:        ${jwtSecret ? 'YES (Length: ' + jwtSecret.length + ' chars)' : 'NO'}`);

  if (dbUrl) {
    try {
      // Safe parsing of JDBC URL: jdbc:postgresql://<host>:<port>/<db>?params
      const cleaned = dbUrl.replace(/^jdbc:/, '');
      const parsed = new URL(cleaned);
      console.log(`Database Protocol:     ${parsed.protocol.replace(':', '')}`);
      console.log(`Database Host:         ${parsed.hostname}`);
      console.log(`Database Port:         ${parsed.port || '5432'}`);
      console.log(`Database Name:         ${parsed.pathname.replace('/', '')}`);
      console.log(`SSL Mode / Query:      ${parsed.search || '(none)'}`);
      const isSupabase = parsed.hostname.includes('supabase');
      console.log(`Is Supabase Provider:  ${isSupabase ? 'YES' : 'NO'}`);
    } catch (e) {
      console.log(`Database URL (Masked): ${maskString(dbUrl)}`);
    }
  } else {
    console.log(`Database URL:          (not set)`);
  }

  console.log('\n====================================================');
}

checkConfig();
