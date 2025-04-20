const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.error('Authorization header missing');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    console.error('Token missing in Authorization header');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to authorize roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('User information missing in request');
      return res.status(401).json({ message: 'Access denied. No user information available.' });
    }

    if (!roles.includes(req.user.role)) {
      console.error(`User role "${req.user.role}" not authorized for this action`);
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };