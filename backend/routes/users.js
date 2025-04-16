const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public."User"');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public."User" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, position, department, dateOfBirth, dateJoined, role } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public."User" (id, email, password, firstName, lastName, phoneNumber, position, department, dateOfBirth, dateJoined, role, createdAt, updatedAt)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [email, password, firstName, lastName, phoneNumber, position, department, dateOfBirth, dateJoined, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, firstName, lastName, phoneNumber, position, department, role } = req.body;
  try {
    const result = await pool.query(
      `UPDATE public."User"
       SET email = $1, firstName = $2, lastName = $3, phoneNumber = $4, position = $5, department = $6, role = $7, updatedAt = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [email, firstName, lastName, phoneNumber, position, department, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;