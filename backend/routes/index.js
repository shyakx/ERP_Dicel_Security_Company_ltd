const express = require('express');
const usersRouter = require('./users');
const rolesRouter = require('./roles');

const router = express.Router(); // Initialize the router

// Mount the routes
router.use('/users', usersRouter); // Routes for user management
router.use('/roles', rolesRouter); // Routes for role management

// Handle undefined routes under /api
router.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

module.exports = router;