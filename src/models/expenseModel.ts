import pool from '../db';
import { RowDataPacket } from 'mysql2';

export interface ExpenseRecord extends RowDataPacket {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  category?: string;
}

export interface ExpenseSplitInput {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  weight: number;
}

export class ExpenseModel {
  static async create(expenseId: string, group_id: string, description: string, amount: number, paid_by: string) {
    await pool.query(
      'INSERT INTO expenses (id, group_id, description, amount, paid_by) VALUES (?, ?, ?, ?, ?)',
      [expenseId, group_id, description, amount, paid_by]
    );
  }

  static async addSplit(splitId: string, expenseId: string, user_id: string, amount: number, weight: number) {
    await pool.query(
      'INSERT INTO expense_splits (id, expense_id, user_id, amount, weight) VALUES (?, ?, ?, ?, ?)',
      [splitId, expenseId, user_id, amount, weight]
    );
  }

  static async addSplits(splits: ExpenseSplitInput[]) {
    if (splits.length === 0) return;
    // bulk insert using value placeholders
    const values = splits.map(s => [s.id, s.expense_id, s.user_id, s.amount, s.weight]);
    await pool.query(
      'INSERT INTO expense_splits (id, expense_id, user_id, amount, weight) VALUES ?',
      [values]
    );
  }

  static async getByGroup(groupId: string): Promise<ExpenseRecord[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT e.*, u.full_name as paid_by_name FROM expenses e JOIN users u ON e.paid_by = u.id WHERE group_id = ? ORDER BY e.created_at DESC',
      [groupId]
    );
    return rows as ExpenseRecord[];
  }

  static async getSplits(expenseId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT s.*, u.full_name FROM expense_splits s JOIN users u ON s.user_id = u.id WHERE expense_id = ?',
      [expenseId]
    );
    return rows as any[];
  }
}
