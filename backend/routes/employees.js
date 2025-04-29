const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query('SELECT * FROM "Employee" ORDER BY id ASC');
        client.release();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees: ' + error.message });
    }
});

// Get single employee
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM "Employee" WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// Add new employee
router.post('/', async (req, res) => {
    try {
        const { userid, employeeid, department, position, hiredate, salary, status } = req.body;
        if (![userid, employeeid, department, position, hiredate, salary, status].every(Boolean)) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const { rows } = await pool.query(
            `INSERT INTO "Employee" (userid, employeeid, department, position, hiredate, salary, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userid, employeeid, department, position, hiredate, salary, status]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userid, employeeid, department, position, hiredate, salary, status } = req.body;
        if (![userid, employeeid, department, position, hiredate, salary, status].every(Boolean)) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const { rows } = await pool.query(
            `UPDATE "Employee" SET userid=$1, employeeid=$2, department=$3, position=$4, hiredate=$5, salary=$6, status=$7 
             WHERE id=$8 RETURNING *`,
            [userid, employeeid, department, position, hiredate, salary, status, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM "Employee" WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

module.exports = router; 