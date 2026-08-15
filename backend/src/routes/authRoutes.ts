/**
 * Auth Routes
 */

import { Router } from 'express';
import { register, login, getMe, updateProfile, forgotPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateRegister, validateLogin } from '../validators/authValidator';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;

