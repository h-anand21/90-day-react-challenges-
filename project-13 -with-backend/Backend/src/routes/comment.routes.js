import { Router } from 'express';
import { getComments, createComment, updateComment, deleteComment } from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireTripRole } from '../middleware/tripRole.middleware.js';

const router = Router({ mergeParams: true });
router.use(protect);

router.get('/trips/:tripId/comments', requireTripRole(), getComments);
router.post('/trips/:tripId/comments', requireTripRole(), createComment);
router.put('/comments/:commentId', updateComment);
router.delete('/comments/:commentId', deleteComment);

export default router;
