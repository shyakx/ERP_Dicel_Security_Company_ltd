$(document).ready(function() {
    fetchEmployees();

    // Add Employee
    $('#addEmployeeForm').on('submit', function(e) {
        e.preventDefault();
        const employee = {
            employeeid: $('#employeeId').val(),
            department: $('#department').val(),
            position: $('#position').val(),
            hiredate: $('#hireDate').val(),
            salary: $('#salary').val(),
            status: $('#status').val(),
            userid: 1 // Placeholder, should be set to the logged-in HR user's ID
        };
        $.ajax({
            url: 'http://localhost:3000/api/employees',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(employee),
            success: function() {
                $('#addEmployeeModal').modal('hide');
                fetchEmployees();
                $('#addEmployeeForm')[0].reset();
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.error || 'Failed to add employee');
            }
        });
    });

    // Delete Employee
    $('#employeeTableBody').on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this employee?')) {
            $.ajax({
                url: 'http://localhost:3000/api/employees/' + id,
                method: 'DELETE',
                success: function() {
                    fetchEmployees();
                },
                error: function(xhr) {
                    alert(xhr.responseJSON?.error || 'Failed to delete employee');
                }
            });
        }
    });
});

function fetchEmployees() {
    $.get('http://localhost:3000/api/employees', function(data) {
        const tbody = $('#employeeTableBody');
        tbody.empty();
        data.forEach(emp => {
            tbody.append(`
                <tr>
                    <td>${emp.employeeid}</td>
                    <td>${emp.department}</td>
                    <td>${emp.position}</td>
                    <td>${emp.hiredate ? emp.hiredate.split('T')[0] : ''}</td>
                    <td>${emp.salary}</td>
                    <td>${emp.status}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${emp.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    });
} 