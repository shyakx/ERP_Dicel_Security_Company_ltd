router.post('/password-reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    console.log('Received token:', token); // Debugging log

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Hashed token:', hashedToken); // Debugging log

    // Find the user with the matching reset token and ensure the token is not expired
    const result = await pool.query(
      'SELECT * FROM public."User" WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [hashedToken]
    );

    console.log('Database query result:', result.rows); // Debugging log

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
    res.status(500).send('Server Error');
  }
});