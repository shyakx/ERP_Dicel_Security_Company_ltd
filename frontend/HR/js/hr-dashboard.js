// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load all dashboard data
    loadDashboardData();
});

const API_BASE = 'http://localhost:3000';

// Function to load all dashboard data
async function loadDashboardData() {
    try {
        // Load employee statistics
        const employeeStats = await fetch(API_BASE + '/api/hr/statistics').then(res => res.json());
        updateEmployeeStats(employeeStats);

        // Load recent employees
        const recentEmployees = await fetch(API_BASE + '/api/hr/recent-employees').then(res => res.json());
        updateRecentEmployees(recentEmployees);

        // Load recent leave requests
        const recentLeaves = await fetch(API_BASE + '/api/hr/recent-leaves').then(res => res.json());
        updateRecentLeaves(recentLeaves);

        // Load today's attendance
        const attendance = await fetch(API_BASE + '/api/hr/today-attendance').then(res => res.json());
        updateTodayAttendance(attendance);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data');
    }
}

// Function to update employee statistics
function updateEmployeeStats(stats) {
    document.getElementById('totalEmployees').textContent = stats.totalEmployees;
    document.getElementById('activeEmployees').textContent = stats.activeEmployees;
    document.getElementById('pendingLeaves').textContent = stats.pendingLeaves;
}

// Function to update recent employees table
function updateRecentEmployees(employees) {
    const tbody = document.getElementById('recentEmployees');
    tbody.innerHTML = '';

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.employeeId}</td>
            <td>${employee.name}</td>
            <td>${employee.department}</td>
            <td>${new Date(employee.joinDate).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to update recent leave requests table
function updateRecentLeaves(leaves) {
    const tbody = document.getElementById('recentLeaves');
    tbody.innerHTML = '';

    leaves.forEach(leave => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${leave.employeeName}</td>
            <td>${leave.type}</td>
            <td>${new Date(leave.startDate).toLocaleDateString()}</td>
            <td>
                <span class="badge badge-${getLeaveStatusBadgeClass(leave.status)}">
                    ${leave.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to update today's attendance
function updateTodayAttendance(attendance) {
    document.getElementById('todayAttendance').textContent = 
        `${attendance.present}/${attendance.total}`;
}

// Function to get badge class for leave status
function getLeaveStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'approved':
            return 'success';
        case 'rejected':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Function to handle quick action buttons
document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.dataset.action;
        switch (action) {
            case 'add-employee':
                window.location.href = 'employees.html';
                break;
            case 'manage-attendance':
                window.location.href = 'attendance.html';
                break;
            case 'process-payroll':
                window.location.href = 'payroll.html';
                break;
            case 'generate-reports':
                window.location.href = 'reports.html';
                break;
        }
    });
}); 