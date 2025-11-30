const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

// POST /api/tasks - create a task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, team, assignees, status, priority, dueDate } = req.body;
    const task = new Task({ title, description, team, assignees, status, priority, dueDate, createdBy: req.user._id });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks/team/:teamId - get tasks for a team
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ team: req.params.teamId }).populate('assignees', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id - update task
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('assignees', 'name email');
    if (!updated) return res.status(404).json({ message: 'Task not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks/:id/comments - add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { body } = req.body;
    const comment = new Comment({ body, user: req.user._id, task: req.params.id });
    await comment.save();
    const task = await Task.findById(req.params.id);
    task.comments.push(comment._id);
    await task.save();
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
