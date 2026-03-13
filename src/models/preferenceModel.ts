import pool from '../db';
import { RowDataPacket } from 'mysql2';

export interface UserPreferenceRecord extends RowDataPacket {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  email_all: boolean;
  email_expense_added: boolean;
  email_settled: boolean;
  email_daily_summary: boolean;
  email_weekly_summary: boolean;
  push_notifications: boolean;
  whatsapp_notifications: boolean;
  sms_notifications: boolean;
}

export class PreferenceModel {
  static async findByUserId(userId: string): Promise<UserPreferenceRecord | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    return (rows as UserPreferenceRecord[])[0] || null;
  }

  static async upsert(userId: string, preferences: Partial<UserPreferenceRecord>) {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      const updates: string[] = [];
      const values: any[] = [];
      
      Object.entries(preferences).forEach(([key, value]) => {
        if (key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (updates.length > 0) {
        values.push(userId);
        await pool.query(
          `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    } else {
      const keys = ['user_id', ...Object.keys(preferences)];
      const placeholders = keys.map(() => '?').join(', ');
      const values = [userId, ...Object.values(preferences)];
      
      await pool.query(
        `INSERT INTO user_preferences (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
    }
  }

  static async createDefault(userId: string) {
    await pool.query(
      'INSERT INTO user_preferences (user_id) VALUES (?)',
      [userId]
    );
  }
}
