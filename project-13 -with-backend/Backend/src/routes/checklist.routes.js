import { Router } from 'express';
import { getChecklists, createChecklist, deleteChecklist, addItem, toggleItem, deleteItem } from '../controllers/checklist.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';

const router = Router();
router.use(protect);

router.get('/trips/:tripId/checklists', requireTripRole(), getChecklists);
router.post('/trips/:tripId/checklists', requireTripRole(['owner', 'editor']), createChecklist);
router.delete('/checklists/:checklistId', deleteChecklist);

router.post('/checklists/:checklistId/items', addItem);
router.patch('/checklist-items/:itemId/toggle', toggleItem);
router.delete('/checklist-items/:itemId', deleteItem);

export default router;
