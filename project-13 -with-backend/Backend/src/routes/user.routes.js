import express from 'express';
import { updateProfileSetup } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/profile-setup', protect, updateProfileSetup);

export default router;
