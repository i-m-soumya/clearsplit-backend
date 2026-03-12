import pool from '../db';
import { RowDataPacket } from 'mysql2';

export interface GroupRecord extends RowDataPacket {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
}

export class GroupModel {
  static async create(id: string, name: string, description: string | null | undefined, created_by: string) {
    await pool.query(
      'INSERT INTO expense_groups (id, name, description, created_by) VALUES (?, ?, ?, ?)',
      [id, name, description || null, created_by]
    );
  }

  static async getByUser(userId: string): Promise<GroupRecord[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT eg.* FROM expense_groups eg
       JOIN group_members gm ON eg.id = gm.group_id
       WHERE gm.user_id = ?
       ORDER BY eg.created_at DESC`,
      [userId]
    );
    return rows as GroupRecord[];
  }

  static async findById(id: string): Promise<GroupRecord | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM expense_groups WHERE id = ?', [id]);
    return (rows as GroupRecord[])[0] || null;
  }
}
