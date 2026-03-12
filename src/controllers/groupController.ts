import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
const { v4: uuidv4 } = require('uuid');
import pool from '../db';
import { RowDataPacket } from 'mysql2';
import { GroupModel } from '../models/groupModel';
import { UserModel } from '../models/userModel';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/appError';
import { info } from '../utils/logger';

export const createGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as import('../types/requests').CreateGroupRequest;
    const userId = (req as any).user?.userId;

    // confirm authenticated user exists
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('Authenticated user not found', 404);

    const groupId = uuidv4();
    await GroupModel.create(groupId, name, description, userId);
    // add creator as member
    await pool.query('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)', [groupId, userId, 'admin']);

    info('Group created:', groupId);
    sendSuccess(res, 201, { message: 'Group created', data: { id: groupId, name, description } });
  } catch (err) {
    next(err);
  }
};

export const getUserGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const groups = await GroupModel.getByUser(userId);
    sendSuccess(res, 200, { data: groups });
  } catch (err) {
    next(err);
  }
};

export const getGroupDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const group = await GroupModel.findById(groupId);
    if (!group) throw new AppError('Group not found', 404);

    // members query remains since it's not yet in model
    const [members] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.email, u.full_name 
       FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = ?`,
      [groupId]
    );
    sendSuccess(res, 200, { data: { ...group, members } });
  } catch (err) {
    next(err);
  }
};

export const joinGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).user?.userId;

    const group = await GroupModel.findById(groupId);
    if (!group) throw new AppError('Group not found', 404);

    const [members] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    if (members.length > 0) throw new AppError('Already a member', 400);

    await pool.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupId, userId]);
    sendSuccess(res, 200, { message: 'Joined group successfully' });
  } catch (err) {
    next(err);
  }
};
