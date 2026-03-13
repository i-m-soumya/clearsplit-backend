import pool from '../db';
import { RowDataPacket } from 'mysql2';

export interface UserRecord extends RowDataPacket {
  id: string;
  email: string;
  full_name: string;
  password_hash?: string;
  is_verified: boolean;
  otp_code?: string;
  otp_expires_at?: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    return (rows as UserRecord[])[0] || null;
  }

  static async findById(id: string): Promise<UserRecord | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as UserRecord[])[0] || null;
  }

  static async create(id: string, email: string, hashedPassword: string, full_name: string) {
    await pool.query(
      'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
      [id, email, hashedPassword, full_name]
    );
  }

  static async updateOtp(id: string, otp: string, expiresAt: Date) {
    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
      [otp, expiresAt, id]
    );
  }

  static async verifyUser(id: string) {
    await pool.query(
      'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
      [id]
    );
  }
}
