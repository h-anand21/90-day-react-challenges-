import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    day: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TripDay',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    startTime: {
      type: String, // HH:MM format
      default: '',
    },
    endTime: {
      type: String, // HH:MM format
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['transport', 'accommodation', 'food', 'activity', 'sightseeing', 'other'],
      default: 'activity',
    },
    status: {
      type: String,
      enum: ['planned', 'confirmed', 'completed', 'cancelled'],
      default: 'planned',
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0, // for drag-drop reorder
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

activitySchema.index({ day: 1, order: 1 });
activitySchema.index({ trip: 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
