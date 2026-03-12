import dotenv from 'dotenv';

// jest setup - load env vars

dotenv.config({ path: './.env' });

// set test environment
process.env.NODE_ENV = 'test';
