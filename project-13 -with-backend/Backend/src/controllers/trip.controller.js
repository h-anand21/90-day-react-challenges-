import Trip from '../models/Trip.js';
import User from '../models/User.js';
import TripMember from '../models/TripMember.js';
import TripDay from '../models/TripDay.js';
import { createTripSchema, updateTripSchema } from '../validations/trip.validation.js';
import { differenceInCalendarDays, addDays } from '../utils/dateHelpers.js';

// ─── POST /api/trips ───────────────────────────────────────────────────────
export const createTrip = async (req, res) => {
  try {
    const parsed = createTripSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const tripData = { ...parsed.data, owner: req.user._id };
    const trip = await Trip.create(tripData);

    // Auto-create owner membership
    await TripMember.create({ trip: trip._id, user: req.user._id, role: 'owner' });

    // Auto-generate TripDay documents for each day of the trip
    const totalDays =
      differenceInCalendarDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
    const dayDocs = Array.from({ length: totalDays }, (_, i) => ({
      trip: trip._id,
      date: addDays(new Date(trip.startDate), i),
      dayNumber: i + 1,
    }));
    await TripDay.insertMany(dayDocs);

    return res.status(201).json({ success: true, trip });
  } catch (error) {
    console.error('[createTrip]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/trips ────────────────────────────────────────────────────────
export const getMyTrips = async (req, res) => {
  try {
    const memberships = await TripMember.find({ user: req.user._id }).select('trip role');
    const tripIds = memberships.map((m) => m.trip);

    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = { _id: { $in: tripIds } };
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('owner', 'name email avatar'),
      Trip.countDocuments(filter),
    ]);

    // Attach role info
    const membershipMap = Object.fromEntries(memberships.map((m) => [m.trip.toString(), m.role]));
    const tripsWithRole = trips.map((t) => ({
      ...t.toJSON(),
      myRole: membershipMap[t._id.toString()],
    }));

    return res.status(200).json({
      success: true,
      trips: tripsWithRole,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('[getMyTrips]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/trips/:tripId ────────────────────────────────────────────────
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate('owner', 'name email avatar');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const members = await TripMember.find({ trip: trip._id }).populate('user', 'name email avatar');

    return res.status(200).json({
      success: true,
      trip,
      members,
      myRole: req.tripMembership.role,
    });
  } catch (error) {
    console.error('[getTripById]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/trips/:tripId ────────────────────────────────────────────────
export const updateTrip = async (req, res) => {
  try {
    const parsed = updateTripSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const trip = await Trip.findByIdAndUpdate(req.params.tripId, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    return res.status(200).json({ success: true, trip });
  } catch (error) {
    console.error('[updateTrip]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/trips/:tripId ─────────────────────────────────────────────
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Cascade delete members
    await TripMember.deleteMany({ trip: trip._id });
    await TripDay.deleteMany({ trip: trip._id });

    return res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('[deleteTrip]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/trips/:tripId/members ────────────────────────────────────────
export const getTripMembers = async (req, res) => {
  try {
    const members = await TripMember.find({ trip: req.params.tripId }).populate(
      'user',
      'name email avatar',
    );
    return res.status(200).json({ success: true, members });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PATCH /api/trips/:tripId/members/:userId/role ─────────────────────────
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Use editor or viewer.' });
    }

    const membership = await TripMember.findOneAndUpdate(
      { trip: req.params.tripId, user: req.params.userId },
      { role },
      { new: true },
    );
    if (!membership) return res.status(404).json({ success: false, message: 'Member not found' });

    return res.status(200).json({ success: true, membership });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/trips/:tripId/members/:userId ─────────────────────────────
export const removeMember = async (req, res) => {
  try {
    // Prevent owner from removing themselves
    const memberToRemove = await TripMember.findOne({
      trip: req.params.tripId,
      user: req.params.userId,
    });
    if (!memberToRemove) return res.status(404).json({ success: false, message: 'Member not found' });
    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Cannot remove the trip owner' });
    }

    await memberToRemove.deleteOne();
    return res.status(200).json({ success: true, message: 'Member removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/trips/:tripId/members ───────────────────────────────────────
export const addMemberByEmail = async (req, res) => {
  try {
    const { email, role = 'viewer' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Case-insensitive search: the User model has lowercase: true, so we search with lowercase
    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) return res.status(404).json({ success: false, message: 'User not found with this email' });

    // Check if already a member
    const existing = await TripMember.findOne({ trip: req.params.tripId, user: userToAdd._id });
    if (existing) return res.status(400).json({ success: false, message: 'User is already a member of this trip' });

    const membership = await TripMember.create({
      trip: req.params.tripId,
      user: userToAdd._id,
      role,
    });

    await membership.populate('user', 'name email avatar');

    return res.status(201).json({ success: true, membership });
  } catch (error) {
    console.error('[addMemberByEmail]', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
