// Global variables
let startDate, endDate, departmentId;
let charts = {};

// Initialize the page
$(document).ready(function() {
    // Initialize date pickers with default values
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate = firstDayOfMonth.toISOString().split('T')[0];
    endDate = today.toISOString().split('T')[0];
    
    $('#startDate').val(startDate);
    $('#endDate').val(endDate);

    // Load departments
    loadDepartments();

    // Initialize DataTables
    initializeDataTables();

    // Load initial data
    loadAllReports();

    // Handle form submission
    $('#reportFilters').on('submit', function(e) {
        e.preventDefault();
        startDate = $('#startDate').val();
        endDate = $('#endDate').val();
        departmentId = $('#department').val();
        loadAllReports();
    });
});

// Load departments into select
function loadDepartments() {
    $.ajax({
        url: '/api/departments',
        method: 'GET',
        success: function(response) {
            const select = $('#department');
            select.empty();
            select.append('<option value="">All Departments</option>');
            response.forEach(dept => {
                select.append(`<option value="${dept.id}">${dept.name}</option>`);
            });
        },
        error: function(error) {
            console.error('Error loading departments:', error);
        }
    });
}

// Initialize DataTables
function initializeDataTables() {
    $('#departmentDetailsTable').DataTable({
        pageLength: 10,
        order: [[0, 'asc']]
    });

    $('#departmentProjectsTable').DataTable({
        pageLength: 10,
        order: [[1, 'desc']]
    });

    $('#systemLogsTable').DataTable({
        pageLength: 25,
        order: [[0, 'desc']]
    });
}

// Load all reports
function loadAllReports() {
    loadFinancialReport();
    loadEmployeeManagementReport();
    loadDepartmentReport();
    loadSystemLogs();
}

// Load Financial Report
function loadFinancialReport() {
    $.ajax({
        url: '/api/reports/financial-overview',
        method: 'GET',
        data: { startDate, endDate },
        success: function(response) {
            // Update summary cards
            $('#totalRevenue').text(formatCurrency(response.financialOverview.totalRevenue));
            $('#totalExpenses').text(formatCurrency(response.financialOverview.totalExpenses));
            $('#netProfit').text(formatCurrency(response.financialOverview.netProfit));
            $('#departmentExpenses').text(formatCurrency(response.financialOverview.totalPayroll));

            // Update charts
            updateRevenueExpensesChart(response);
            updateDepartmentExpensesChart(response.departmentExpenses);
        },
        error: function(error) {
            console.error('Error loading financial report:', error);
        }
    });
}

// Load Employee Management Report
function loadEmployeeManagementReport() {
    $.ajax({
        url: '/api/reports/employee-management',
        method: 'GET',
        success: function(response) {
            // Update summary cards
            $('#totalEmployees').text(response.employeeStatistics.total_employees);
            $('#activeEmployees').text(response.employeeStatistics.active_employees);
            $('#attendanceToday').text(response.attendanceStats.present_count);
            $('#pendingLeaveRequests').text(response.leaveStats.pending_count);

            // Update charts
            updateDepartmentDistributionChart(response.departmentDistribution);
            updateAttendanceStatsChart(response.attendanceStats);
        },
        error: function(error) {
            console.error('Error loading employee management report:', error);
        }
    });
}

// Load Department Report
function loadDepartmentReport() {
    if (!departmentId) return;

    $.ajax({
        url: `/api/reports/department/${departmentId}`,
        method: 'GET',
        data: { startDate, endDate },
        success: function(response) {
            // Update department details table
            const detailsTable = $('#departmentDetailsTable').DataTable();
            detailsTable.clear();
            detailsTable.row.add([
                response.departmentInfo.name,
                response.employees.length,
                response.projects.length,
                formatCurrency(response.expenses.reduce((sum, exp) => sum + exp.amount, 0))
            ]).draw();

            // Update department projects table
            const projectsTable = $('#departmentProjectsTable').DataTable();
            projectsTable.clear();
            response.projects.forEach(project => {
                projectsTable.row.add([
                    project.name,
                    formatDate(project.start_date),
                    formatDate(project.end_date),
                    project.status
                ]);
            });
            projectsTable.draw();
        },
        error: function(error) {
            console.error('Error loading department report:', error);
        }
    });
}

// Load System Logs
function loadSystemLogs() {
    $.ajax({
        url: '/api/reports/system-logs',
        method: 'GET',
        data: { startDate, endDate },
        success: function(response) {
            const logsTable = $('#systemLogsTable').DataTable();
            logsTable.clear();
            response.logs.forEach(log => {
                logsTable.row.add([
                    formatDateTime(log.timestamp),
                    log.log_type,
                    log.user,
                    log.action,
                    log.details
                ]);
            });
            logsTable.draw();
        },
        error: function(error) {
            console.error('Error loading system logs:', error);
        }
    });
}

// Chart update functions
function updateRevenueExpensesChart(data) {
    const ctx = document.getElementById('revenueExpensesChart').getContext('2d');
    if (charts.revenueExpenses) {
        charts.revenueExpenses.destroy();
    }
    charts.revenueExpenses = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Revenue', 'Expenses', 'Net Profit'],
            datasets: [{
                label: 'Amount (RWF)',
                data: [
                    data.financialOverview.totalRevenue,
                    data.financialOverview.totalExpenses,
                    data.financialOverview.netProfit
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateDepartmentExpensesChart(data) {
    const ctx = document.getElementById('departmentExpensesChart').getContext('2d');
    if (charts.departmentExpenses) {
        charts.departmentExpenses.destroy();
    }
    charts.departmentExpenses = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.department),
            datasets: [{
                label: 'Expenses (RWF)',
                data: data.map(item => item.total_expenses),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateDepartmentDistributionChart(data) {
    const ctx = document.getElementById('departmentDistributionChart').getContext('2d');
    if (charts.departmentDistribution) {
        charts.departmentDistribution.destroy();
    }
    charts.departmentDistribution = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.department),
            datasets: [{
                data: data.map(item => item.employee_count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateAttendanceStatsChart(data) {
    const ctx = document.getElementById('attendanceStatsChart').getContext('2d');
    if (charts.attendanceStats) {
        charts.attendanceStats.destroy();
    }
    charts.attendanceStats = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
                data: [
                    data.present_count,
                    data.absent_count,
                    data.late_count
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString();
} 