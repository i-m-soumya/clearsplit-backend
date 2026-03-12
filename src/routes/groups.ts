import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
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

router.post('/', authenticateToken, createGroupValidator, handleValidation, catchAsync(createGroup));
router.get('/', authenticateToken, catchAsync(getUserGroups));
router.post('/:groupId/join', authenticateToken, groupIdParamValidator, handleValidation, catchAsync(joinGroup));
router.get('/:groupId', authenticateToken, groupIdParamValidator, handleValidation, catchAsync(getGroupDetails));

export default router;
