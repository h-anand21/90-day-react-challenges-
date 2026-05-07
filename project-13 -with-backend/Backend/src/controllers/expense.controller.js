import Expense from '../models/Expense.js';

// ─── GET /api/trips/:tripId/expenses ─────────────────────────────────────────
export const getExpenses = async (req, res) => {
  try {
    const filter = { trip: req.params.tripId };
    if (req.query.category) filter.category = req.query.category;

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .populate('paidBy', 'name avatar')
      .populate('splitAmong.user', 'name avatar');

    // Summary stats
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    return res.status(200).json({ success: true, expenses, summary: { total, byCategory } });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/trips/:tripId/expenses ────────────────────────────────────────
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, currency, date, notes, splitAmong } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Title and amount are required' });
    }
    const expense = await Expense.create({
      trip: req.params.tripId,
      paidBy: req.user._id,
      title,
      amount: Number(amount),
      category: category || 'misc',
      currency: currency || 'USD',
      date: date || new Date(),
      notes: notes || '',
      splitAmong: splitAmong || [],
    });
    await expense.populate('paidBy', 'name avatar');
    return res.status(201).json({ success: true, expense });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/expenses/:expenseId ────────────────────────────────────────────
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.expenseId, req.body, { new: true })
      .populate('paidBy', 'name avatar');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    return res.status(200).json({ success: true, expense });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/expenses/:expenseId ─────────────────────────────────────────
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.expenseId);
    return res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
