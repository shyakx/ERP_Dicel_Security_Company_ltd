const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db'); // Import the database connection
const routes = require('./routes'); // Import the main router
require('dotenv').config();


const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully:', res.rows[0]);
  }
});
// Use the routes
app.use('/api', routes); // All API routes will be prefixed with /api

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});