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

// Get single payroll record
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(`
            SELECT 
                p.*,
                e.employeeid as employee_code,
                e.position,
                e.department,
                e.salary as base_salary
            FROM "Payroll" p
            JOIN "Employee" e ON p.employeeid = e.id
            WHERE p.id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        // Format the data
        const payment = {
            id: rows[0].id,
            employeeId: rows[0].employee_code,
            department: rows[0].department,
            position: rows[0].position,
            baseSalary: parseFloat(rows[0].basesalary),
            allowances: parseFloat(rows[0].allowances),
            deductions: parseFloat(rows[0].deductions),
            netSalary: parseFloat(rows[0].netsalary),
            paymentDate: rows[0].paymentdate,
            status: rows[0].status
        };

        res.json(payment);
    } catch (error) {
        console.error('Error fetching payment record:', error);
        res.status(500).json({ error: 'Failed to fetch payment record' });
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

        const currentDate = new Date().toISOString().split('T')[0];
        // Extract the first day of the current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        // Extract the last day of the current month
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

        // Get all employees
        const { rows: employees } = await client.query(
            'SELECT id, employeeid, salary FROM "Employee"'
        );

        console.log(`Found ${employees.length} employees in the database`);

        if (employees.length === 0) {
            return res.status(404).json({ error: 'No employees found in the database' });
        }

        const payrollRecords = [];

        // Create payroll records for each employee
        for (const employee of employees) {
            try {
                // Check if payroll already exists for this employee in the current month
                const { rows: existingPayroll } = await client.query(
                    `SELECT id FROM "Payroll" 
                     WHERE employeeid = $1 
                     AND paymentdate >= $2 
                     AND paymentdate <= $3`,
                    [employee.id, startOfMonth, endOfMonth]
                );

                if (existingPayroll.length > 0) {
                    console.log(`Payroll already exists for employee ${employee.employeeid} in current month`);
                    continue;
                }

                console.log(`Processing employee: ${JSON.stringify(employee)}`);
                
                // Calculate default allowances (10% of base salary)
                const allowances = parseFloat(employee.salary) * 0.10;
                // Calculate default deductions (15% of base salary for tax)
                const deductions = parseFloat(employee.salary) * 0.15;
                // Calculate net salary
                const netSalary = parseFloat(employee.salary) + allowances - deductions;

                console.log(`Calculated values for employee ${employee.employeeid}:`);
                console.log(`- Base Salary: ${employee.salary}`);
                console.log(`- Allowances: ${allowances}`);
                console.log(`- Deductions: ${deductions}`);
                console.log(`- Net Salary: ${netSalary}`);

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
                console.log(`Successfully generated payroll for employee ${employee.employeeid}`);
            } catch (error) {
                console.error(`Error generating payroll for employee ${employee.employeeid}:`, error);
                console.error('Error details:', {
                    employeeId: employee.id,
                    employeeCode: employee.employeeid,
                    salary: employee.salary,
                    error: error.message,
                    stack: error.stack
                });
                // Continue with next employee even if one fails
                continue;
            }
        }

        if (payrollRecords.length === 0) {
            await client.query('ROLLBACK');
            return res.status(500).json({ 
                error: 'No new payroll records were generated. This could be because payroll records already exist for all employees this month.'
            });
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: `Successfully generated payroll for ${payrollRecords.length} employees`,
            records: payrollRecords
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error generating payroll:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to generate payroll: ' + error.message });
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