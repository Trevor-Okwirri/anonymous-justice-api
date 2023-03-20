const mongoose = require('mongoose');

const factSchema = new mongoose.Schema({
  fact: { type: String, required: true , unique: true},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Fact', factSchema);
