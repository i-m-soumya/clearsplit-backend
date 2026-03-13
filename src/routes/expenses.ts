import { Router } from 'express';
import { authenticateToken, isVerified } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { handleValidation } from '../utils/validate';
import { addExpenseValidator, groupIdParamValidator } from '../validators/expenseValidators';
import { addExpense, getGroupExpenses } from '../controllers/expenseController';

const router = Router();

router.post('/', authenticateToken, isVerified, addExpenseValidator, handleValidation, catchAsync(addExpense));
router.get('/group/:groupId', authenticateToken, isVerified, groupIdParamValidator, handleValidation, catchAsync(getGroupExpenses));

export default router;
