// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load payroll data when the page loads
    loadPayrollData();

    // Add event listener for generate payroll button
    document.getElementById('generatePayroll').addEventListener('click', generatePayroll);

    // Add event listener for add payment button
    document.getElementById('addPaymentBtn').addEventListener('click', showAddPaymentModal);
});

// Function to load payroll data
async function loadPayrollData() {
    try {
        const response = await fetch('/api/admin/payroll');
        if (!response.ok) {
            throw new Error('Failed to load payment details');
        }
        const data = await response.json();
        updatePayrollTable(data);
        updatePayrollSummary(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load payment details');
    }
}

// Function to update payroll table
function updatePayrollTable(data) {
    const tableBody = document.getElementById('payrollTableBody');
    tableBody.innerHTML = '';

    data.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.employeeId}</td>
            <td>${payment.name || '-'}</td>
            <td>${payment.position}</td>
            <td>RWF ${payment.baseSalary}</td>
            <td>RWF ${payment.allowances}</td>
            <td>RWF ${payment.deductions}</td>
            <td>RWF ${payment.netSalary}</td>
            <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
            <td><span class="badge badge-${getStatusBadgeClass(payment.status)}">${payment.status}</span></td>
            <td>
                <button class="btn btn-info btn-sm edit-btn" onclick="editPayment('${payment.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-btn" onclick="deletePayment('${payment.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to update payroll summary
function updatePayrollSummary(data) {
    const totalPayroll = data.reduce((sum, payment) => sum + payment.netSalary, 0);
    const paidEmployees = data.filter(payment => payment.status === 'Paid').length;
    const pendingPayments = data.filter(payment => payment.status === 'Pending').length;
    const averageSalary = data.length > 0 ? totalPayroll / data.length : 0;

    document.getElementById('totalPayroll').textContent = `RWF ${totalPayroll.toFixed(2)}`;
    document.getElementById('paidEmployees').textContent = paidEmployees;
    document.getElementById('pendingPayments').textContent = pendingPayments;
    document.getElementById('averageSalary').textContent = `RWF ${averageSalary.toFixed(2)}`;
}

// Function to get badge class based on status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'success';
        case 'pending':
            return 'warning';
        case 'failed':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Function to generate payroll
async function generatePayroll() {
    try {
        const response = await fetch('/api/admin/payroll/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate payroll');
        }

        const result = await response.json();
        alert(result.message);
        loadPayrollData(); // Reload the table
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate payroll');
    }
}

// Function to edit payment
async function editPayment(paymentId) {
    try {
        // First, fetch the payment details
        const response = await fetch(`/api/admin/payroll/${paymentId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch payment details');
        }
        const payment = await response.json();

        // Create and show the edit modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'editPaymentModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Payment</h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editPaymentForm">
                            <div class="form-group">
                                <label>Base Salary</label>
                                <input type="number" class="form-control" id="editBaseSalary" value="${payment.baseSalary}" required>
                            </div>
                            <div class="form-group">
                                <label>Allowances</label>
                                <input type="number" class="form-control" id="editAllowances" value="${payment.allowances}" required>
                            </div>
                            <div class="form-group">
                                <label>Deductions</label>
                                <input type="number" class="form-control" id="editDeductions" value="${payment.deductions}" required>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select class="form-control" id="editStatus" required>
                                    <option value="Pending" ${payment.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Paid" ${payment.status === 'Paid' ? 'selected' : ''}>Paid</option>
                                    <option value="Failed" ${payment.status === 'Failed' ? 'selected' : ''}>Failed</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="savePaymentChanges('${paymentId}')">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.appendChild(modal);

        // Initialize and show the modal
        $('#editPaymentModal').modal('show');

        // Remove modal from DOM when hidden
        $('#editPaymentModal').on('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load payment details');
    }
}

// Function to save payment changes
async function savePaymentChanges(paymentId) {
    try {
        const baseSalary = document.getElementById('editBaseSalary').value;
        const allowances = document.getElementById('editAllowances').value;
        const deductions = document.getElementById('editDeductions').value;
        const status = document.getElementById('editStatus').value;

        const response = await fetch(`/api/admin/payroll/${paymentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                baseSalary: parseFloat(baseSalary),
                allowances: parseFloat(allowances),
                deductions: parseFloat(deductions),
                status
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update payment');
        }

        // Hide modal
        $('#editPaymentModal').modal('hide');

        // Reload payroll data
        loadPayrollData();

        alert('Payment updated successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update payment');
    }
}

// Function to delete payment
async function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/payroll/${paymentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete payment');
        }

        loadPayrollData(); // Reload the table
        alert('Payment deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete payment');
    }
} 