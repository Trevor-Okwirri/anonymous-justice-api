// Socket Connection model
const mongoose = require('mongoose');

const socketConnectionSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  connected: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('SocketConnection', socketConnectionSchema);
