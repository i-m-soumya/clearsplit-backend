import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
const { v4: uuidv4 } = require('uuid');
import { RowDataPacket } from 'mysql2';
import pool from '../db';
import { ExpenseModel } from '../models/expenseModel';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/appError';
import { info } from '../utils/logger';

export const addExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  try {
    const { group_id, description, amount, paid_by, splits } = req.body as import('../types/requests').AddExpenseRequest;
    const expenseId = uuidv4();

    await connection.beginTransaction();
    await ExpenseModel.create(expenseId, group_id, description, amount, paid_by);

    // prepare batch splits
    const batch: import('../models/expenseModel').ExpenseSplitInput[] = [];
    for (const split of splits) {
      const splitId = uuidv4();
      batch.push({
        id: splitId,
        expense_id: expenseId,
        user_id: split.user_id,
        amount: split.amount,
        weight: split.weight || 1,
      });
    }
    await ExpenseModel.addSplits(batch);

    await connection.commit();
    info('Expense added:', expenseId);
    sendSuccess(res, 201, { message: 'Expense added successfully', data: { id: expenseId } });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

export const getGroupExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const expenses = await ExpenseModel.getByGroup(groupId);

    const result = await Promise.all(expenses.map(async (exp) => {
      const splits = await ExpenseModel.getSplits(exp.id);
      return { ...exp, splits };
    }));

    sendSuccess(res, 200, { data: result });
  } catch (err) {
    next(err);
  }
};
