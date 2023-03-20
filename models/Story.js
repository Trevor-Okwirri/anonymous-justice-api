// // Comment Model
const mongoose = require('mongoose');
const Comment = require('../models/Comment');

// const commentSchema = new mongoose.Schema({
//   text: {
//     type: String,
//     required: true
//   },
//   author: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// }, { timestamps: true });

// const Comment = mongoose.model('Comment', commentSchema);

// module.exports = Comment;


const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }]
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
