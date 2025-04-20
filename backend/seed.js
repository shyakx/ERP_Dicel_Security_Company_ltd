const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'dicel_erp',
  password: process.env.DATABASE_PASSWORD || '0123',
  port: Number(process.env.DATABASE_PORT) || 5434,
});

// Seed database
const seedDatabase = async () => {
  try {
    // Cleanup existing data
    await pool.query(`TRUNCATE public."ProjectAssignment", public."Project", public."Payroll", public."Leave", public."Incident", public."EquipmentAssignment", public."Equipment", public."Employee", public."User" RESTART IDENTITY CASCADE;`);
    console.log('Existing data removed successfully.');

    // Hash passwords
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);

    // Insert data into User table
    await pool.query(`
      INSERT INTO public."User" (email, password, firstName, lastName, phonenumber, position, role, createdAt, updatedAt)
      VALUES
      ('admin@example.com', $1, 'Admin', 'User', '1234567890', 'Administrator', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('user@example.com', $2, 'Regular', 'User', '0987654321', 'Employee', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `, [hashedPassword1, hashedPassword2]);

    console.log('Dummy data inserted successfully!');
  } catch (err) {
    console.error('Error inserting dummy data:', err.message);
  } finally {
    await pool.end();
  }
};

// Run the seed function
seedDatabase();