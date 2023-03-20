// Import required modules
const express = require('express');
const router = express.Router();
const Fact = require('../models/Fact');
const { verifyToken,} = require("./verifyToken");
  const { ObjectId } = require('mongodb');
// Get all facts
router.get('/', async (req, res) => {
  try {
    if(req.query.page){
      req.query.page = 1
    }
    const facts = await Fact.find().limit(req.query.offset).skip(req.query.page - 1);
    res.json(facts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single fact
router.get('/:id', getFact, (req, res) => {
  res.json(res.fact);
});

// Create a new fact
router.post('/', verifyToken,async (req, res) => {
  const fact = new Fact({
    fact: req.body.fact,
    author: ObjectId(req.user.id)
  });

  try {
    const newFact = await fact.save();
    res.status(201).json(newFact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a fact
router.patch('/:id', verifyToken,getFact, async (req, res) => {
  if (req.body.title != null) {
    res.fact.title = req.body.title;
  }

  if (req.body.content != null) {
    res.fact.content = req.body.content;
  }

  try {
    const updatedFact = await res.fact.save();
    res.json(updatedFact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a fact
router.delete('/:id', verifyToken,getFact, async (req, res) => {
  try {
    await res.fact.remove();
    res.json({ message: 'Fact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a single fact by ID
async function getFact(req, res, next) {
  let fact;
  try {
    fact = await Fact.findById(req.params.id);
    if (fact == null) {
      return res.status(404).json({ message: 'Cannot find fact' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.fact = fact;
  next();
}

module.exports = router;
