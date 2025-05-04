// Global variables
let payrolls = [];
let employees = [];

// Initialize the page
$(document).ready(function() {
    checkAuth();
    loadEmployees();
    loadPayrolls();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    $.ajax({
        url: '/api/auth/check',
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

// Load employees
function loadEmployees() {
    $.ajax({
        url: '/api/employees',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            employees = response;
            updateEmployeeSelects();
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading employees: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        }
    });
}

// Update employee selects
function updateEmployeeSelects() {
    const selects = ['#employeeId', '#editEmployeeId'];
    selects.forEach(select => {
        $(select).empty();
        $(select).append('<option value="">Select Employee</option>');
        employees.forEach(employee => {
            $(select).append(`<option value="${employee.id}">${employee.employee_id} - ${employee.name}</option>`);
        });
    });
}

// Load payrolls
function loadPayrolls() {
    UiUtils.showLoading();
    $.ajax({
        url: '/api/payrolls',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            payrolls = response;
            updatePayrollTable();
            updatePayrollSummary();
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading payrolls: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        },
        complete: function() {
            UiUtils.hideLoading();
        }
    });
}

// Update payroll table
function updatePayrollTable() {
    const tbody = $('#payrollTableBody');
    tbody.empty();
    
    payrolls.forEach(payroll => {
        const employee = employees.find(e => e.id === payroll.employee_id);
        const row = `
            <tr>
                <td>${employee ? employee.employee_id : 'N/A'}</td>
                <td>${employee ? employee.name : 'N/A'}</td>
                <td>${employee ? employee.department : 'N/A'}</td>
                <td>${UiUtils.formatCurrency(payroll.basic_salary)}</td>
                <td>${UiUtils.formatCurrency(payroll.allowances)}</td>
                <td>${UiUtils.formatCurrency(payroll.deductions)}</td>
                <td>${UiUtils.formatCurrency(payroll.net_pay)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(payroll.status)}">
                        ${payroll.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary edit-payroll" data-id="${payroll.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-payroll" data-id="${payroll.id}">
                        <i class="fas fa-trash"></i>
                    </button>
            </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Update payroll summary
function updatePayrollSummary() {
    const totalPayroll = payrolls.reduce((sum, p) => sum + p.net_pay, 0);
    const averageSalary = payrolls.length > 0 ? totalPayroll / payrolls.length : 0;
    const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);
    
    $('#totalPayroll').text(UiUtils.formatCurrency(totalPayroll));
    $('#averageSalary').text(UiUtils.formatCurrency(averageSalary));
    $('#taxDeductions').text(UiUtils.formatCurrency(totalDeductions));
    $('#netPay').text(UiUtils.formatCurrency(totalPayroll - totalDeductions));
}

// Setup event listeners
function setupEventListeners() {
    // Add payroll form submission
    $('#addPayrollForm').on('submit', function(e) {
        e.preventDefault();
        const payroll = {
            employee_id: $('#employeeId').val(),
            basic_salary: $('#basicSalary').val(),
            allowances: $('#allowances').val() || 0,
            deductions: $('#deductions').val() || 0,
            status: $('#status').val()
        };
        
        UiUtils.showLoading();
        
        $.ajax({
            url: '/api/payrolls',
            method: 'POST',
            headers: AuthUtils.getAuthHeaders(),
            data: payroll,
            success: function(response) {
                $('#addPayrollModal').modal('hide');
                loadPayrolls();
                UiUtils.showNotification('Payroll entry added successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error adding payroll entry: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Edit payroll form submission
    $('#editPayrollForm').on('submit', function(e) {
        e.preventDefault();
        const payroll = {
            id: $('#editPayrollId').val(),
            employee_id: $('#editEmployeeId').val(),
            basic_salary: $('#editBasicSalary').val(),
            allowances: $('#editAllowances').val() || 0,
            deductions: $('#editDeductions').val() || 0,
            status: $('#editStatus').val()
        };
        
        UiUtils.showLoading();
        
        $.ajax({
            url: `/api/payrolls/${payroll.id}`,
            method: 'PUT',
            headers: AuthUtils.getAuthHeaders(),
            data: payroll,
            success: function(response) {
                $('#editPayrollModal').modal('hide');
                loadPayrolls();
                UiUtils.showNotification('Payroll entry updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating payroll entry: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Delete payroll
    $(document).on('click', '.delete-payroll', function() {
        const id = $(this).data('id');
        const payroll = payrolls.find(p => p.id === id);
        const employee = employees.find(e => e.id === payroll.employee_id);
        
        if (payroll) {
            UiUtils.confirmDialog(`Are you sure you want to delete payroll entry for employee ${employee ? employee.employee_id : 'N/A'}?`)
                .then(confirmed => {
                    if (confirmed) {
                        UiUtils.showLoading();
                        $.ajax({
                            url: `/api/payrolls/${id}`,
                            method: 'DELETE',
                            headers: AuthUtils.getAuthHeaders(),
                            success: function() {
                                loadPayrolls();
                                UiUtils.showNotification('Payroll entry deleted successfully', 'success');
                            },
                            error: function(xhr) {
                                UiUtils.showNotification('Error deleting payroll entry: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                            },
                            complete: function() {
                                UiUtils.hideLoading();
                            }
                        });
                    }
                });
        }
    });

    // Edit payroll
    $(document).on('click', '.edit-payroll', function() {
        const id = $(this).data('id');
        const payroll = payrolls.find(p => p.id === id);
        if (payroll) {
            $('#editPayrollId').val(payroll.id);
            $('#editEmployeeId').val(payroll.employee_id);
            $('#editBasicSalary').val(payroll.basic_salary);
            $('#editAllowances').val(payroll.allowances);
            $('#editDeductions').val(payroll.deductions);
            $('#editStatus').val(payroll.status);
            $('#editPayrollModal').modal('show');
        }
    });

    // Process payroll
    $('#processPayroll').on('click', function() {
        UiUtils.confirmDialog('Are you sure you want to process payroll for all employees?')
            .then(confirmed => {
                if (confirmed) {
                    UiUtils.showLoading();
                    $.ajax({
                        url: '/api/payrolls/process',
                        method: 'POST',
                        headers: AuthUtils.getAuthHeaders(),
                        success: function() {
                            loadPayrolls();
                            UiUtils.showNotification('Payroll processed successfully', 'success');
                        },
                        error: function(xhr) {
                            UiUtils.showNotification('Error processing payroll: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                        },
                        complete: function() {
                            UiUtils.hideLoading();
                        }
                    });
                }
            });
    });

    // Employee selection change
    $('#employeeId').on('change', function() {
        const employeeId = $(this).val();
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
            $('#basicSalary').val(employee.salary);
        }
    });
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Paid':
            return 'bg-success';
        case 'Processed':
            return 'bg-info';
        case 'Pending':
            return 'bg-warning';
        default:
            return 'bg-secondary';
    }
} 