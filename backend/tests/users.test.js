const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const pool = require('../db');

describe('Users API', () => {
  let token;

  beforeAll(() => {
    // Generate a valid JWT token for testing
    token = jwt.sign({ id: 1, role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await pool.query('DELETE FROM public."User" WHERE email = $1', ['newuser@example.com']);
  });

  afterAll(async () => {
    await pool.end(); // Close the database connection after tests
  });

  it('should create a new user', async () => {
    const mockUser = {
      email: 'newuser@example.com',
      password: 'password123',
      firstname: 'New',
      lastname: 'User',
      phonenumber: '1234567890',
      position: 'Developer',
      department: 'IT',
      datejoined: '2025-04-19',
      dateofbirth: '1990-01-01',
      role: 'User',
    };

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`) // Pass the token
      .send(mockUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(mockUser.email);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`) // Pass the token
      .send({
        email: 'shyakasteven2023@gmail.com', // Missing other required fields
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });
});