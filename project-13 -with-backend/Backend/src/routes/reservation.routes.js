import { Router } from 'express';
import { getReservations, createReservation, updateReservation, deleteReservation } from '../controllers/reservation.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';

const router = Router();
router.use(protect);

router.get('/trips/:tripId/reservations', requireTripRole(), getReservations);
router.post('/trips/:tripId/reservations', requireTripRole(['owner', 'editor']), createReservation);
router.put('/reservations/:reservationId', updateReservation);
router.delete('/reservations/:reservationId', deleteReservation);

export default router;
