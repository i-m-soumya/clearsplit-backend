import pool from './db';

async function testConnection() {
  try {
    console.log('Testing DB connection to Aiven...');
    const [rows, fields] = await pool.query('SELECT VERSION() as version');
    console.log('Connection successful!');
    console.log('Server MySQL Version:', (rows as any)[0].version);
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
