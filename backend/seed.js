const { Pool } = require('pg');
require('dotenv').config();
const { hashPassword } = require('./utils/userUtils'); // Import hashPassword utility

// Default seeded credentials:
// Admin:    admin@example.com / password123
// User:     user@example.com / password456
//
// Run this script with: node backend/seed.js
// It will clear existing users and add these credentials.

// Database connection
const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'dicel_erp',
  password: process.env.DATABASE_PASSWORD || '0123',
  port: Number(process.env.DATABASE_PORT) || 5434,
});

// Ensure User table has the required columns before seeding
const ensureUserTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public."User" (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      phonenumber VARCHAR(20),
      position VARCHAR(100),
      role VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Add missing columns if they do not exist
  const columns = [
    { name: 'email', type: 'VARCHAR(255) UNIQUE NOT NULL' },
    { name: 'username', type: 'VARCHAR(100) NOT NULL' },
    { name: 'password_hash', type: 'VARCHAR(255) NOT NULL' },
    { name: 'firstName', type: 'VARCHAR(100)' },
    { name: 'lastName', type: 'VARCHAR(100)' },
    { name: 'phonenumber', type: 'VARCHAR(20)' },
    { name: 'position', type: 'VARCHAR(100)' },
    { name: 'role', type: 'VARCHAR(50)' },
    { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
  ];
  for (const col of columns) {
    await pool.query(`ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
  }
};

// Seed database
const seedDatabase = async () => {
  try {
    await ensureUserTable();
    // Cleanup existing data
    await pool.query(`TRUNCATE public."ProjectAssignment", public."Project", public."Payroll", public."Leave", public."Incident", public."EquipmentAssignment", public."Equipment", public."Employee", public."User" RESTART IDENTITY CASCADE;`);
    console.log('Existing data removed successfully.');

    // Hash passwords using the utility function
    const hashedPassword1 = await hashPassword('password123');
    const hashedPassword2 = await hashPassword('password456');

    // Insert data into User table
    await pool.query(`
      INSERT INTO public."User" (email, username, password_hash, firstName, lastName, phonenumber, position, role, createdAt, updatedAt)
      VALUES
      ('admin@example.com', 'admin', $1, 'Admin', 'User', '1234567890', 'Administrator', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('user@example.com', 'user', $2, 'Regular', 'User', '0987654321', 'Employee', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
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