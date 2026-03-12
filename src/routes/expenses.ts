import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { handleValidation } from '../utils/validate';
import { addExpenseValidator, groupIdParamValidator } from '../validators/expenseValidators';
import { addExpense, getGroupExpenses } from '../controllers/expenseController';

const router = Router();

router.post('/', authenticateToken, addExpenseValidator, handleValidation, catchAsync(addExpense));
router.get('/group/:groupId', authenticateToken, groupIdParamValidator, handleValidation, catchAsync(getGroupExpenses));

export default router;
