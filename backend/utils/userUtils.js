const bcrypt = require('bcrypt');

// Hash a password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare a plain password with a hashed password
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, comparePassword };