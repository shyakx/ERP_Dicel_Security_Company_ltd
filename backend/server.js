const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { Client } = require('pg');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Serve static files from the "frontend" directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Example route to serve the UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Database connection
const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), // Convert port to a number
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log('Connecting to database with the following details:');
console.log({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client
  .connect()
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit the application if the database connection fails
  });

// Example API route
app.get('/api/test', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW()');
    res.json({ success: true, serverTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Use process.env.PORT for the server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});