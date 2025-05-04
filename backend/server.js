const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For token generation

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Mock user data (replace this with a database query in production)
const users = [
    {
        email: 'admin@example.com',
        password: bcrypt.hashSync('password123', 10), // Hashed password
        role: 'admin',
    },
];

// Login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = users.find((u) => u.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});