// Global variables
let employees = [];
let departments = [];

// Initialize the page
$(document).ready(function() {
    checkAuth();
    loadDepartments();
    loadEmployees();
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

// Load departments
function loadDepartments() {
    $.ajax({
        url: '/api/departments',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            departments = response;
            updateDepartmentSelects();
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading departments: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        }
    });
}

// Update department selects
function updateDepartmentSelects() {
    const selects = ['#department', '#editDepartment'];
    selects.forEach(select => {
        $(select).empty();
        $(select).append('<option value="">Select Department</option>');
        departments.forEach(dept => {
            $(select).append(`<option value="${dept.id}">${dept.name}</option>`);
        });
    });
}

// Load employees
function loadEmployees() {
    UiUtils.showLoading();
    $.ajax({
        url: '/api/employees',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            employees = response;
            updateEmployeeTable();
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading employees: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        },
        complete: function() {
            UiUtils.hideLoading();
        }
    });
}

// Update employee table
function updateEmployeeTable() {
    const tbody = $('#employeeTableBody');
    tbody.empty();
    
    employees.forEach(employee => {
        const row = `
            <tr>
                <td>${employee.employee_id}</td>
                <td>${getDepartmentName(employee.department_id)}</td>
                <td>${employee.position}</td>
                <td>${UiUtils.formatDate(employee.hire_date)}</td>
                <td>${UiUtils.formatCurrency(employee.salary)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(employee.status)}">
                        ${employee.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary edit-employee" data-id="${employee.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-employee" data-id="${employee.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add employee form submission
    $('#addEmployeeForm').on('submit', function(e) {
        e.preventDefault();
        const employee = {
            employee_id: $('#employeeId').val(),
            department_id: $('#department').val(),
            position: $('#position').val(),
            hire_date: $('#hireDate').val(),
            salary: $('#salary').val(),
            status: $('#status').val()
        };
        
        UiUtils.showLoading();
        
        $.ajax({
            url: '/api/employees',
            method: 'POST',
            headers: AuthUtils.getAuthHeaders(),
            data: employee,
            success: function(response) {
                $('#addEmployeeModal').modal('hide');
                loadEmployees();
                UiUtils.showNotification('Employee added successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error adding employee: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Edit employee form submission
    $('#editEmployeeForm').on('submit', function(e) {
        e.preventDefault();
        const employee = {
            id: $('#editEmployeeId').val(),
            employee_id: $('#editEmployeeIdField').val(),
            department_id: $('#editDepartment').val(),
            position: $('#editPosition').val(),
            hire_date: $('#editHireDate').val(),
            salary: $('#editSalary').val(),
            status: $('#editStatus').val()
        };
        
        UiUtils.showLoading();
        
        $.ajax({
            url: `/api/employees/${employee.id}`,
            method: 'PUT',
            headers: AuthUtils.getAuthHeaders(),
            data: employee,
            success: function(response) {
                $('#editEmployeeModal').modal('hide');
                loadEmployees();
                UiUtils.showNotification('Employee updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating employee: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Delete employee
    $(document).on('click', '.delete-employee', function() {
        const id = $(this).data('id');
        const employee = employees.find(e => e.id === id);
        
        if (employee) {
            UiUtils.confirmDialog(`Are you sure you want to delete employee ${employee.employee_id}?`)
                .then(confirmed => {
                    if (confirmed) {
                        UiUtils.showLoading();
                        $.ajax({
                            url: `/api/employees/${id}`,
                            method: 'DELETE',
                            headers: AuthUtils.getAuthHeaders(),
                            success: function() {
                                loadEmployees();
                                UiUtils.showNotification('Employee deleted successfully', 'success');
                            },
                            error: function(xhr) {
                                UiUtils.showNotification('Error deleting employee: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                            },
                            complete: function() {
                                UiUtils.hideLoading();
                            }
                        });
                    }
                });
        }
    });

    // Edit employee
    $(document).on('click', '.edit-employee', function() {
        const id = $(this).data('id');
        const employee = employees.find(e => e.id === id);
        if (employee) {
            $('#editEmployeeId').val(employee.id);
            $('#editEmployeeIdField').val(employee.employee_id);
            $('#editDepartment').val(employee.department_id);
            $('#editPosition').val(employee.position);
            $('#editHireDate').val(employee.hire_date);
            $('#editSalary').val(employee.salary);
            $('#editStatus').val(employee.status);
            $('#editEmployeeModal').modal('show');
        }
    });

    // Delete all employees
    $('#deleteAllEmployees').on('click', function() {
        UiUtils.confirmDialog('Are you sure you want to delete all employees? This action cannot be undone.')
            .then(confirmed => {
                if (confirmed) {
                    UiUtils.showLoading();
                    $.ajax({
                        url: '/api/employees/delete-all',
                        method: 'DELETE',
                        headers: AuthUtils.getAuthHeaders(),
                        success: function() {
                            loadEmployees();
                            UiUtils.showNotification('All employees deleted successfully', 'success');
                        },
                        error: function(xhr) {
                            UiUtils.showNotification('Error deleting employees: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                        },
                        complete: function() {
                            UiUtils.hideLoading();
                        }
                    });
                }
            });
    });

    // Add sample employees
    $('#addSampleEmployees').on('click', function() {
        UiUtils.showLoading();
        $.ajax({
            url: '/api/employees/sample',
            method: 'POST',
            headers: AuthUtils.getAuthHeaders(),
            success: function() {
                loadEmployees();
                UiUtils.showNotification('Sample employees added successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error adding sample employees: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });
}

// Get department name
function getDepartmentName(departmentId) {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown';
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active':
            return 'bg-success';
        case 'Inactive':
            return 'bg-warning';
        case 'Terminated':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
} 