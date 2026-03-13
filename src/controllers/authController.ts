import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { v4: uuidv4 } = require('uuid');
import { RowDataPacket } from 'mysql2';
import { UserModel } from '../models/userModel';
import { PreferenceModel } from '../models/preferenceModel';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../utils/appError';
import { info } from '../utils/logger';
import { OtpService } from '../utils/otpService';

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

    // Create default preferences
    await PreferenceModel.createDefault(userId);

    // Generate and send OTP
    const otp = OtpService.generateOtp();
    const expiresAt = OtpService.getExpiryDate();
    await UserModel.updateOtp(userId, otp, expiresAt);
    await OtpService.sendOtp(email, otp);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    info('User registered:', userId);
    sendSuccess(res, 201, { 
      message: 'User registered. Please verify your email with the OTP sent.', 
      data: { token, user: { id: userId, email, full_name, is_verified: false } } 
    });
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
    sendSuccess(res, 200, { 
      data: { 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name,
          is_verified: user.is_verified 
        } 
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.is_verified) {
      throw new AppError('User is already verified', 400);
    }

    if (!user.otp_code || !user.otp_expires_at) {
      throw new AppError('OTP not found or expired', 400);
    }

    if (user.otp_code !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      throw new AppError('OTP has expired', 400);
    }

    await UserModel.verifyUser(userId);

    info('User verified:', userId);
    sendSuccess(res, 200, { message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.is_verified) {
      throw new AppError('User is already verified', 400);
    }

    const otp = OtpService.generateOtp();
    const expiresAt = OtpService.getExpiryDate();
    await UserModel.updateOtp(userId, otp, expiresAt);
    await OtpService.sendOtp(user.email, otp);

    info('OTP resent for user:', userId);
    sendSuccess(res, 200, { message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};
