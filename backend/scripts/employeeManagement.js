const pool = require('../config/db');

async function deleteAllEmployees() {
    try {
        // First delete related records in all dependent tables
        await pool.query('DELETE FROM "Attendance"');
        console.log('Deleted all attendance records');
        
        await pool.query('DELETE FROM "EquipmentAssignment"');
        console.log('Deleted all equipment assignments');
        
        await pool.query('DELETE FROM "Leave"');
        console.log('Deleted all leave records');
        
        await pool.query('DELETE FROM "Task"');
        console.log('Deleted all task records');
        
        await pool.query('DELETE FROM "Incident"');
        console.log('Deleted all incident records');
        
        // Then delete employees
        const result = await pool.query('DELETE FROM "Employee"');
        console.log(`Deleted ${result.rowCount} employees`);
    } catch (error) {
        console.error('Error deleting employees:', error);
    }
}

async function addNewEmployee(employee) {
    try {
        const { userid, employeeid, department, position, hiredate, salary, status } = employee;
        const result = await pool.query(
            `INSERT INTO "Employee" (userid, employeeid, department, position, hiredate, salary, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userid, employeeid, department, position, hiredate, salary, status]
        );
        console.log(`Added employee: ${result.rows[0].employeeid}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding employee:', error);
    }
}

// Sample new employees data with completely new IDs
const newEmployees = [
    {
        userid: 1001,  // New userid format starting from 1001
        employeeid: 'DSC2024001',  // New format: DSC (Dicel Security Company) + Year + Sequential number
        department: 'Security',
        position: 'Security Guard',
        hiredate: '2024-01-01',
        salary: 2500,
        status: 'active'
    },
    {
        userid: 1002,
        employeeid: 'DSC2024002',
        department: 'Management',
        position: 'Operations Manager',
        hiredate: '2024-01-01',
        salary: 4000,
        status: 'active'
    },
    {
        userid: 1003,
        employeeid: 'DSC2024003',
        department: 'HR',
        position: 'HR Manager',
        hiredate: '2024-01-01',
        salary: 3500,
        status: 'active'
    }
];

async function main() {
    try {
        // Delete all existing employees and related records
        await deleteAllEmployees();
        
        // Add new employees
        for (const employee of newEmployees) {
            await addNewEmployee(employee);
        }
        
        console.log('Successfully completed employee management operations');
    } catch (error) {
        console.error('Error in main operation:', error);
    } finally {
        // Close the database connection
        await pool.end();
    }
}

main(); 