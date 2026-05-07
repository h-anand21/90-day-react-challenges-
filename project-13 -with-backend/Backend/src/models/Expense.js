import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 3,
    },
    category: {
      type: String,
      enum: [
        'transport',
        'accommodation',
        'food',
        'entertainment',
        'shopping',
        'health',
        'visa',
        'misc',
      ],
      default: 'misc',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Split among members — who owes what
    splitAmong: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        share: {
          type: Number,
          required: true,
          min: 0,
        },
        settled: {
          type: Boolean,
          default: false,
        },
      },
    ],
    relatedActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
    },
    relatedReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
  },
  { timestamps: true },
);

expenseSchema.index({ trip: 1, date: -1 });
expenseSchema.index({ trip: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
