const express = require('express');
const router = express.Router();

let SearchHistory, FavoriteCity;
try {
  SearchHistory = require('../models/SearchHistory');
  FavoriteCity = require('../models/FavoriteCity');
} catch (e) {
  console.warn('Models not loaded (no MongoDB?)');
}

// POST /api/search/history  – save a search
router.post('/history', async (req, res) => {
  try {
    if (!SearchHistory) return res.json({ ok: true, mock: true });
    const { city, country, lat, lon } = req.body;
    const existing = await SearchHistory.findOne({ city: { $regex: new RegExp(`^${city}$`, 'i') } });
    if (existing) {
      existing.searchCount += 1;
      existing.lastSearched = new Date();
      await existing.save();
      return res.json(existing);
    }
    const doc = await SearchHistory.create({ city, country, lat, lon });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search/history  – get recent searches
router.get('/history', async (req, res) => {
  try {
    if (!SearchHistory) return res.json([]);
    const history = await SearchHistory.find().sort({ lastSearched: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/search/history/:id
router.delete('/history/:id', async (req, res) => {
  try {
    if (!SearchHistory) return res.json({ ok: true });
    await SearchHistory.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search/favorites
router.get('/favorites', async (req, res) => {
  try {
    if (!FavoriteCity) return res.json([]);
    const favs = await FavoriteCity.find().sort({ createdAt: -1 });
    res.json(favs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/search/favorites
router.post('/favorites', async (req, res) => {
  try {
    if (!FavoriteCity) return res.json({ ok: true, mock: true });
    const { city, country, lat, lon, nickname } = req.body;
    const doc = await FavoriteCity.create({ city, country, lat, lon, nickname });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/search/favorites/:id
router.delete('/favorites/:id', async (req, res) => {
  try {
    if (!FavoriteCity) return res.json({ ok: true });
    await FavoriteCity.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
