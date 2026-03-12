import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { v4: uuidv4 } = require('uuid');
import { RowDataPacket } from 'mysql2';
import { UserModel } from '../models/userModel';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../utils/appError';
import { info } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, full_name } = req.body as import('../types/requests').RegisterRequest;

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await UserModel.create(userId, email, hashedPassword, full_name);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    info('User registered:', userId);
    sendSuccess(res, 201, { message: 'User created', data: { token, user: { id: userId, email, full_name } } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as import('../types/requests').LoginRequest;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.password_hash) {
      throw new AppError('Please login with Google', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    info('User logged in:', user.id);
    sendSuccess(res, 200, { data: { token, user: { id: user.id, email: user.email, full_name: user.full_name } } });
  } catch (error) {
    next(error);
  }
};
