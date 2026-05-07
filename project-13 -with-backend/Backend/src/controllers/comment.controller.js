import Comment from '../models/Comment.js';

// ─── GET /api/trips/:tripId/comments ─────────────────────────────────────────
export const getComments = async (req, res) => {
  try {
    const filter = { trip: req.params.tripId, parentComment: null };
    if (req.query.activityId) filter.activity = req.query.activityId;
    if (req.query.dayId) filter.day = req.query.dayId;

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar');

    // Attach replies for each comment
    const withReplies = await Promise.all(comments.map(async (c) => {
      const replies = await Comment.find({ parentComment: c._id })
        .sort({ createdAt: 1 })
        .populate('author', 'name avatar');
      return { ...c.toJSON(), replies };
    }));

    return res.status(200).json({ success: true, comments: withReplies });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/trips/:tripId/comments ────────────────────────────────────────
export const createComment = async (req, res) => {
  try {
    const { content, dayId, activityId, parentCommentId } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    const comment = await Comment.create({
      trip: req.params.tripId,
      author: req.user._id,
      content: content.trim(),
      day: dayId || null,
      activity: activityId || null,
      parentComment: parentCommentId || null,
    });
    await comment.populate('author', 'name avatar');
    return res.status(201).json({ success: true, comment });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/comments/:commentId ────────────────────────────────────────────
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your comment' });
    }
    comment.content = req.body.content?.trim() || comment.content;
    comment.isEdited = true;
    await comment.save();
    return res.status(200).json({ success: true, comment });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/comments/:commentId ─────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your comment' });
    }
    await comment.deleteOne();
    // Also delete replies
    await Comment.deleteMany({ parentComment: comment._id });
    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
