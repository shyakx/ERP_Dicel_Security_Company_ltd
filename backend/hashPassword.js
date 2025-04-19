const bcrypt = require('bcrypt');
const pool = require('./db'); // Adjust the path to your db.js file

const email = 'stevenbugonzi@example.com'; // Email of the user to update
const plainPassword = 'password123'; // Plain text password to hash

(async () => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Update the password in the database
    const result = await pool.query(
      'UPDATE public."User" SET password = $1 WHERE email = $2 RETURNING *',
      [hashedPassword, email]
    );

    console.log('Password updated successfully:', result.rows[0]);
  } catch (err) {
    console.error('Error updating password:', err.message);
  } finally {
    process.exit();
  }
})();