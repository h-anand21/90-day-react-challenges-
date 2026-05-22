import Notification from '../models/Notification.js';

// ─── GET /api/notifications ────────────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('trip', 'title destination coverImage startDate endDate')
      .sort({ createdAt: -1 })
      .limit(50);
      
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('[getNotifications]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/notifications/read ───────────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({ success: true, message: 'Marked all as read' });
  } catch (error) {
    console.error('[markAsRead]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
