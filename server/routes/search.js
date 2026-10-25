const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

let SearchHistory, FavoriteCity;
try {
  SearchHistory = require('../models/SearchHistory');
  FavoriteCity = require('../models/FavoriteCity');
} catch (e) {
  console.warn('Models not loaded (no MongoDB?)');
}

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/search/history  – save a search
router.post('/history', async (req, res) => {
  try {
    if (!SearchHistory || !isDbConnected()) return res.json({ ok: true, mock: true });
    const { city, country, lat, lon } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required' });
    const trimmedCity = city.trim();
    const existing = await SearchHistory.findOne({
      city: { $regex: new RegExp(`^${escapeRegex(trimmedCity)}$`, 'i') }
    });
    if (existing) {
      existing.searchCount += 1;
      existing.lastSearched = new Date();
      if (country) existing.country = country;
      if (lat != null) existing.lat = lat;
      if (lon != null) existing.lon = lon;
      await existing.save();
      return res.json(existing);
    }
    const doc = await SearchHistory.create({ city: trimmedCity, country, lat, lon });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error saving history:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search/history  – get recent searches
router.get('/history', async (req, res) => {
  try {
    if (!SearchHistory || !isDbConnected()) return res.json([]);
    const history = await SearchHistory.find().sort({ lastSearched: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/search/history/:id
router.delete('/history/:id', async (req, res) => {
  try {
    if (!SearchHistory || !isDbConnected()) return res.json({ ok: true });
    await SearchHistory.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting history:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search/favorites
router.get('/favorites', async (req, res) => {
  try {
    if (!FavoriteCity || !isDbConnected()) return res.json([]);
    const favs = await FavoriteCity.find().sort({ createdAt: -1 });
    res.json(favs);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/search/favorites
router.post('/favorites', async (req, res) => {
  try {
    if (!FavoriteCity || !isDbConnected()) return res.json({ ok: true, mock: true });
    const { city, country, lat, lon, nickname } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required' });
    const trimmedCity = city.trim();
    const existing = await FavoriteCity.findOne({
      city: { $regex: new RegExp(`^${escapeRegex(trimmedCity)}$`, 'i') }
    });
    if (existing) {
      return res.json(existing);
    }
    const doc = await FavoriteCity.create({ city: trimmedCity, country, lat, lon, nickname });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error saving favorite:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/search/favorites/:id
router.delete('/favorites/:id', async (req, res) => {
  try {
    if (!FavoriteCity || !isDbConnected()) return res.json({ ok: true });
    await FavoriteCity.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting favorite:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
