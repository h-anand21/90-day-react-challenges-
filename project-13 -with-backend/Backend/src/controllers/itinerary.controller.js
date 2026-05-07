import TripDay from '../models/TripDay.js';
import Activity from '../models/Activity.js';

// ─── GET /api/trips/:tripId/days ─────────────────────────────────────────────
export const getDays = async (req, res) => {
  try {
    const days = await TripDay.find({ trip: req.params.tripId }).sort({ dayNumber: 1 });
    return res.status(200).json({ success: true, days });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/days/:dayId/activities ─────────────────────────────────────────
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ day: req.params.dayId })
      .sort({ order: 1 })
      .populate('createdBy', 'name avatar');
    return res.status(200).json({ success: true, activities });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/days/:dayId/activities ────────────────────────────────────────
export const createActivity = async (req, res) => {
  try {
    const day = await TripDay.findById(req.params.dayId);
    if (!day) return res.status(404).json({ success: false, message: 'Day not found' });

    const count = await Activity.countDocuments({ day: day._id });
    const activity = await Activity.create({
      ...req.body,
      day: day._id,
      trip: day.trip,
      createdBy: req.user._id,
      order: count,
    });
    return res.status(201).json({ success: true, activity });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/activities/:activityId ─────────────────────────────────────────
export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.activityId, req.body, { new: true });
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    return res.status(200).json({ success: true, activity });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/activities/:activityId ──────────────────────────────────────
export const deleteActivity = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.activityId);
    return res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PATCH /api/days/:dayId/activities/reorder ────────────────────────────────
export const reorderActivities = async (req, res) => {
  try {
    // orderedIds: [id1, id2, id3, ...]
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }
    await Promise.all(orderedIds.map((id, index) =>
      Activity.findByIdAndUpdate(id, { order: index })
    ));
    return res.status(200).json({ success: true, message: 'Reordered' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
