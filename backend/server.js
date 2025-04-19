const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db'); // Import the database connection
const apiRoutes = require('./routes'); // Import centralized routes
const errorHandler = require('./middleWare/errorHandler.js'); // Error handler middleware
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

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; // Export the app for testing