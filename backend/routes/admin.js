const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the db.js file

router.get('/dashboard', async (req, res) => {
    try {
        // Fetch total employees
        const totalEmployeesResult = await pool.query('SELECT COUNT(*) AS totalEmployees FROM "Employee"');
        const totalEmployees = totalEmployeesResult.rows[0]?.totalemployees || 0;
        console.log('Total Employees:', totalEmployees); // Debugging log

        // Fetch monthly revenue breakdown
        const monthlyRevenueResult = await pool.query(`
            SELECT EXTRACT(MONTH FROM date) AS month, SUM(amount) AS revenue
            FROM revenues
            WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY EXTRACT(MONTH FROM date)
            ORDER BY month
        `);
        const monthlyRevenueBreakdown = Array(12).fill(0); // Initialize with 12 months
        monthlyRevenueResult.rows.forEach(row => {
            monthlyRevenueBreakdown[row.month - 1] = parseFloat(row.revenue);
        });
        console.log('Monthly Revenue Breakdown:', monthlyRevenueBreakdown); // Debugging log

        // Fetch active contracts by type
        const contractsByTypeResult = await pool.query(`
            SELECT status AS type, COUNT(*) AS count
            FROM "Contract"
            GROUP BY status
        `);
        const contractsByType = {};
        contractsByTypeResult.rows.forEach(row => {
            contractsByType[row.type] = parseInt(row.count);
        });
        console.log('Contracts By Type:', contractsByType); // Debugging log

        // Fetch tasks progress
        const tasksProgressResult = await pool.query(`
            SELECT AVG(progress) AS averageProgress
            FROM "Task"
        `);
        const tasksProgress = Math.round(tasksProgressResult.rows[0]?.averageprogress || 0);
        console.log('Tasks Progress:', tasksProgress); // Debugging log

        // Send response
        res.json({
            totalEmployees,
            monthlyRevenueBreakdown,
            contractsByType,
            tasksProgress
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;