const mongoose = require('mongoose');

const favoriteCitySchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    nickname: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FavoriteCity', favoriteCitySchema);
