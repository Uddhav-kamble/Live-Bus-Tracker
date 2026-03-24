const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Create location
router.post('/', async (req, res) => {
  try {
    const { name, address, lat, lng, description } = req.body;
    const loc = new Location({
      name,
      address,
      description,
      location: { type: 'Point', coordinates: [lng, lat] }
    });
    await loc.save();
    res.status(201).json(loc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locs = await Location.find().sort({ createdAt: -1 });
    res.json(locs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get location by id
router.get('/:id', async (req, res) => {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) return res.status(404).json({ error: 'Not found' });
    res.json(loc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update location
router.put('/:id', async (req, res) => {
  try {
    const { name, address, lat, lng, description } = req.body;
    const loc = await Location.findById(req.params.id);
    if (!loc) return res.status(404).json({ error: 'Not found' });
    loc.name = name ?? loc.name;
    loc.address = address ?? loc.address;
    loc.description = description ?? loc.description;
    if (lat != null && lng != null) loc.location.coordinates = [lng, lat];
    await loc.save();
    res.json(loc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search by proximity ?lat=&lng=&radiusMeters=
router.get('/search/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusMeters = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    const locs = await Location.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radiusMeters, 10)
        }
      }
    });
    res.json(locs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
