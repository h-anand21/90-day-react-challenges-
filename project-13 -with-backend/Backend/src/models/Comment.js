import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    // Comment can be on a day or an activity (at least one required)
    day: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TripDay',
      default: null,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: 2000,
    },
    // Threaded replies — parent comment ref
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

commentSchema.index({ trip: 1, createdAt: -1 });
commentSchema.index({ activity: 1 });
commentSchema.index({ day: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
