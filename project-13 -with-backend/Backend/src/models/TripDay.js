import mongoose from 'mongoose';

const tripDaySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

tripDaySchema.index({ trip: 1, dayNumber: 1 }, { unique: true });

const TripDay = mongoose.model('TripDay', tripDaySchema);
export default TripDay;
