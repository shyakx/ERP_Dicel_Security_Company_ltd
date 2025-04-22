const express = require('express');
const cors = require('cors'); // Import the CORS package
const dotenv = require('dotenv'); // Import dotenv for environment variables
const app = express();

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
const adminRoutes = require('./routes/admin'); // Import admin routes
app.use('/api/admin', adminRoutes);

// Start the server
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});