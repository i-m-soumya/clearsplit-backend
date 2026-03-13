import { Router } from 'express';
import { authenticateToken, isVerified } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { getPreferences, updatePreferences } from '../controllers/preferenceController';

const router = Router();

// Only verified users can manage preferences
router.get('/', authenticateToken, isVerified, catchAsync(getPreferences));
router.patch('/', authenticateToken, isVerified, catchAsync(updatePreferences));

export default router;
