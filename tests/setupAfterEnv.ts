import pool from '../src/db';

// close DB connection once all test suites have finished
afterAll(async () => {
  try {
    await pool.end();
  } catch (err) {
    console.warn('Error closing DB pool after tests', err);
  }
});
