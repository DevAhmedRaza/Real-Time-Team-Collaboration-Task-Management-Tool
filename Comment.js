const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
