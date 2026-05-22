import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect); // All routes require auth

router.get('/', getNotifications);
router.put('/read', markAsRead);

export default router;
