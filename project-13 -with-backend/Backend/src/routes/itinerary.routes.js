import { Router } from 'express';
import {
  getDays,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
} from '../controllers/itinerary.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';

const router = Router();
router.use(protect);

// Days
router.get('/trips/:tripId/days', requireTripRole(), getDays);

// Activities under a day
router.get('/days/:dayId/activities', getActivities);
router.post('/days/:dayId/activities', createActivity);
router.patch('/days/:dayId/activities/reorder', reorderActivities);

// Single activity operations
router.put('/activities/:activityId', updateActivity);
router.delete('/activities/:activityId', deleteActivity);

export default router;
