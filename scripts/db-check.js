const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env manually without external packages
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

loadEnv();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.toezjlwmafgdeaknkpgq:Gaurang%401235@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function checkDatabase() {
  console.log('Connecting to Supabase PostgreSQL at:', connectionString.split('@')[1] || connectionString);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\nConnected to Supabase PostgreSQL database successfully!');

    const dbInfo = await client.query('SELECT current_database(), current_user, version();');
    console.log('\nDatabase Info:');
    console.log(`  Database: ${dbInfo.rows[0].current_database}`);
    console.log(`  User:     ${dbInfo.rows[0].current_user}`);
    console.log(`  Version:  ${dbInfo.rows[0].version}\n`);

    const users = await client.query('SELECT id, email, name, role, last_login_at FROM public.users;');
    console.log(`Users in public.users (${users.rows.length}):`);
    if (users.rows.length === 0) {
      console.log('  (No users registered yet)');
    } else {
      users.rows.forEach((u) => {
        console.log(`  - [${(u.role || 'user').toUpperCase()}] ${u.name} <${u.email}> (Last login: ${u.last_login_at || 'N/A'})`);
      });
    }

    const logs = await client.query(
      'SELECT id, email, domain, status, reason, created_at FROM public.audit_logs ORDER BY created_at DESC LIMIT 10;'
    );
    console.log(`\nRecent Audit Logs (${logs.rows.length}):`);
    if (logs.rows.length === 0) {
      console.log('  (No audit logs yet)');
    } else {
      logs.rows.forEach((l) => {
        console.log(`  - [${l.status}] ${l.email} (${l.domain}) - ${l.reason} at ${l.created_at}`);
      });
    }

    console.log('\nDatabase status: HEALTHY & READY\n');
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
