const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator'); // Add validation
const pool = require('../db'); // Database connection
require('dotenv').config();

const router = express.Router();

// Request password reset
router.post(
  '/password-reset',
  [body('email').isEmail().withMessage('Invalid email address')], // Validate email
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Check if the user exists
      const result = await pool.query('SELECT * FROM public."User" WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result.rows[0];

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

      // Save the hashed token and expiry to the database
      await pool.query(
        'UPDATE public."User" SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
        [hashedToken, tokenExpiry, email]
      );

      // Send the reset token via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASS, // Your email password
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/password-reset/${resetToken}`;
      const message = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (err) {
      console.error('Error requesting password reset:', err.message);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
);

// Reset password
router.post(
  '/password-reset/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')], // Validate password
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    try {
      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find the user with the matching reset token and ensure the token is not expired
      const result = await pool.query(
        'SELECT * FROM public."User" WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [hashedToken]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const user = result.rows[0];

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password and clear the reset token
      await pool.query(
        'UPDATE public."User" SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
        [hashedPassword, user.id]
      );

      res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
      console.error('Error resetting password:', err.message);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
);

module.exports = router;