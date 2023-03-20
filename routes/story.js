const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const {
    verifyToken,
  } = require("./verifyToken");
const Story = require('../models/Story');
const Comment = require('../models/Comment');

// Get all stories
router.get('/', async (req, res) => {
  try {
    if(req.query.page){
      req.query.page = 1
    }
    const stories = await Story.find().limit(req.query.offset).skip(req.query.page - 1);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new story
router.post('/',verifyToken, async (req, res) => {
  const story = new Story({
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    videoUrl: req.body.videoUrl,
    thumbnailUrl: req.body.thumbnailUrl,
    author: ObjectId(req.user._id),
    content: req.body.content
  });

  try {
    const newStory = await story.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a story by ID
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    story.title = req.body.title || story.title;
    story.imageUrl = req.body.imageUrl || story.imageUrl;
    story.videoUrl = req.body.videoUrl || story.videoUrl;
    story.thumbnailUrl = req.body.thumbnailUrl || story.thumbnailUrl;
    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a story by ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await story.remove();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment to a story by ID
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    const comment = new Comment({
      text: req.body.text,
      author: ObjectId(req.user.id),
      referenceId: req.params.id
    });
    const newComment = await comment.save()
    story.comments = [newComment._id, ...story.comments]
    console.log(story)
    await story.save();
    res.status(201).json(story);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (story) {
      let comments = []
      for (let comment = 0; comment < story.comments.length; comment++) {
        const element = story.comments[comment];
        const commentFound = await Comment.findById(element)
        comments.push(commentFound)
      }
      res.status(200).send(comments)
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});
router.get('/comment/:commentId', verifyToken, async (req, res) => {
  try {
      const comment = await Comment.findById(req.params.commentId)
      res.status(200).send(comment)
    
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
