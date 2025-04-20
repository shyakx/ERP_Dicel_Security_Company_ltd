const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleWare/authMiddleware');

const router = express.Router();

// Example protected route for Admin
router.get('/admin', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Welcome, Admin!' });
});

// Example protected route for Users
router.get('/user', authenticateToken, authorizeRoles('USER', 'ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Welcome, User!' });
});

module.exports = router;