import { Response, NextFunction } from 'express';
import { PreferenceModel } from '../models/preferenceModel';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

export const getPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    let preferences = await PreferenceModel.findByUserId(userId);
    
    // If for some reason preferences don't exist, create defaults
    if (!preferences) {
      await PreferenceModel.createDefault(userId);
      preferences = await PreferenceModel.findByUserId(userId);
    }

    sendSuccess(res, 200, { data: preferences });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const updates = req.body;
    
    // Simple validation: don't allow updating user_id or dates
    delete updates.user_id;
    delete updates.created_at;
    delete updates.updated_at;

    await PreferenceModel.upsert(userId, updates);
    const updatedPreferences = await PreferenceModel.findByUserId(userId);

    sendSuccess(res, 200, { 
      message: 'Preferences updated successfully', 
      data: updatedPreferences 
    });
  } catch (error) {
    next(error);
  }
};
