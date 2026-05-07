import mongoose from 'mongoose';

/**
 * TripMember — junction table between a Trip and a User.
 * Stores the role the user has in that trip.
 */
const tripMemberSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound index — unique membership per trip
tripMemberSchema.index({ trip: 1, user: 1 }, { unique: true });

const TripMember = mongoose.model('TripMember', tripMemberSchema);
export default TripMember;
