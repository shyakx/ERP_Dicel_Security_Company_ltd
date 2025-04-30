const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

// Get payroll report data
router.get('/payroll', async (req, res) => {
    const client = await pool.connect();
    try {
        const { startDate, endDate, department } = req.query;

        // Validate date parameters
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        // Validate date format
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (startDateObj > endDateObj) {
            return res.status(400).json({ error: 'Start date cannot be after end date' });
        }

        // Base query for payroll records
        let query = `
            SELECT 
                p.*,
                e.employeeid as employee_code,
                e.name,
                e.position,
                e.department
            FROM "Payroll" p
            JOIN "Employee" e ON p.employeeid = e.id
            WHERE p.paymentdate BETWEEN $1 AND $2
        `;
        let params = [startDate, endDate];

        // Add department filter if specified
        if (department) {
            query += ` AND e.department = $3`;
            params.push(department);
        }

        // Get payroll records
        const { rows: payrollRecords } = await client.query(query, params);

        // Return empty data if no records found
        if (payrollRecords.length === 0) {
            return res.json({
                payrollRecords: [],
                summary: {
                    totalEmployees: 0,
                    totalPayroll: 0,
                    totalDeductions: 0,
                    averageSalary: 0
                },
                departmentDistribution: [],
                monthlyTrend: []
            });
        }

        // Get department distribution
        const { rows: departmentDistribution } = await client.query(`
            SELECT 
                e.department,
                SUM(p.netsalary) as total
            FROM "Payroll" p
            JOIN "Employee" e ON p.employeeid = e.id
            WHERE p.paymentdate BETWEEN $1 AND $2
            GROUP BY e.department
        `, [startDate, endDate]);

        // Get monthly trend
        const { rows: monthlyTrend } = await client.query(`
            SELECT 
                TO_CHAR(p.paymentdate, 'YYYY-MM') as month,
                SUM(p.netsalary) as total
            FROM "Payroll" p
            WHERE p.paymentdate BETWEEN $1 AND $2
            GROUP BY TO_CHAR(p.paymentdate, 'YYYY-MM')
            ORDER BY month
        `, [startDate, endDate]);

        // Calculate summary statistics
        const summary = {
            totalEmployees: new Set(payrollRecords.map(r => r.employeeid)).size,
            totalPayroll: payrollRecords.reduce((sum, r) => sum + parseFloat(r.netsalary), 0),
            totalDeductions: payrollRecords.reduce((sum, r) => sum + parseFloat(r.deductions), 0),
            averageSalary: payrollRecords.length > 0 ? 
                payrollRecords.reduce((sum, r) => sum + parseFloat(r.netsalary), 0) / payrollRecords.length : 0
        };

        // Format the response
        const formattedRecords = payrollRecords.map(record => ({
            id: record.id,
            employeeId: record.employee_code,
            name: record.name,
            department: record.department,
            position: record.position,
            baseSalary: parseFloat(record.basesalary),
            allowances: parseFloat(record.allowances),
            deductions: parseFloat(record.deductions),
            netSalary: parseFloat(record.netsalary),
            paymentDate: record.paymentdate,
            status: record.status
        }));

        res.json({
            payrollRecords: formattedRecords,
            summary,
            departmentDistribution,
            monthlyTrend
        });

    } catch (error) {
        console.error('Error generating payroll report:', error);
        res.status(500).json({ error: 'Failed to generate payroll report' });
    } finally {
        client.release();
    }
});

// Export to Excel
router.get('/export/excel', async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;

        // Get payroll data
        let query = `
            SELECT 
                e.employeeid,
                e.name,
                e.department,
                e.position,
                p.basesalary,
                p.allowances,
                p.deductions,
                p.netsalary,
                p.paymentdate,
                p.status
            FROM "Payroll" p
            JOIN "Employee" e ON p.employeeid = e.id
            WHERE p.paymentdate BETWEEN $1 AND $2
        `;
        let params = [startDate, endDate];

        if (department) {
            query += ` AND e.department = $3`;
            params.push(department);
        }

        const { rows } = await pool.query(query, params);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payroll Report');

        // Add headers
        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeid', width: 15 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Position', key: 'position', width: 15 },
            { header: 'Base Salary', key: 'basesalary', width: 15 },
            { header: 'Allowances', key: 'allowances', width: 15 },
            { header: 'Deductions', key: 'deductions', width: 15 },
            { header: 'Net Salary', key: 'netsalary', width: 15 },
            { header: 'Payment Date', key: 'paymentdate', width: 15 },
            { header: 'Status', key: 'status', width: 12 }
        ];

        // Add rows
        worksheet.addRows(rows);

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=PayrollReport.xlsx');

        // Send workbook
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).json({ error: 'Failed to export to Excel' });
    }
});

// Export to PDF
router.get('/export/pdf', async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;

        // Get payroll data
        let query = `
            SELECT 
                e.employeeid,
                e.name,
                e.department,
                e.position,
                p.basesalary,
                p.allowances,
                p.deductions,
                p.netsalary,
                p.paymentdate,
                p.status
            FROM "Payroll" p
            JOIN "Employee" e ON p.employeeid = e.id
            WHERE p.paymentdate BETWEEN $1 AND $2
        `;
        let params = [startDate, endDate];

        if (department) {
            query += ` AND e.department = $3`;
            params.push(department);
        }

        const { rows } = await pool.query(query, params);

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=PayrollReport.pdf');

        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(16).text('Payroll Report', { align: 'center' });
        doc.moveDown();

        // Add date range
        doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
        doc.moveDown();

        // Add table
        const table = {
            headers: ['Employee ID', 'Name', 'Department', 'Position', 'Base Salary', 'Net Salary', 'Status'],
            rows: rows.map(row => [
                row.employeeid,
                row.name,
                row.department,
                row.position,
                `RWF ${parseFloat(row.basesalary).toFixed(2)}`,
                `RWF ${parseFloat(row.netsalary).toFixed(2)}`,
                row.status
            ])
        };

        await doc.table(table, {
            prepareHeader: () => doc.fontSize(10),
            prepareRow: () => doc.fontSize(10)
        });

        // End document
        doc.end();

    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).json({ error: 'Failed to export to PDF' });
    }
});

// Get departments
router.get('/departments', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT DISTINCT department as name, department as id
            FROM "Employee"
            WHERE department IS NOT NULL
            ORDER BY department
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

module.exports = router; 