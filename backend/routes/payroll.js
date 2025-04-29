const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get all payroll records
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                p.*,
                e.employeeid as employee_code,
                e.position,
                e.department,
                e.salary as base_salary
            FROM "Payroll" p
            JOIN "Employee" e ON p.employeeid = e.id
            ORDER BY p.paymentdate DESC
        `);

        // Format the data
        const formattedRows = rows.map(row => ({
            id: row.id,
            employeeId: row.employee_code,
            department: row.department,
            position: row.position,
            baseSalary: parseFloat(row.base_salary),
            allowances: parseFloat(row.allowances),
            deductions: parseFloat(row.deductions),
            netSalary: parseFloat(row.netsalary),
            paymentDate: row.paymentdate,
            status: row.status
        }));

        res.json(formattedRows);
    } catch (error) {
        console.error('Error fetching payroll records:', error);
        res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
});

// Add new payment record
router.post('/', async (req, res) => {
    try {
        const { employeeId, baseSalary, allowances, deductions, paymentDate, status } = req.body;
        const netSalary = parseFloat(baseSalary) + parseFloat(allowances) - parseFloat(deductions);

        const { rows } = await pool.query(
            `INSERT INTO "Payroll" (employeeid, basesalary, allowances, deductions, netsalary, paymentdate, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [employeeId, baseSalary, allowances, deductions, netSalary, paymentDate, status]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error adding payment record:', error);
        res.status(500).json({ error: 'Failed to add payment record' });
    }
});

// Generate payroll for all active employees
router.post('/generate', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get all active employees
        const { rows: employees } = await client.query(
            'SELECT * FROM "Employee" WHERE status = $1',
            ['Active']
        );

        const payrollRecords = [];
        const currentDate = new Date().toISOString().split('T')[0];

        // Create payroll records for each employee
        for (const employee of employees) {
            // Calculate default allowances (10% of base salary)
            const allowances = parseFloat(employee.salary) * 0.10;
            // Calculate default deductions (15% of base salary for tax)
            const deductions = parseFloat(employee.salary) * 0.15;
            // Calculate net salary
            const netSalary = parseFloat(employee.salary) + allowances - deductions;

            const { rows } = await client.query(
                `INSERT INTO "Payroll" (employeeid, basesalary, allowances, deductions, netsalary, paymentdate, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [
                    employee.id,
                    employee.salary,
                    allowances,
                    deductions,
                    netSalary,
                    currentDate,
                    'Pending'
                ]
            );
            payrollRecords.push(rows[0]);
        }

        await client.query('COMMIT');
        res.status(201).json(payrollRecords);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error generating payroll:', error);
        res.status(500).json({ error: 'Failed to generate payroll' });
    } finally {
        client.release();
    }
});

// Update payment record
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { baseSalary, allowances, deductions, paymentDate, status } = req.body;
        const netSalary = parseFloat(baseSalary) + parseFloat(allowances) - parseFloat(deductions);

        const { rows } = await pool.query(
            `UPDATE "Payroll"
             SET basesalary=$1, allowances=$2, deductions=$3, netsalary=$4, paymentdate=$5, status=$6
             WHERE id=$7
             RETURNING *`,
            [baseSalary, allowances, deductions, netSalary, paymentDate, status, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating payment record:', error);
        res.status(500).json({ error: 'Failed to update payment record' });
    }
});

// Delete payment record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            'DELETE FROM "Payroll" WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        res.json({ message: 'Payment record deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment record:', error);
        res.status(500).json({ error: 'Failed to delete payment record' });
    }
});

module.exports = router; 