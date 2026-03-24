const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Routes
const locationsRouter = require('./routes/locations');
app.use('/api/locations', locationsRouter);

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/location_project';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    // process.exit(1);
  });
