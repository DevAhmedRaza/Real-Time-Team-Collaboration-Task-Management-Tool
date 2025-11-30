const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');

// POST /api/teams - create new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = new Team({ name, description, owner: req.user._id, members: [req.user._id] });
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams - list teams user is a member of
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id }).populate('members', 'name email');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('members', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/:id/add - add member by id
router.post('/:id/add', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const { memberId } = req.body;
    if (!team.members.includes(memberId)) {
      team.members.push(memberId);
      await team.save();
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
