const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  // GeoJSON point
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  description: { type: String }
}, {
  timestamps: true
});

LocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Location', LocationSchema);
