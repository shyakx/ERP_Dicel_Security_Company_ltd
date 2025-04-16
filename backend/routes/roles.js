const express = require('express');
const pool = require('../db'); // Import the database connection
const router = express.Router();

// Get all roles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public."Roles"');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Assign a role to a user
router.post('/assign', async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    await pool.query(
      'INSERT INTO public."UserRoles" (userId, roleId) VALUES ($1, $2)',
      [userId, roleId]
    );
    res.status(201).send('Role assigned successfully');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;