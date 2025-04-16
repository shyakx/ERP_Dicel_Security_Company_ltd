const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const routes = require('./routes'); // Import the main router
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Use the routes
app.use('/api', routes); // All API routes will be prefixed with /api

// Example route to test the server
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});