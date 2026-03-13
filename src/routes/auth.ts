import { Router } from 'express';
import { register, login, verifyEmail, resendOtp } from '../controllers/authController';
import { catchAsync } from '../utils/catchAsync';
import { handleValidation } from '../utils/validate';
import { registerValidator, loginValidator } from '../validators/authValidators';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidator, handleValidation, catchAsync(register));
router.post('/login', loginValidator, handleValidation, catchAsync(login));
router.post('/verify-email', authenticateToken, catchAsync(verifyEmail));
router.post('/resend-otp', authenticateToken, catchAsync(resendOtp));

export default router;
