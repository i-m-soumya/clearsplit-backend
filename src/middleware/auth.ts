import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { UserModel } from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Authentication token required', 401));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid or expired token', 403));
    }
    req.user = decoded as { userId: string };
    next();
  });
};

export const isVerified = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await UserModel.findById(req.user.userId);
  if (!user || !user.is_verified) {
    return next(new AppError('Please verify your email to access this resource', 403));
  }

  next();
});
