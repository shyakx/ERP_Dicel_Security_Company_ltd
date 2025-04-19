jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true), // Mock successful email sending
  }),
}));

const request = require('supertest');
const app = require('../server');
const pool = require('../db');

describe('Password Reset API', () => {
  let resetToken;

  beforeAll(async () => {
    // Insert a test user into the database
    await pool.query(
      `INSERT INTO public."User" (email, password, firstname, lastname, phonenumber, position, role)
       VALUES ('shyakasteven2023@gmail.com', '$2b$10$hashedpassword', 'Steven', 'Shyaka', '1234567890', 'Developer', 'User')
       ON CONFLICT (email) DO NOTHING`
    );

    // Generate a reset token for the test user
    const token = 'test-reset-token';
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

    console.log('Generated token:', token); // Debugging log
    console.log('Hashed token:', hashedToken); // Debugging log

    await pool.query(
      `UPDATE public."User" SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3`,
      [hashedToken, tokenExpiry, 'shyakasteven2023@gmail.com']
    );

    resetToken = token; // Save the plain token for testing
  });

  afterAll(async () => {
    await pool.end(); // Close the database connection after tests
  });

  it('should reset the password with a valid token', async () => {
    console.log('Test reset token:', resetToken); // Debugging log

    const res = await request(app)
      .post(`/api/auth/password-reset/${resetToken}`) // Use the correct token
      .send({ password: 'newpassword123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Password reset successfully.');
  });
});