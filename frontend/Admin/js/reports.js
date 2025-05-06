// Global variables
let reports = [];
let charts = {};

// Initialize the page
$(document).ready(function() {
    checkAuth();
    loadReports();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    $.ajax({
        url: 'http://localhost:3000/api/auth/check',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            if (!response.authenticated || response.role !== 'admin') {
                window.location.href = '/login.html';
            }
        },
        error: function() {
            window.location.href = '/login.html';
        }
    });
}

// Load reports
function loadReports() {
    UiUtils.showLoading();
    $.ajax({
        url: '/api/reports',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            reports = response;
            updateReportsTable();
            initializeCharts();
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading reports: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        },
        complete: function() {
            UiUtils.hideLoading();
        }
    });
}

// Update reports table
function updateReportsTable() {
    const tbody = $('#reportsTableBody');
    tbody.empty();
    
    reports.forEach(report => {
        const row = `
            <tr>
                <td>${report.type}</td>
                <td>${report.period}</td>
                <td>${new Date(report.generated_date).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(report.status)}">
                        ${report.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary view-report" data-id="${report.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success download-report" data-id="${report.id}">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Initialize charts
function initializeCharts() {
    // Employee Distribution Chart
    const employeeCtx = document.getElementById('employeeDistributionChart').getContext('2d');
    charts.employeeDistribution = new Chart(employeeCtx, {
        type: 'bar',
        data: {
            labels: ['Security', 'Administration', 'Finance', 'HR', 'Operations'],
            datasets: [{
                label: 'Number of Employees',
                data: [25, 10, 5, 3, 15],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Payroll Summary Chart
    const payrollCtx = document.getElementById('payrollSummaryChart').getContext('2d');
    charts.payrollSummary = new Chart(payrollCtx, {
        type: 'pie',
        data: {
            labels: ['Basic Salary', 'Allowances', 'Deductions', 'Net Pay'],
            datasets: [{
                data: [60, 20, 10, 70],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Revenue',
                data: [5000000, 5500000, 6000000, 5800000, 6200000, 6500000],
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'RWF ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Attendance Chart
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    charts.attendance = new Chart(attendanceCtx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late', 'On Leave'],
            datasets: [{
                data: [70, 5, 10, 15],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Export reports
    $('#exportReports').on('click', function() {
        UiUtils.showLoading();
        $.ajax({
            url: '/api/reports/export',
            method: 'GET',
            headers: AuthUtils.getAuthHeaders(),
            success: function(response) {
                const link = document.createElement('a');
                link.href = response.download_url;
                link.download = 'reports_export.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                UiUtils.showNotification('Reports exported successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error exporting reports: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Generate reports
    $('#generateReports').on('click', function() {
        UiUtils.confirmDialog('Are you sure you want to generate new reports? This may take a few minutes.')
            .then(confirmed => {
                if (confirmed) {
                    UiUtils.showLoading();
                    $.ajax({
                        url: '/api/reports/generate',
                        method: 'POST',
                        headers: AuthUtils.getAuthHeaders(),
                        success: function() {
                            loadReports();
                            UiUtils.showNotification('Reports generated successfully', 'success');
                        },
                        error: function(xhr) {
                            UiUtils.showNotification('Error generating reports: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                        },
                        complete: function() {
                            UiUtils.hideLoading();
                        }
                    });
                }
            });
    });

    // View report
    $(document).on('click', '.view-report', function() {
        const id = $(this).data('id');
        const report = reports.find(r => r.id === id);
        if (report) {
            window.open(`/api/reports/${id}/view`, '_blank');
        }
    });

    // Download report
    $(document).on('click', '.download-report', function() {
        const id = $(this).data('id');
        const report = reports.find(r => r.id === id);
        if (report) {
            const link = document.createElement('a');
            link.href = `/api/reports/${id}/download`;
            link.download = `${report.type}_${report.period}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    // Logout
    $('#logoutModal .btn-primary').on('click', function() {
        $.ajax({
            url: '/api/auth/logout',
            method: 'POST',
            headers: AuthUtils.getAuthHeaders(),
            success: function() {
                window.location.href = '/login.html';
            },
            error: function() {
                window.location.href = '/login.html';
            }
        });
    });
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Completed':
            return 'bg-success';
        case 'Processing':
            return 'bg-info';
        case 'Failed':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
} 