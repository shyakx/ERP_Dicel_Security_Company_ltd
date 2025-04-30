const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/db');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection and setup tables before starting server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('Failed to connect to the database. Please check your PostgreSQL server.');
            process.exit(1);
        }

        // Enable UUID extension
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // Create Payroll table
        await pool.query(`
            DROP TABLE IF EXISTS "Payroll" CASCADE;
            CREATE TABLE IF NOT EXISTS "Payroll" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                employeeid UUID REFERENCES "Employee"(id) ON DELETE CASCADE,
                basesalary DECIMAL(10,2) NOT NULL,
                allowances DECIMAL(10,2) DEFAULT 0,
                deductions DECIMAL(10,2) DEFAULT 0,
                netsalary DECIMAL(10,2) NOT NULL,
                paymentdate DATE NOT NULL,
                status VARCHAR(20) CHECK (status IN ('Pending', 'Paid', 'Failed')) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database tables created successfully');

        // Routes
        app.use('/api/admin', require('./routes/admin'));
        app.use('/api/employees', require('./routes/employees'));
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/admin/payroll', require('./routes/payroll'));
        app.use('/api/admin/reports', require('./routes/reports'));

        const PORT = 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();