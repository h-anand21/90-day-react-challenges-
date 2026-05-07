import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema(
  {
    checklist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checklist',
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const checklistSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ['packing', 'todo', 'documents', 'shopping', 'other'],
      default: 'todo',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

checklistSchema.index({ trip: 1 });

export const Checklist = mongoose.model('Checklist', checklistSchema);
export const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema);
