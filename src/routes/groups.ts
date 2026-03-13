import { Router } from 'express';
import { authenticateToken, isVerified } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { handleValidation } from '../utils/validate';
import { createGroupValidator, groupIdParamValidator } from '../validators/groupValidators';
import {
  createGroup,
  getUserGroups,
  joinGroup,
  getGroupDetails,
} from '../controllers/groupController';

const router = Router();

router.post('/', authenticateToken, isVerified, createGroupValidator, handleValidation, catchAsync(createGroup));
router.get('/', authenticateToken, isVerified, catchAsync(getUserGroups));
router.post('/:groupId/join', authenticateToken, isVerified, groupIdParamValidator, handleValidation, catchAsync(joinGroup));
router.get('/:groupId', authenticateToken, isVerified, groupIdParamValidator, handleValidation, catchAsync(getGroupDetails));

export default router;
