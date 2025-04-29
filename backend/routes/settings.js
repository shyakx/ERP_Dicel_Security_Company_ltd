const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'company-logo-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get company information
router.get('/company', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM company_settings WHERE id = 1'
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update company information
router.put('/company', authenticateToken, upload.single('logo'), async (req, res) => {
    const { company_name, registration_number, email, phone, address } = req.body;
    const logo_path = req.file ? req.file.path : null;

    try {
        const result = await pool.query(
            `INSERT INTO company_settings (company_name, registration_number, email, phone, address, logo_path)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE
             SET company_name = $1, registration_number = $2, email = $3, phone = $4, address = $5,
                 logo_path = COALESCE($6, company_settings.logo_path)
             RETURNING *`,
            [company_name, registration_number, email, phone, address, logo_path]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get system preferences
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM system_preferences WHERE id = 1'
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update system preferences
router.put('/preferences', authenticateToken, async (req, res) => {
    const { default_currency, date_format, time_zone, enable_notifications } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO system_preferences (default_currency, date_format, time_zone, enable_notifications)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE
             SET default_currency = $1, date_format = $2, time_zone = $3, enable_notifications = $4
             RETURNING *`,
            [default_currency, date_format, time_zone, enable_notifications]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get email settings
router.get('/email', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT smtp_server, smtp_port, smtp_security, smtp_username, from_email FROM email_settings WHERE id = 1'
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update email settings
router.put('/email', authenticateToken, async (req, res) => {
    const { smtp_server, smtp_port, smtp_security, smtp_username, smtp_password, from_email } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO email_settings (smtp_server, smtp_port, smtp_security, smtp_username, smtp_password, from_email)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE
             SET smtp_server = $1, smtp_port = $2, smtp_security = $3, smtp_username = $4,
                 smtp_password = COALESCE($5, email_settings.smtp_password), from_email = $6
             RETURNING smtp_server, smtp_port, smtp_security, smtp_username, from_email`,
            [smtp_server, smtp_port, smtp_security, smtp_username, smtp_password, from_email]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Test email settings
router.post('/email/test', authenticateToken, async (req, res) => {
    try {
        // TODO: Implement email testing functionality
        // This would typically involve sending a test email using the configured settings
        res.json({ message: 'Test email sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

// Get users
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, username, email, role, status FROM users'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new user
router.post('/users', authenticateToken, async (req, res) => {
    const { username, email, role, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, email, role, password, status)
             VALUES ($1, $2, $3, $4, 'Active')
             RETURNING user_id, username, email, role, status`,
            [username, email, role, hashedPassword]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user
router.put('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { username, email, role, status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users
             SET username = $1, email = $2, role = $3, status = $4
             WHERE user_id = $5
             RETURNING user_id, username, email, role, status`,
            [username, email, role, status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create backup
router.post('/backup', authenticateToken, async (req, res) => {
    try {
        // TODO: Implement backup functionality
        // This would typically involve creating a dump of the database
        res.json({ message: 'Backup created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Restore from backup
router.post('/restore', authenticateToken, async (req, res) => {
    try {
        // TODO: Implement restore functionality
        // This would typically involve restoring the database from a backup file
        res.json({ message: 'System restored successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to restore system' });
    }
});

module.exports = router; 