const express = require('express');
const router = express.Router();
const Pandit = require('../models/Pandit');
const Review = require('../models/Review');
// Import protectAdmin from your server or middleware file
// If it's defined in server.js, you might need to export it or move it to a middleware folder
// const { protectAdmin } = require('../middleware/auth'); 

// --- 1. GET ALL PANDITS (Public) ---
router.get('/', async (req, res) => {
  try {
    const pandits = await Pandit.find();
    res.json(pandits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pandits" });
  }
});

// --- 2. ADMIN: ADD NEW PANDIT ---
// Added 'protectAdmin' so random people can't add data
router.post('/add', async (req, res) => {
  try {
    const newPandit = new Pandit(req.body);
    await newPandit.save();
    res.status(201).json({ message: "Pandit added successfully!", newPandit });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Missing required fields" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// --- 3. MANAGE PROFILE (Pandit Logic) ---
router.post('/profile', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const profile = await Pandit.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );
    res.json({ message: "Profile updated!", profile });
  } catch (err) {
    res.status(500).json({ error: "Profile save failed" });
  }
});

// --- 4. REVIEWS ---
router.get('/reviews/:panditId', async (req, res) => {
  try {
    const reviews = await Review.find({ panditId: req.params.panditId }).sort({ createdAt: -1 });
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
      : 5.0;
    res.json({ reviews, averageRating: parseFloat(averageRating), totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ error: "Reviews failed" });
  }
});

// --- 5. DELETE PANDIT (Admin Only) ---
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Pandit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Pandit deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// --- 6. GET SINGLE PANDIT ---
router.get('/:id', async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) return res.status(404).json({ error: "Not found" });
    res.json(pandit);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID" });
  }
});

module.exports = router;