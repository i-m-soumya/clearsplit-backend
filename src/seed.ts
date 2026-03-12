import pool from './db';
import bcrypt from 'bcryptjs';
const { v4: uuidv4 } = require('uuid');

export async function seed() {
  console.log('Starting clear and seed process...');
  // everything happens in one transaction so we can rollback on failure
  await pool.query('START TRANSACTION');
  try {
    // some legacy tables may reference each other; temporarily disable FKs
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    // drop old schema if it exists - this ensures we don't hit unknown column errors
    await pool.query('DROP TABLE IF EXISTS expense_splits');
    await pool.query('DROP TABLE IF EXISTS expenses');
    await pool.query('DROP TABLE IF EXISTS group_members');
    await pool.query('DROP TABLE IF EXISTS `expense_groups`');
    await pool.query('DROP TABLE IF EXISTS `groups`');
    await pool.query('DROP TABLE IF EXISTS error_logs');
    await pool.query('DROP TABLE IF EXISTS users');

    // re-enable foreign-key enforcement
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // recreate tables from scratch
    await pool.query(`
      CREATE TABLE users (
        id VARCHAR(36) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE \`expense_groups\` (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        currency VARCHAR(10) DEFAULT 'INR',
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE group_members (
        group_id VARCHAR(36),
        user_id VARCHAR(36),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role ENUM('admin', 'member') DEFAULT 'member',
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES \`expense_groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE expenses (
        id VARCHAR(36) PRIMARY KEY,
        group_id VARCHAR(36) NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        paid_by VARCHAR(36) NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        receipt_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`expense_groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (paid_by) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE expense_splits (
        id VARCHAR(36) PRIMARY KEY,
        expense_id VARCHAR(36),
        user_id VARCHAR(36),
        amount DECIMAL(10, 2) NOT NULL,
        weight DECIMAL(5, 2) DEFAULT 1.00,
        UNIQUE KEY (expense_id, user_id),
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // error log table for recording runtime issues
    await pool.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id VARCHAR(36) PRIMARY KEY,
        occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        message TEXT,
        stack TEXT,
        user_id VARCHAR(36),
        path VARCHAR(255),
        method VARCHAR(10),
        body JSON,
        query_params JSON,
        route_params JSON
      )
    `);

    console.log('Schema created.');

    const passHash = await bcrypt.hash('password123', 10);
    const userId1 = uuidv4();
    const userId2 = uuidv4();
    const userId3 = uuidv4();

    await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, phone) VALUES 
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?)`,
      [
        userId1, 'Soumya Ghosh', 'soumya@clearsplit.app', passHash, '+919999999991',
        userId2, 'Rahul Dev', 'rahul@clearsplit.app', passHash, '+919999999992',
        userId3, 'Sneha Patel', 'sneha@clearsplit.app', passHash, '+919999999993'
      ]
    );

    const groupId1 = uuidv4();
    const groupId2 = uuidv4();

    await pool.query(
      `INSERT INTO \`expense_groups\` (id, name, description, created_by) VALUES
      (?, 'Goa Trip 🏖️', '✈️', ?),
      (?, 'Roommates 🏠', '🏠', ?)`,
      [groupId1, userId1, groupId2, userId1]
    );

    await pool.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES
      (?, ?, 'admin'), (?, ?, 'member'), (?, ?, 'member'),
      (?, ?, 'admin'), (?, ?, 'member')`,
      [
        groupId1, userId1, groupId1, userId2, groupId1, userId3,
        groupId2, userId1, groupId2, userId2
      ]
    );

    const expId1 = uuidv4();
    await pool.query(
      `INSERT INTO expenses (id, group_id, description, amount, paid_by, category) VALUES
      (?, ?, 'Dinner at Tito\\'s', 3000.00, ?, 'Food')`,
      [expId1, groupId1, userId1]
    );

    // insert splits with their own ids
    const split1 = uuidv4();
    const split2 = uuidv4();
    const split3 = uuidv4();
    await pool.query(
      `INSERT INTO expense_splits (id, expense_id, user_id, amount, weight) VALUES
      (?, ?, ?, 1000.00, 1), (?, ?, ?, 1000.00, 1), (?, ?, ?, 1000.00, 1)`,
      [split1, expId1, userId1, split2, expId1, userId2, split3, expId1, userId3]
    );

    // everything succeeded -- commit transaction
    await pool.query('COMMIT');
    console.log('Seed completed successfully!');
    // commit done, just return from the function
    return;
  } catch (error) {
    console.error('Seed fails:', error);
    try {
      await pool.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    // propagate error to caller instead of exiting
    throw error;
  }
}

// when run directly from command line
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
