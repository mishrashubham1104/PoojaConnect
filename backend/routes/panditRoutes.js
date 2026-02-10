const express = require('express');
const router = express.Router(); // 1. Initialized correctly at the top
const Pandit = require('../models/Pandit');
const Review = require('../models/Review');

// --- 1. GET REVIEWS FOR A SPECIFIC PANDIT ---
// URL: GET https://poojaconnect.onrender.com/api/pandits/reviews/:panditId
// Note: Placed above generic /:id to avoid route shadowing
router.get('/reviews/:panditId', async (req, res) => {
  try {
    const { panditId } = req.params;
    const reviews = await Review.find({ panditId }).sort({ createdAt: -1 });

    const averageRating = reviews.length > 0 
      ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
      : 5.0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length
    });
  } catch (err) {
    console.error("❌ Review Fetch Error:", err);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

// --- 2. GET ALL PANDITS ---
router.get('/', async (req, res) => {
  try {
    const pandits = await Pandit.find();
    res.json(pandits);
  } catch (err) {
    console.error("❌ Fetch All Error:", err);
    res.status(500).json({ error: "Failed to fetch pandits list" });
  }
});

// --- 3. GET MY SPECIFIC PROFILE (BY USER ID) ---
router.get('/my-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Pandit.findOne({ userId });
    if (!profile) return res.status(200).json(null);
    res.json(profile);
  } catch (err) {
    console.error("❌ Fetch My Profile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPandit = await Pandit.findByIdAndDelete(id);

    if (!deletedPandit) {
      return res.status(404).json({ error: "Pandit not found" });
    }

    res.json({ message: "Pandit deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Server error while deleting pandit" });
  }
});

// --- 4. GET SINGLE PANDIT BY DOCUMENT ID ---
router.get('/:id', async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) return res.status(404).json({ error: "Pandit not found" });
    res.json(pandit);
  } catch (err) {
    console.error("❌ Fetch Single Error:", err);
    res.status(500).json({ error: "Invalid ID format or Server error" });
  }
});

// --- 5. MANAGE PROFILE (CREATE OR UPDATE) ---
router.post('/profile', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const profile = await Pandit.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );
    res.json({ message: "Profile updated successfully!", profile });
  } catch (err) {
    console.error("❌ Profile Update Error:", err);
    res.status(500).json({ error: "Server error while saving profile" });
  }
});

module.exports = router; 