import { Router } from 'express';
import { register, login, logout, getMe, firebaseAuth, updatePushToken } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/push-token', protect, updatePushToken);

export default router;
