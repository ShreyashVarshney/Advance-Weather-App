const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    searchCount: { type: Number, default: 1 },
    lastSearched: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

searchHistorySchema.index({ city: 1 }, { unique: false });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
