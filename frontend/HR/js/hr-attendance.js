$(document).ready(function() {
    fetchAttendance();

    // Add Attendance
    $('#addAttendanceForm').on('submit', function(e) {
        e.preventDefault();
        const attendance = {
            employeeId: $('#employeeId').val(),
            date: $('#date').val(),
            status: $('#status').val()
        };
        $.ajax({
            url: '/api/attendance',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(attendance),
            success: function() {
                $('#addAttendanceModal').modal('hide');
                fetchAttendance();
                $('#addAttendanceForm')[0].reset();
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.error || 'Failed to mark attendance');
            }
        });
    });

    // Delete Attendance
    $('#attendanceTableBody').on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this attendance record?')) {
            $.ajax({
                url: '/api/attendance/' + id,
                method: 'DELETE',
                success: function() {
                    fetchAttendance();
                },
                error: function(xhr) {
                    alert(xhr.responseJSON?.error || 'Failed to delete attendance record');
                }
            });
        }
    });
});

function fetchAttendance() {
    $.get('/api/attendance', function(data) {
        const tbody = $('#attendanceTableBody');
        tbody.empty();
        data.forEach(att => {
            tbody.append(`
                <tr>
                    <td>${att.employeeId}</td>
                    <td>${att.date ? att.date.split('T')[0] : ''}</td>
                    <td>${att.status}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${att.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    });
} 