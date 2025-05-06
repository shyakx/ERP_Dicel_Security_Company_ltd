$(document).ready(function() {
    fetchPayroll();

    // Add Payroll
    $('#addPayrollForm').on('submit', function(e) {
        e.preventDefault();
        const payroll = {
            employeeId: $('#employeeId').val(),
            baseSalary: $('#baseSalary').val(),
            allowances: $('#allowances').val(),
            deductions: $('#deductions').val(),
            paymentDate: $('#paymentDate').val(),
            status: $('#status').val()
        };
        $.ajax({
            url: 'http://localhost:3000/api/payroll',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payroll),
            success: function() {
                $('#addPayrollModal').modal('hide');
                fetchPayroll();
                $('#addPayrollForm')[0].reset();
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.error || 'Failed to add payroll record');
            }
        });
    });

    // Delete Payroll
    $('#payrollTableBody').on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this payroll record?')) {
            $.ajax({
                url: 'http://localhost:3000/api/payroll/' + id,
                method: 'DELETE',
                success: function() {
                    fetchPayroll();
                },
                error: function(xhr) {
                    alert(xhr.responseJSON?.error || 'Failed to delete payroll record');
                }
            });
        }
    });
});

function fetchPayroll() {
    $.get('http://localhost:3000/api/payroll', function(data) {
        const tbody = $('#payrollTableBody');
        tbody.empty();
        let totalPayroll = 0, totalSalary = 0, totalDeductions = 0, totalNet = 0;
        data.forEach(pay => {
            totalPayroll += pay.baseSalary + pay.allowances;
            totalSalary += pay.baseSalary;
            totalDeductions += pay.deductions;
            totalNet += pay.netSalary;
            tbody.append(`
                <tr>
                    <td>${pay.employeeId}</td>
                    <td>${pay.department || ''}</td>
                    <td>${pay.position || ''}</td>
                    <td>${pay.baseSalary}</td>
                    <td>${pay.allowances}</td>
                    <td>${pay.deductions}</td>
                    <td>${pay.netSalary}</td>
                    <td>${pay.paymentDate ? pay.paymentDate.split('T')[0] : ''}</td>
                    <td>${pay.status}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${pay.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
        $('#totalPayroll').text('RWF ' + totalPayroll);
        $('#averageSalary').text('RWF ' + (data.length ? (totalSalary / data.length).toFixed(2) : 0));
        $('#taxDeductions').text('RWF ' + totalDeductions);
        $('#netPay').text('RWF ' + totalNet);
    });
} 