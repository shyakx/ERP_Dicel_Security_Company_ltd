const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// Define the route to fetch all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public."User" ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server Error');
  }
});

// Fetch a single user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public."User" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    phonenumber,
    position,
    department,
    datejoined,
    dateofbirth,
  } = req.body; // Include all required fields

  try {
    const result = await pool.query(
      'INSERT INTO public."User" (email, password, firstName, lastName, role, phonenumber, position, department, datejoined, dateofbirth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [email, password, firstName, lastName, role, phonenumber, position, department, datejoined, dateofbirth]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).send('Server Error');
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    phonenumber,
    position,
    department,
    datejoined,
    dateofbirth,
  } = req.body; // Include all required fields

  try {
    const result = await pool.query(
      'UPDATE public."User" SET email = $1, password = $2, firstName = $3, lastName = $4, role = $5, phonenumber = $6, position = $7, department = $8, datejoined = $9, dateofbirth = $10 WHERE id = $11 RETURNING *',
      [email, password, firstName, lastName, role, phonenumber, position, department, datejoined, dateofbirth, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
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