import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidators';
import { handleValidation } from '../utils/validate';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.post('/register', registerValidator, handleValidation, catchAsync(register));
router.post('/login', loginValidator, handleValidation, catchAsync(login));

export default router;
