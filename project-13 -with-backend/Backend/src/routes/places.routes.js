import { Router } from 'express';
import { searchPlaces } from '../controllers/places.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/places/search?q=Goa&countryCode=IN
// Protected — only logged-in users can search
router.get('/search', protect, searchPlaces);

export default router;
