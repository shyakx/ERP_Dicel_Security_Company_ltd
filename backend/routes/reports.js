const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

// Get Financial Overview Report
router.get('/financial-overview', async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate } = req.query;

        // Validate date parameters
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        // Get total revenue
        const { rows: revenueData } = await client.query(`
            SELECT 
                SUM(amount) as total_revenue,
                COUNT(*) as total_invoices
            FROM "Invoices"
            WHERE invoice_date BETWEEN $1 AND $2
        `, [startDate, endDate]);

        // Get total expenses
        const { rows: expenseData } = await client.query(`
            SELECT 
                SUM(amount) as total_expenses,
                COUNT(*) as total_expense_records
            FROM "Expenses"
            WHERE expense_date BETWEEN $1 AND $2
        `, [startDate, endDate]);

        // Get payroll expenses
        const { rows: payrollData } = await client.query(`
            SELECT 
                SUM(netsalary) as total_payroll,
                COUNT(*) as total_payments
            FROM "Payroll"
            WHERE paymentdate BETWEEN $1 AND $2
        `, [startDate, endDate]);

        // Get department-wise expenses
        const { rows: departmentExpenses } = await client.query(`
            SELECT 
                d.name as department,
                SUM(e.amount) as total_expenses
            FROM "Expenses" e
            JOIN "Departments" d ON e.department_id = d.id
            WHERE e.expense_date BETWEEN $1 AND $2
            GROUP BY d.name
        `, [startDate, endDate]);

        res.json({
            financialOverview: {
                totalRevenue: revenueData[0].total_revenue || 0,
                totalExpenses: expenseData[0].total_expenses || 0,
                totalPayroll: payrollData[0].total_payroll || 0,
                netProfit: (revenueData[0].total_revenue || 0) - 
                          (expenseData[0].total_expenses || 0) - 
                          (payrollData[0].total_payroll || 0)
            },
            departmentExpenses,
            summary: {
                totalInvoices: revenueData[0].total_invoices || 0,
                totalExpenseRecords: expenseData[0].total_expense_records || 0,
                totalPayments: payrollData[0].total_payments || 0
            }
        });

    } catch (error) {
        console.error('Error generating financial overview report:', error);
        res.status(500).json({ error: 'Failed to generate financial overview report' });
    } finally {
        client.release();
    }
});

// Get Employee Management Report
router.get('/employee-management', async (req, res) => {
    const client = await pool.connect();
    try {
        // Get total employees
        const { rows: employeeCount } = await client.query(`
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_employees,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_employees
            FROM "Employee"
        `);

        // Get department-wise employee distribution
        const { rows: departmentDistribution } = await client.query(`
            SELECT 
                d.name as department,
                COUNT(e.id) as employee_count,
                COUNT(CASE WHEN e.status = 'Active' THEN 1 END) as active_count
            FROM "Departments" d
            LEFT JOIN "Employee" e ON d.id = e.department_id
            GROUP BY d.name
        `);

        // Get attendance statistics
        const { rows: attendanceStats } = await client.query(`
            SELECT 
                COUNT(*) as total_attendance_records,
                COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_count
            FROM "Attendance"
            WHERE date = CURRENT_DATE
        `);

        // Get leave requests
        const { rows: leaveStats } = await client.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count
            FROM "LeaveRequests"
            WHERE request_date >= CURRENT_DATE - INTERVAL '30 days'
        `);

        res.json({
            employeeStatistics: employeeCount[0],
            departmentDistribution,
            attendanceStats: attendanceStats[0],
            leaveStats: leaveStats[0]
        });

    } catch (error) {
        console.error('Error generating employee management report:', error);
        res.status(500).json({ error: 'Failed to generate employee management report' });
    } finally {
        client.release();
    }
});

// Get Department-wise Reports
router.get('/department/:departmentId', async (req, res) => {
    const client = await pool.connect();
    try {
        const { departmentId } = req.params;
        const { startDate, endDate } = req.query;

        // Get department details
        const { rows: departmentInfo } = await client.query(`
            SELECT * FROM "Departments" WHERE id = $1
        `, [departmentId]);

        // Get department employees
        const { rows: employees } = await client.query(`
            SELECT 
                e.*,
                p.position_name
            FROM "Employee" e
            LEFT JOIN "Positions" p ON e.position_id = p.id
            WHERE e.department_id = $1
        `, [departmentId]);

        // Get department expenses
        const { rows: expenses } = await client.query(`
            SELECT * FROM "Expenses"
            WHERE department_id = $1
            AND expense_date BETWEEN $2 AND $3
        `, [departmentId, startDate, endDate]);

        // Get department projects
        const { rows: projects } = await client.query(`
            SELECT * FROM "Projects"
            WHERE department_id = $1
            AND start_date <= $3
            AND (end_date >= $2 OR end_date IS NULL)
        `, [departmentId, startDate, endDate]);

        res.json({
            departmentInfo: departmentInfo[0],
            employees,
            expenses,
            projects
        });

    } catch (error) {
        console.error('Error generating department report:', error);
        res.status(500).json({ error: 'Failed to generate department report' });
    } finally {
        client.release();
    }
});

// Get System Logs
router.get('/system-logs', async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate, logType } = req.query;

        let query = `
            SELECT * FROM "SystemLogs"
            WHERE timestamp BETWEEN $1 AND $2
        `;
        let params = [startDate, endDate];

        if (logType) {
            query += ` AND log_type = $3`;
            params.push(logType);
        }

        query += ` ORDER BY timestamp DESC LIMIT 1000`;

        const { rows: logs } = await client.query(query, params);

        // Get log statistics
        const { rows: logStats } = await client.query(`
            SELECT 
                log_type,
                COUNT(*) as count
            FROM "SystemLogs"
            WHERE timestamp BETWEEN $1 AND $2
            GROUP BY log_type
        `, [startDate, endDate]);

        res.json({
            logs,
            statistics: logStats
        });

    } catch (error) {
        console.error('Error retrieving system logs:', error);
        res.status(500).json({ error: 'Failed to retrieve system logs' });
    } finally {
        client.release();
    }
});

// Get Employee Reports
router.get('/employee-reports', async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate, departmentId } = req.query;

        let query = `
            SELECT 
                e.id,
                e.name,
                e.employeeid,
                d.name as department,
                p.position_name,
                COUNT(DISTINCT a.id) as total_reports,
                COUNT(DISTINCT CASE WHEN a.status = 'Pending' THEN a.id END) as pending_reports,
                COUNT(DISTINCT CASE WHEN a.status = 'Approved' THEN a.id END) as approved_reports,
                COUNT(DISTINCT CASE WHEN a.status = 'Rejected' THEN a.id END) as rejected_reports
            FROM "Employee" e
            LEFT JOIN "Departments" d ON e.department_id = d.id
            LEFT JOIN "Positions" p ON e.position_id = p.id
            LEFT JOIN "EmployeeReports" a ON e.id = a.employee_id
            WHERE a.report_date BETWEEN $1 AND $2
        `;
        let params = [startDate, endDate];

        if (departmentId) {
            query += ` AND e.department_id = $3`;
            params.push(departmentId);
        }

        query += ` GROUP BY e.id, e.name, e.employeeid, d.name, p.position_name`;

        const { rows: employeeReports } = await client.query(query, params);

        res.json({
            employeeReports
        });

    } catch (error) {
        console.error('Error retrieving employee reports:', error);
        res.status(500).json({ error: 'Failed to retrieve employee reports' });
    } finally {
        client.release();
    }
});

// Export Reports to Excel
router.get('/export/:reportType/excel', async (req, res) => {
    try {
        const { reportType } = req.params;
        const { startDate, endDate } = req.query;

        let query;
        let worksheetName;
        let columns;

        switch (reportType) {
            case 'financial':
                query = `
                    SELECT 
                        i.invoice_date,
                        i.invoice_number,
                        i.amount as revenue,
                        e.amount as expense,
                        p.netsalary as payroll
                    FROM "Invoices" i
                    LEFT JOIN "Expenses" e ON i.invoice_date = e.expense_date
                    LEFT JOIN "Payroll" p ON i.invoice_date = p.paymentdate
                    WHERE i.invoice_date BETWEEN $1 AND $2
                `;
                worksheetName = 'Financial Report';
                columns = [
                    { header: 'Date', key: 'invoice_date', width: 15 },
                    { header: 'Invoice Number', key: 'invoice_number', width: 20 },
                    { header: 'Revenue', key: 'revenue', width: 15 },
                    { header: 'Expense', key: 'expense', width: 15 },
                    { header: 'Payroll', key: 'payroll', width: 15 }
                ];
                break;

            case 'employee':
                query = `
                    SELECT 
                        e.name,
                        e.employeeid,
                        d.name as department,
                        p.position_name,
                        a.status as attendance_status,
                        l.status as leave_status
                    FROM "Employee" e
                    LEFT JOIN "Departments" d ON e.department_id = d.id
                    LEFT JOIN "Positions" p ON e.position_id = p.id
                    LEFT JOIN "Attendance" a ON e.id = a.employee_id
                    LEFT JOIN "LeaveRequests" l ON e.id = l.employee_id
                    WHERE a.date BETWEEN $1 AND $2
                `;
                worksheetName = 'Employee Report';
                columns = [
                    { header: 'Name', key: 'name', width: 20 },
                    { header: 'Employee ID', key: 'employeeid', width: 15 },
                    { header: 'Department', key: 'department', width: 15 },
                    { header: 'Position', key: 'position_name', width: 15 },
                    { header: 'Attendance', key: 'attendance_status', width: 15 },
                    { header: 'Leave Status', key: 'leave_status', width: 15 }
                ];
                break;

            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        const { rows } = await pool.query(query, [startDate, endDate]);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(worksheetName);

        // Add headers
        worksheet.columns = columns;

        // Add rows
        worksheet.addRows(rows);

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}Report.xlsx`);

        // Send workbook
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting report to Excel:', error);
        res.status(500).json({ error: 'Failed to export report to Excel' });
    }
});

module.exports = router; 