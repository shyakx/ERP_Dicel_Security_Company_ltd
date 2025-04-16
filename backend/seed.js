const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dicel_erp',
  password: process.env.DB_PASSWORD || '0123',
  port: Number(process.env.DB_PORT) || 5434,
});

// Dummy data insertion
const seedDatabase = async () => {
  try {
    // Cleanup existing data
    await pool.query(`DELETE FROM public."ProjectAssignment";`);
    await pool.query(`DELETE FROM public."Project";`);
    await pool.query(`DELETE FROM public."Payroll";`);
    await pool.query(`DELETE FROM public."Leave";`);
    await pool.query(`DELETE FROM public."Incident";`);
    await pool.query(`DELETE FROM public."EquipmentAssignment";`);
    await pool.query(`DELETE FROM public."Equipment";`);
    await pool.query(`DELETE FROM public."Employee";`);
    await pool.query(`DELETE FROM public."User";`);

    console.log('Existing data removed successfully.');

    // Insert data into User table
    await pool.query(`
      INSERT INTO public."User" (id, email, password, firstName, lastName, phoneNumber, position, department, dateOfBirth, dateJoined, role, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), 'john.doe@example.com', 'hashed_password_1', 'John', 'Doe', '1234567890', 'Manager', 'HR', '1985-01-01', '2023-01-01', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'jane.smith@example.com', 'hashed_password_2', 'Jane', 'Smith', '0987654321', 'Security Guard', 'Operations', '1990-05-15', '2023-02-01', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'alice.brown@example.com', 'hashed_password_3', 'Alice', 'Brown', '1122334455', 'Analyst', 'Finance', '1988-03-10', '2023-03-01', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'new.user@example.com', 'hashed_password_4', 'New', 'User', '4455667788', 'Developer', 'IT', '1995-07-20', '2023-04-01', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into Employee table
    await pool.query(`
      INSERT INTO public."Employee" (id, userId, employeeId, department, position, hireDate, salary, status, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), (SELECT id FROM public."User" LIMIT 1), 'E001', 'HR', 'Manager', '2023-01-01', 5000.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."User" OFFSET 1 LIMIT 1), 'E002', 'Operations', 'Security Guard', '2023-02-15', 3000.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."User" OFFSET 2 LIMIT 1), 'E003', 'Finance', 'Analyst', '2023-03-10', 4000.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into Equipment table
    await pool.query(`
      INSERT INTO public."Equipment" (id, name, type, status, purchaseDate, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), 'CCTV Camera', 'Security', 'Active', '2022-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Walkie Talkie', 'Communication', 'Active', '2022-02-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Metal Detector', 'Security', 'Active', '2022-03-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into EquipmentAssignment table
    await pool.query(`
      INSERT INTO public."EquipmentAssignment" (id, equipmentId, employeeId, assignedDate, returnDate, status, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), (SELECT id FROM public."Equipment" LIMIT 1), (SELECT id FROM public."Employee" LIMIT 1), '2023-03-01', NULL, 'Assigned', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Equipment" OFFSET 1 LIMIT 1), (SELECT id FROM public."Employee" OFFSET 1 LIMIT 1), '2023-03-01', NULL, 'Assigned', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Equipment" OFFSET 2 LIMIT 1), (SELECT id FROM public."Employee" OFFSET 2 LIMIT 1), '2023-03-01', NULL, 'Assigned', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into Incident table
    await pool.query(`
      INSERT INTO public."Incident" (id, employeeId, description, date, status, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), (SELECT id FROM public."Employee" LIMIT 1), 'Unauthorized access detected', '2023-04-01', 'Resolved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Employee" OFFSET 1 LIMIT 1), 'Equipment malfunction', '2023-04-02', 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Employee" OFFSET 2 LIMIT 1), 'Suspicious activity reported', '2023-04-03', 'Investigating', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into Leave table
    await pool.query(`
      INSERT INTO public."Leave" (id, employeeId, startDate, endDate, reason, status, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), (SELECT id FROM public."Employee" LIMIT 1), '2023-04-10', '2023-04-15', 'Vacation', 'Approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Employee" OFFSET 1 LIMIT 1), '2023-04-20', '2023-04-25', 'Medical', 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Employee" OFFSET 2 LIMIT 1), '2023-05-01', '2023-05-05', 'Family Emergency', 'Approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into Payroll table
    await pool.query(`
      INSERT INTO public."Payroll" (id, employeeId, salary, bonus, deductions, netPay, paymentDate, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), (SELECT id FROM public."Employee" LIMIT 1), 5000.00, 500.00, 200.00, 5300.00, '2023-04-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Employee" OFFSET 1 LIMIT 1), 3000.00, 300.00, 100.00, 3200.00, '2023-04-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Employee" OFFSET 2 LIMIT 1), 4000.00, 400.00, 150.00, 4250.00, '2023-04-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into Project table
    await pool.query(`
      INSERT INTO public."Project" (id, name, description, startDate, endDate, status, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), 'Mall Security', 'Provide security for the new mall', '2023-01-01', '2023-12-31', 'Ongoing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Event Security', 'Security for the annual event', '2023-03-01', '2023-03-10', 'Completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Office Security', 'Provide security for the corporate office', '2023-02-01', '2023-06-30', 'Ongoing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // Insert data into ProjectAssignment table
    await pool.query(`
      INSERT INTO public."ProjectAssignment" (id, projectId, employeeId, assignedDate, role, createdAt, updatedAt)
      VALUES
      (gen_random_uuid(), (SELECT id FROM public."Project" LIMIT 1), (SELECT id FROM public."Employee" LIMIT 1), '2023-01-01', 'Team Lead', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Project" OFFSET 1 LIMIT 1), (SELECT id FROM public."Employee" OFFSET 1 LIMIT 1), '2023-03-01', 'Security Guard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid(), (SELECT id FROM public."Project" OFFSET 2 LIMIT 1), (SELECT id FROM public."Employee" OFFSET 2 LIMIT 1), '2023-02-01', 'Analyst', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    console.log('Dummy data inserted successfully!');
  } catch (err) {
    console.error('Error inserting dummy data:', err.message);
  } finally {
    await pool.end();
  }
};

seedDatabase();