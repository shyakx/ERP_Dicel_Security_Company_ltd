const bcrypt = require('bcryptjs');

(async () => {
  const hashedPassword = await bcrypt.hash('password123', 10); // Replace 'password123' with your desired password
  console.log('Hashed Password:', hashedPassword);
})();