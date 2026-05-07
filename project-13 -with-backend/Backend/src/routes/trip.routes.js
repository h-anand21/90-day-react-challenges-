import { Router } from 'express';
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripMembers,
  updateMemberRole,
  removeMember,
  addMemberByEmail,
} from '../controllers/trip.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';

const router = Router();

// All trip routes require authentication
router.use(protect);

// Trip CRUD
router.post('/', createTrip);
router.get('/', getMyTrips);
router.get('/:tripId', requireTripRole(), getTripById);
router.put('/:tripId', requireTripRole(['owner', 'editor']), updateTrip);
router.delete('/:tripId', requireTripRole(['owner']), deleteTrip);

// Member management (owner only for role changes / removal)
router.get('/:tripId/members', requireTripRole(), getTripMembers);
router.patch('/:tripId/members/:userId/role', requireTripRole(['owner']), updateMemberRole);
router.delete('/:tripId/members/:userId', requireTripRole(['owner']), removeMember);
router.post('/:tripId/members', requireTripRole(['owner']), addMemberByEmail);

export default router;
