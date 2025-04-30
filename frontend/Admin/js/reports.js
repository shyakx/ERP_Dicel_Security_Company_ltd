// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Charts
let payrollDistributionChart;
let payrollTrendChart;
let reportTable;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing reports page...');
    
    // Set default date range (current month)
    setDefaultDateRange();
    
    // Initialize DataTable
    reportTable = $('#reportTable').DataTable({
        pageLength: 10,
        responsive: true,
        order: [[8, 'desc']], // Sort by payment date by default
        columns: [
            { data: 'employeeId' },
            { data: 'name' },
            { data: 'department' },
            { data: 'position' },
            { 
                data: 'baseSalary',
                render: function(data) {
                    return `RWF ${parseFloat(data).toFixed(2)}`;
                }
            },
            { 
                data: 'allowances',
                render: function(data) {
                    return `RWF ${parseFloat(data).toFixed(2)}`;
                }
            },
            { 
                data: 'deductions',
                render: function(data) {
                    return `RWF ${parseFloat(data).toFixed(2)}`;
                }
            },
            { 
                data: 'netSalary',
                render: function(data) {
                    return `RWF ${parseFloat(data).toFixed(2)}`;
                }
            },
            { 
                data: 'paymentDate',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statusClasses = {
                        'Paid': 'success',
                        'Pending': 'warning',
                        'Failed': 'danger'
                    };
                    return `<span class="badge badge-${statusClasses[data] || 'secondary'}">${data}</span>`;
                }
            }
        ]
    });

    // Initialize Charts
    initializeCharts();

    // Load initial data
    loadReportData();

    // Add event listeners
    document.getElementById('reportFilters').addEventListener('submit', function(e) {
        e.preventDefault();
        loadReportData();
    });

    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);

    // Load departments for filter
    loadDepartments();
});

// Initialize Charts
function initializeCharts() {
    // Payroll Distribution Chart
    const payrollDistributionCtx = document.getElementById('payrollDistributionChart').getContext('2d');
    payrollDistributionChart = new Chart(payrollDistributionCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    '#f6c23e',
                    '#e74a3b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            }
        }
    });

    // Payroll Trend Chart
    const payrollTrendCtx = document.getElementById('payrollTrendChart').getContext('2d');
    payrollTrendChart = new Chart(payrollTrendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Payroll',
                data: [],
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            return 'RWF ' + value.toLocaleString();
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        return 'RWF ' + tooltipItem.yLabel.toLocaleString();
                    }
                }
            }
        }
    });
}

// Set default date range
function setDefaultDateRange() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = lastDayOfMonth.toISOString().split('T')[0];
}

// Load Report Data
async function loadReportData() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const department = document.getElementById('department').value;

        if (!startDate || !endDate) {
            throw new Error('Please select both start and end dates');
        }

        if (new Date(startDate) > new Date(endDate)) {
            throw new Error('Start date cannot be after end date');
        }

        const response = await fetch(`${API_BASE_URL}/admin/reports/payroll?startDate=${startDate}&endDate=${endDate}&department=${department}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch report data');
        }

        const data = await response.json();
        
        if (!data || !data.payrollRecords) {
            throw new Error('Invalid data received from server');
        }

        // Update table
        reportTable.clear().rows.add(data.payrollRecords).draw();

        // Update summary statistics
        updateSummaryStatistics(data.summary);

        // Update charts
        updatePayrollDistributionChart(data.departmentDistribution);
        updatePayrollTrendChart(data.monthlyTrend);

    } catch (error) {
        console.error('Error loading report data:', error);
        // Show error in a more user-friendly way
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger alert-dismissible fade show';
        errorMessage.innerHTML = `
            <strong>Error:</strong> ${error.message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        document.querySelector('.container-fluid').insertBefore(
            errorMessage,
            document.querySelector('.card')
        );
    }
}

// Update Summary Statistics
function updateSummaryStatistics(summary) {
    document.getElementById('totalEmployees').textContent = summary.totalEmployees;
    document.getElementById('totalPayroll').textContent = `RWF ${summary.totalPayroll.toFixed(2)}`;
    document.getElementById('averageSalary').textContent = `RWF ${summary.averageSalary.toFixed(2)}`;
    document.getElementById('totalDeductions').textContent = `RWF ${summary.totalDeductions.toFixed(2)}`;
}

// Update Payroll Distribution Chart
function updatePayrollDistributionChart(data) {
    payrollDistributionChart.data.labels = data.map(item => item.department);
    payrollDistributionChart.data.datasets[0].data = data.map(item => item.total);
    payrollDistributionChart.update();
}

// Update Payroll Trend Chart
function updatePayrollTrendChart(data) {
    payrollTrendChart.data.labels = data.map(item => item.month);
    payrollTrendChart.data.datasets[0].data = data.map(item => item.total);
    payrollTrendChart.update();
}

// Load Departments
async function loadDepartments() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/departments`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch departments');
        }

        const departments = await response.json();
        const departmentSelect = document.getElementById('department');

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Export to Excel
function exportToExcel() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const department = document.getElementById('department').value;

    window.location.href = `${API_BASE_URL}/admin/reports/export/excel?startDate=${startDate}&endDate=${endDate}&department=${department}`;
}

// Export to PDF
function exportToPDF() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const department = document.getElementById('department').value;

    window.location.href = `${API_BASE_URL}/admin/reports/export/pdf?startDate=${startDate}&endDate=${endDate}&department=${department}`;
} 