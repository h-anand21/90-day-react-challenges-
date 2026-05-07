import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';

const router = Router();
router.use(protect);

router.get('/trips/:tripId/expenses', requireTripRole(), getExpenses);
router.post('/trips/:tripId/expenses', requireTripRole(['owner', 'editor']), createExpense);
router.put('/expenses/:expenseId', updateExpense);
router.delete('/expenses/:expenseId', deleteExpense);

export default router;
