import TripMember from '../models/TripMember.js';

/**
 * Middleware factory: check that the requesting user is a member of the trip
 * and optionally has one of the allowed roles.
 *
 * Usage:
 *   router.delete('/:tripId', protect, requireTripRole(['owner']), deleteTrip)
 *   router.put('/:tripId', protect, requireTripRole(['owner', 'editor']), updateTrip)
 *   router.get('/:tripId', protect, requireTripRole(), getTrip) // any member
 */
export const requireTripRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const tripId = req.params.tripId || req.params.id;
      const userId = req.user._id;

      const membership = await TripMember.findOne({ trip: tripId, user: userId });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this trip',
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
        });
      }

      req.tripMembership = membership;
      next();
    } catch (error) {
      console.error('[requireTripRole]', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};
