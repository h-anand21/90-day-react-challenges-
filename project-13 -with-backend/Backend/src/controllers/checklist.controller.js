import { Checklist, ChecklistItem } from '../models/Checklist.js';

// ─── GET /api/trips/:tripId/checklists ────────────────────────────────────────
export const getChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find({ trip: req.params.tripId })
      .populate('createdBy', 'name avatar');

    const withItems = await Promise.all(checklists.map(async (cl) => {
      const items = await ChecklistItem.find({ checklist: cl._id })
        .sort({ order: 1 })
        .populate('completedBy', 'name');
      return { ...cl.toJSON(), items };
    }));

    return res.status(200).json({ success: true, checklists: withItems });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/trips/:tripId/checklists ──────────────────────────────────────
export const createChecklist = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title required' });
    const checklist = await Checklist.create({
      trip: req.params.tripId,
      title: title.trim(),
      category: category || 'todo',
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, checklist: { ...checklist.toJSON(), items: [] } });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/checklists/:checklistId ─────────────────────────────────────
export const deleteChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndDelete(req.params.checklistId);
    await ChecklistItem.deleteMany({ checklist: req.params.checklistId });
    return res.status(200).json({ success: true, message: 'Checklist deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/checklists/:checklistId/items ─────────────────────────────────
export const addItem = async (req, res) => {
  try {
    const { label } = req.body;
    if (!label?.trim()) return res.status(400).json({ success: false, message: 'Label required' });
    const count = await ChecklistItem.countDocuments({ checklist: req.params.checklistId });
    const item = await ChecklistItem.create({
      checklist: req.params.checklistId,
      label: label.trim(),
      order: count,
    });
    return res.status(201).json({ success: true, item });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PATCH /api/checklist-items/:itemId/toggle ───────────────────────────────
export const toggleItem = async (req, res) => {
  try {
    const item = await ChecklistItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isCompleted = !item.isCompleted;
    item.completedBy = item.isCompleted ? req.user._id : null;
    item.completedAt = item.isCompleted ? new Date() : null;
    await item.save();
    return res.status(200).json({ success: true, item });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/checklist-items/:itemId ─────────────────────────────────────
export const deleteItem = async (req, res) => {
  try {
    await ChecklistItem.findByIdAndDelete(req.params.itemId);
    return res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
