const express = require('express');
const pool = require('../db'); // Database connection
const { hashPassword } = require('../utils/userUtils'); // Import utilities
const { authenticateToken, authorizeRoles } = require('../middleWare/authMiddleware.js'); // Middleware for route protection
require('dotenv').config();

const router = express.Router();

// Create a new user (Admin only)
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  const {
    email,
    password,
    firstname,
    lastname,
    role,
    phonenumber,
    position,
    department,
    datejoined,
    dateofbirth,
  } = req.body;

  // Validate required fields
  if (!email || !password || !firstname || !lastname || !phonenumber || !position || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO public."User" (email, password, firstname, lastname, role, phonenumber, position, department, datejoined, dateofbirth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [email, hashedPassword, firstname, lastname, role, phonenumber, position, department, datejoined, dateofbirth]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get all users (Admin and Manager only)
router.get('/', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public."User" ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public."User" WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;