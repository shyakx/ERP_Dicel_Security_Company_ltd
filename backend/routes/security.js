const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get Security statistics
router.get('/statistics', async (req, res) => {
    try {
        // Get total guards
        const { rows: totalRows } = await pool.query(
            'SELECT COUNT(*) FROM "SecurityGuard"'
        );

        // Get on duty guards
        const { rows: onDutyRows } = await pool.query(`
            SELECT COUNT(DISTINCT g.id)
            FROM "SecurityGuard" g
            JOIN "GuardShift" s ON g.id = s.guardid
            WHERE s.starttime <= CURRENT_TIMESTAMP
            AND s.endtime >= CURRENT_TIMESTAMP
        `);

        // Get pending incidents
        const { rows: incidentRows } = await pool.query(
            'SELECT COUNT(*) FROM "SecurityIncident" WHERE status = $1',
            ['Pending']
        );

        // Get today's shifts
        const { rows: shiftRows } = await pool.query(`
            SELECT COUNT(*) FROM "GuardShift"
            WHERE DATE(starttime) = CURRENT_DATE
        `);

        res.json({
            totalGuards: parseInt(totalRows[0].count),
            onDutyGuards: parseInt(onDutyRows[0].count),
            pendingIncidents: parseInt(incidentRows[0].count),
            todayShifts: parseInt(shiftRows[0].count)
        });
    } catch (error) {
        console.error('Error fetching security statistics:', error);
        res.status(500).json({ error: 'Failed to fetch security statistics' });
    }
});

// Get recent incidents
router.get('/recent-incidents', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                i.id,
                i.date,
                i.type,
                i.location,
                i.status,
                g.firstname || ' ' || g.lastname as "reportedBy"
            FROM "SecurityIncident" i
            JOIN "SecurityGuard" g ON i.reportedby = g.id
            ORDER BY i.date DESC
            LIMIT 5
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching recent incidents:', error);
        res.status(500).json({ error: 'Failed to fetch recent incidents' });
    }
});

// Get current shifts
router.get('/current-shifts', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                s.id,
                g.firstname || ' ' || g.lastname as "guardName",
                s.location,
                s.starttime as "startTime",
                s.endtime as "endTime"
            FROM "GuardShift" s
            JOIN "SecurityGuard" g ON s.guardid = g.id
            WHERE s.starttime <= CURRENT_TIMESTAMP
            AND s.endtime >= CURRENT_TIMESTAMP
            ORDER BY s.starttime
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching current shifts:', error);
        res.status(500).json({ error: 'Failed to fetch current shifts' });
    }
});

// Get all guards
router.get('/guards', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                g.id,
                g.guardid,
                g.firstname,
                g.lastname,
                g.email,
                g.phone,
                g.rank,
                g.status
            FROM "SecurityGuard" g
            ORDER BY g.guardid
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching guards:', error);
        res.status(500).json({ error: 'Failed to fetch guards' });
    }
});

// Add new guard
router.post('/guards', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            guardId,
            firstName,
            lastName,
            email,
            phone,
            rank
        } = req.body;

        await client.query('BEGIN');

        // Insert guard
        const { rows } = await client.query(
            `INSERT INTO "SecurityGuard" (
                guardid, firstname, lastname, email, phone,
                rank, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                guardId,
                firstName,
                lastName,
                email,
                phone,
                rank,
                'Active'
            ]
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding guard:', error);
        res.status(500).json({ error: 'Failed to add guard' });
    } finally {
        client.release();
    }
});

// Update guard
router.put('/guards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            guardId,
            firstName,
            lastName,
            email,
            phone,
            rank,
            status
        } = req.body;

        const { rows } = await pool.query(
            `UPDATE "SecurityGuard"
             SET guardid=$1, firstname=$2, lastname=$3, email=$4,
                 phone=$5, rank=$6, status=$7
             WHERE id=$8
             RETURNING *`,
            [
                guardId,
                firstName,
                lastName,
                email,
                phone,
                rank,
                status,
                id
            ]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Guard not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating guard:', error);
        res.status(500).json({ error: 'Failed to update guard' });
    }
});

// Delete guard
router.delete('/guards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            'DELETE FROM "SecurityGuard" WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Guard not found' });
        }

        res.json({ message: 'Guard deleted successfully' });
    } catch (error) {
        console.error('Error deleting guard:', error);
        res.status(500).json({ error: 'Failed to delete guard' });
    }
});

// Get all shifts
router.get('/shifts', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                s.id,
                g.firstname || ' ' || g.lastname as "guardName",
                s.location,
                s.starttime as "startTime",
                s.endtime as "endTime",
                s.status
            FROM "GuardShift" s
            JOIN "SecurityGuard" g ON s.guardid = g.id
            ORDER BY s.starttime DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching shifts:', error);
        res.status(500).json({ error: 'Failed to fetch shifts' });
    }
});

// Add new shift
router.post('/shifts', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            guardId,
            location,
            startTime,
            endTime
        } = req.body;

        await client.query('BEGIN');

        // Insert shift
        const { rows } = await client.query(
            `INSERT INTO "GuardShift" (
                guardid, location, starttime, endtime, status
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                guardId,
                location,
                startTime,
                endTime,
                'Scheduled'
            ]
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding shift:', error);
        res.status(500).json({ error: 'Failed to add shift' });
    } finally {
        client.release();
    }
});

// Update shift
router.put('/shifts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            guardId,
            location,
            startTime,
            endTime,
            status
        } = req.body;

        const { rows } = await pool.query(
            `UPDATE "GuardShift"
             SET guardid=$1, location=$2, starttime=$3,
                 endtime=$4, status=$5
             WHERE id=$6
             RETURNING *`,
            [
                guardId,
                location,
                startTime,
                endTime,
                status,
                id
            ]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating shift:', error);
        res.status(500).json({ error: 'Failed to update shift' });
    }
});

// Delete shift
router.delete('/shifts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            'DELETE FROM "GuardShift" WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        res.json({ message: 'Shift deleted successfully' });
    } catch (error) {
        console.error('Error deleting shift:', error);
        res.status(500).json({ error: 'Failed to delete shift' });
    }
});

// Get all incidents
router.get('/incidents', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                i.id,
                i.date,
                i.type,
                i.location,
                i.description,
                i.status,
                g.firstname || ' ' || g.lastname as "reportedBy"
            FROM "SecurityIncident" i
            JOIN "SecurityGuard" g ON i.reportedby = g.id
            ORDER BY i.date DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ error: 'Failed to fetch incidents' });
    }
});

// Add new incident
router.post('/incidents', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            type,
            location,
            description,
            reportedBy
        } = req.body;

        await client.query('BEGIN');

        // Insert incident
        const { rows } = await client.query(
            `INSERT INTO "SecurityIncident" (
                date, type, location, description, status, reportedby
            ) VALUES (CURRENT_TIMESTAMP, $1, $2, $3, $4, $5)
            RETURNING *`,
            [
                type,
                location,
                description,
                'Pending',
                reportedBy
            ]
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding incident:', error);
        res.status(500).json({ error: 'Failed to add incident' });
    } finally {
        client.release();
    }
});

// Update incident
router.put('/incidents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type,
            location,
            description,
            status
        } = req.body;

        const { rows } = await pool.query(
            `UPDATE "SecurityIncident"
             SET type=$1, location=$2, description=$3, status=$4
             WHERE id=$5
             RETURNING *`,
            [
                type,
                location,
                description,
                status,
                id
            ]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating incident:', error);
        res.status(500).json({ error: 'Failed to update incident' });
    }
});

// Delete incident
router.delete('/incidents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            'DELETE FROM "SecurityIncident" WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error('Error deleting incident:', error);
        res.status(500).json({ error: 'Failed to delete incident' });
    }
});

module.exports = router; 