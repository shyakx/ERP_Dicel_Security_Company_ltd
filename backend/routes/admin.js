const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Import the pool correctly

// Dashboard route
router.get('/dashboard', async (req, res) => {
    try {
        // Fetch total employees
        const { rows: employeeRows } = await pool.query('SELECT COUNT(*) AS total FROM "Employee"');
        const totalEmployees = parseInt(employeeRows[0]?.total) || 0;

        // Fetch monthly revenue breakdown
        const { rows: revenueRows } = await pool.query(`
            SELECT EXTRACT(MONTH FROM date) AS month, SUM(amount) AS revenue
            FROM "revenues"
            WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY month
            ORDER BY month
        `);
        const monthlyRevenueBreakdown = Array(12).fill(0);
        revenueRows.forEach(row => {
            const monthIndex = parseInt(row.month, 10) - 1;
            monthlyRevenueBreakdown[monthIndex] = parseFloat(row.revenue);
        });

        // Fetch contracts by type
        const { rows: contractRows } = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM "Contract"
            GROUP BY status
        `);
        const contractsByType = {};
        contractRows.forEach(row => {
            contractsByType[row.status] = parseInt(row.count, 10);
        });

        // Fetch average task progress
        const { rows: taskRows } = await pool.query('SELECT AVG(progress) AS avg_progress FROM "Task"');
        const tasksProgress = Math.round(parseFloat(taskRows[0]?.avg_progress) || 0);

        // Fetch attendance summary
        const { rows: attendanceRows } = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM "Attendance"
            GROUP BY status
        `);
        const attendanceSummary = { present: 0, absent: 0 };
        attendanceRows.forEach(row => {
            const status = row.status?.toLowerCase();
            if (status && attendanceSummary.hasOwnProperty(status)) {
                attendanceSummary[status] = parseInt(row.count, 10);
            }
        });

        // Fetch equipment assignments summary
        const { rows: equipmentRows } = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM "EquipmentAssignment"
            GROUP BY status
        `);
        const equipmentAssignments = { assigned: 0, returned: 0 };
        equipmentRows.forEach(row => {
            const status = row.status?.toLowerCase();
            if (status && equipmentAssignments.hasOwnProperty(status)) {
                equipmentAssignments[status] = parseInt(row.count, 10);
            }
        });

        // Fetch leave requests summary
        const { rows: leaveRows } = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM "Leave"
            GROUP BY status
        `);
        const leaveRequests = { pending: 0, approved: 0 };
        leaveRows.forEach(row => {
            const status = row.status?.toLowerCase();
            if (status && leaveRequests.hasOwnProperty(status)) {
                leaveRequests[status] = parseInt(row.count, 10);
            }
        });

        // Send response
        res.json({
            totalEmployees,
            monthlyRevenueBreakdown,
            contractsByType,
            tasksProgress,
            attendanceSummary,
            equipmentAssignments,
            leaveRequests
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Add new employee
router.post('/employees', async (req, res) => {
    try {
        const { employeeid, department, position, hiredate, salary, status } = req.body;

        // Validate input
        if (![employeeid, department, position, hiredate, salary, status].every(Boolean)) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if employee ID already exists
        const existingEmployee = await pool.query(
            'SELECT employeeid FROM "Employee" WHERE employeeid = $1',
            [employeeid]
        );

        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({ 
                error: `Employee ID ${employeeid} already exists. Please use a different ID.`
            });
        }

        const { rows } = await pool.query(
            `INSERT INTO "Employee" (employeeid, department, position, hiredate, salary, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [employeeid, department, position, hiredate, salary, status]
        );

        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Failed to add employee: ' + error.message });
    }
});

// Fetch all employees
router.get('/employees', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM "Employee" ORDER BY id ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Fetch single employee
router.get('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM "Employee" WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee data' });
    }
});

// Update employee
router.put('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeid, department, position, hiredate, salary, status } = req.body;

        // Validate input
        if (![employeeid, department, position, hiredate, salary, status].every(Boolean)) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if the new employee ID exists for other employees
        const existingEmployee = await pool.query(
            'SELECT id FROM "Employee" WHERE employeeid = $1 AND id != $2',
            [employeeid, id]
        );

        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({ 
                error: `An employee with this Employee ID already exists`
            });
        }

        const { rows } = await pool.query(
            `UPDATE "Employee" 
             SET employeeid=$1, department=$2, position=$3, hiredate=$4, salary=$5, status=$6 
             WHERE id=$7 RETURNING *`,
            [employeeid, department, position, hiredate, salary, status, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee: ' + error.message });
    }
});

// Delete all employees
router.delete('/employees', async (req, res) => {
    try {
        // Delete related records in the correct order
        await pool.query('DELETE FROM "ProjectAssignment"');
        await pool.query('DELETE FROM "Payroll"');
        await pool.query('DELETE FROM "Attendance"');
        await pool.query('DELETE FROM "EquipmentAssignment"');
        await pool.query('DELETE FROM "Leave"');
        await pool.query('DELETE FROM "Task"');
        await pool.query('DELETE FROM "Incident"');
        
        // Now delete all employees
        await pool.query('DELETE FROM "Employee"');
        res.status(200).json({ message: "All employees and related records deleted successfully" });
    } catch (error) {
        console.error('Error deleting all employees:', error);
        res.status(500).json({ error: 'Failed to delete all employees: ' + error.message });
    }
});

// Delete single employee
router.delete('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete related records first
        await pool.query('DELETE FROM "ProjectAssignment" WHERE employeeid = $1', [id]);
        await pool.query('DELETE FROM "Payroll" WHERE employeeid = $1', [id]);
        await pool.query('DELETE FROM "Attendance" WHERE employeeid = $1', [id]);
        await pool.query('DELETE FROM "EquipmentAssignment" WHERE employeeid = $1', [id]);
        await pool.query('DELETE FROM "Leave" WHERE employeeid = $1', [id]);
        await pool.query('DELETE FROM "Task" WHERE employeeid = $1', [id]);
        await pool.query('DELETE FROM "Incident" WHERE employeeid = $1', [id]);
        
        // Now delete the employee
        const { rows } = await pool.query('DELETE FROM "Employee" WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.status(200).json({ message: "Employee and related records deleted successfully" });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee: ' + error.message });
    }
});

// Delete all attendance records
router.delete('/attendance', async (req, res) => {
    try {
        await pool.query('DELETE FROM "Attendance"');
        res.status(200).json({ message: "All attendance records deleted successfully" });
    } catch (error) {
        console.error('Error deleting attendance records:', error);
        res.status(500).json({ error: 'Failed to delete attendance records' });
    }
});

// Delete all equipment assignments
router.delete('/equipment-assignments', async (req, res) => {
    try {
        await pool.query('DELETE FROM "EquipmentAssignment"');
        res.status(200).json({ message: "All equipment assignments deleted successfully" });
    } catch (error) {
        console.error('Error deleting equipment assignments:', error);
        res.status(500).json({ error: 'Failed to delete equipment assignments' });
    }
});

// Delete all leave records
router.delete('/leave', async (req, res) => {
    try {
        await pool.query('DELETE FROM "Leave"');
        res.status(200).json({ message: "All leave records deleted successfully" });
    } catch (error) {
        console.error('Error deleting leave records:', error);
        res.status(500).json({ error: 'Failed to delete leave records' });
    }
});

// Delete all task records
router.delete('/tasks', async (req, res) => {
    try {
        await pool.query('DELETE FROM "Task"');
        res.status(200).json({ message: "All task records deleted successfully" });
    } catch (error) {
        console.error('Error deleting task records:', error);
        res.status(500).json({ error: 'Failed to delete task records' });
    }
});

// Delete all incident records
router.delete('/incidents', async (req, res) => {
    try {
        await pool.query('DELETE FROM "Incident"');
        res.status(200).json({ message: "All incident records deleted successfully" });
    } catch (error) {
        console.error('Error deleting incident records:', error);
        res.status(500).json({ error: 'Failed to delete incident records' });
    }
});

// Temporary route to set up Payroll table
router.post('/setup/payroll', async (req, res) => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS "Payroll" CASCADE;
            CREATE TABLE "Payroll" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                employeeid UUID REFERENCES "Employee"(id) ON DELETE CASCADE,
                base_salary DECIMAL(10,2) NOT NULL,
                allowances DECIMAL(10,2) DEFAULT 0,
                deductions DECIMAL(10,2) DEFAULT 0,
                net_salary DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL,
                status VARCHAR(20) CHECK (status IN ('Pending', 'Paid', 'Failed')) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.json({ message: 'Payroll table created successfully' });
    } catch (error) {
        console.error('Error creating Payroll table:', error);
        res.status(500).json({ error: 'Failed to create Payroll table' });
    }
});

module.exports = router;
