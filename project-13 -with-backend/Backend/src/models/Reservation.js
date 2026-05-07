import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['flight', 'hotel', 'car', 'tour', 'restaurant', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    vendor: {
      type: String,
      trim: true,
      default: '',
    },
    confirmationCode: {
      type: String,
      trim: true,
      default: '',
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileAttachment',
      },
    ],
  },
  { timestamps: true },
);

reservationSchema.index({ trip: 1, type: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
