const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get HR statistics
router.get('/statistics', async (req, res) => {
    try {
        // Get total employees
        const { rows: totalRows } = await pool.query(
            'SELECT COUNT(*) FROM "Employee"'
        );

        // Get active employees
        const { rows: activeRows } = await pool.query(
            'SELECT COUNT(*) FROM "Employee" WHERE status = $1',
            ['Active']
        );

        // Get pending leave requests
        const { rows: leaveRows } = await pool.query(
            'SELECT COUNT(*) FROM "LeaveRequest" WHERE status = $1',
            ['Pending']
        );

        res.json({
            totalEmployees: parseInt(totalRows[0].count),
            activeEmployees: parseInt(activeRows[0].count),
            pendingLeaves: parseInt(leaveRows[0].count)
        });
    } catch (error) {
        console.error('Error fetching HR statistics:', error);
        res.status(500).json({ error: 'Failed to fetch HR statistics' });
    }
});

// Get recent employees
router.get('/recent-employees', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                e.employeeid as "employeeId",
                e.firstname || ' ' || e.lastname as name,
                e.department,
                e.joindate as "joinDate"
            FROM "Employee" e
            ORDER BY e.joindate DESC
            LIMIT 5
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching recent employees:', error);
        res.status(500).json({ error: 'Failed to fetch recent employees' });
    }
});

// Get recent leave requests
router.get('/recent-leaves', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                l.id,
                e.firstname || ' ' || e.lastname as "employeeName",
                l.type,
                l.startdate as "startDate",
                l.status
            FROM "LeaveRequest" l
            JOIN "Employee" e ON l.employeeid = e.id
            ORDER BY l.created_at DESC
            LIMIT 5
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching recent leave requests:', error);
        res.status(500).json({ error: 'Failed to fetch recent leave requests' });
    }
});

// Get today's attendance
router.get('/today-attendance', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Get total employees
        const { rows: totalRows } = await pool.query(
            'SELECT COUNT(*) FROM "Employee" WHERE status = $1',
            ['Active']
        );

        // Get present employees
        const { rows: presentRows } = await pool.query(
            'SELECT COUNT(DISTINCT employeeid) FROM "Attendance" WHERE date = $1',
            [today]
        );

        res.json({
            total: parseInt(totalRows[0].count),
            present: parseInt(presentRows[0].count)
        });
    } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s attendance' });
    }
});

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                e.id,
                e.employeeid,
                e.firstname,
                e.lastname,
                e.email,
                e.phone,
                e.department,
                e.position,
                e.salary,
                e.joindate,
                e.status
            FROM "Employee" e
            ORDER BY e.employeeid
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Add new employee
router.post('/employees', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            department,
            position,
            salary,
            joinDate
        } = req.body;

        await client.query('BEGIN');

        // Insert employee
        const { rows } = await client.query(
            `INSERT INTO "Employee" (
                employeeid, firstname, lastname, email, phone,
                department, position, salary, joindate, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                employeeId,
                firstName,
                lastName,
                email,
                phone,
                department,
                position,
                salary,
                joinDate,
                'Active'
            ]
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Failed to add employee' });
    } finally {
        client.release();
    }
});

// Update employee
router.put('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            department,
            position,
            salary,
            status
        } = req.body;

        const { rows } = await pool.query(
            `UPDATE "Employee"
             SET employeeid=$1, firstname=$2, lastname=$3, email=$4,
                 phone=$5, department=$6, position=$7, salary=$8, status=$9
             WHERE id=$10
             RETURNING *`,
            [
                employeeId,
                firstName,
                lastName,
                email,
                phone,
                department,
                position,
                salary,
                status,
                id
            ]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
router.delete('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            'DELETE FROM "Employee" WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

module.exports = router; 