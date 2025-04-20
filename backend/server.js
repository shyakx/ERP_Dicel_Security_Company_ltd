const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db'); // Import the database connection
const apiRoutes = require('./routes'); // Import centralized routes
const protectedRoutes = require('./routes/protectedRoutes'); // Import protected routes
const errorHandler = require('./middleWare/errorHandler.js'); // Error handler middleware
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Log environment variables for debugging
console.log('Database Config:', {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
    release(); // Release the client back to the pool
  }
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Mount protected routes under /api/protected
app.use('/api/protected', protectedRoutes);

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