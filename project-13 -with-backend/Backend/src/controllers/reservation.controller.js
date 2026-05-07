import Reservation from '../models/Reservation.js';

// ─── GET /api/trips/:tripId/reservations ─────────────────────────────────────
export const getReservations = async (req, res) => {
  try {
    const filter = { trip: req.params.tripId };
    if (req.query.type) filter.type = req.query.type;

    const reservations = await Reservation.find(filter)
      .sort({ checkIn: 1 })
      .populate('createdBy', 'name avatar');

    return res.status(200).json({ success: true, reservations });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/trips/:tripId/reservations ────────────────────────────────────
export const createReservation = async (req, res) => {
  try {
    const { type, title, vendor, confirmationCode, checkIn, checkOut, cost, currency, status, notes } = req.body;
    if (!type || !title) {
      return res.status(400).json({ success: false, message: 'Type and title are required' });
    }
    const reservation = await Reservation.create({
      trip: req.params.tripId,
      createdBy: req.user._id,
      type, title, vendor, confirmationCode, checkIn, checkOut,
      cost: cost || 0, currency: currency || 'USD', status: status || 'pending', notes,
    });
    await reservation.populate('createdBy', 'name avatar');
    return res.status(201).json({ success: true, reservation });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/reservations/:reservationId ────────────────────────────────────
export const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.reservationId, req.body, { new: true })
      .populate('createdBy', 'name avatar');
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    return res.status(200).json({ success: true, reservation });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/reservations/:reservationId ─────────────────────────────────
export const deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.reservationId);
    return res.status(200).json({ success: true, message: 'Reservation deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
