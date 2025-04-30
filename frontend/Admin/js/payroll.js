// API Base URL - Change this to match your backend server
const API_BASE_URL = 'http://localhost:5000/api';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing payroll management...');
    
    // Load payroll data when the page loads
    loadPayrollData();

    // Add event listener for generate payroll button
    document.getElementById('generatePayroll').addEventListener('click', generatePayroll);

    // Add event listener for add payment button
    document.getElementById('addPaymentBtn').addEventListener('click', showAddPaymentModal);

    // Add event listener for add payment form submission
    document.getElementById('addPaymentForm').addEventListener('submit', handleAddPayment);

    // Add event listener for edit payment form submission
    document.getElementById('editPaymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const paymentId = document.getElementById('editPaymentId').value;
        console.log('Edit form submitted for payment ID:', paymentId);
        savePaymentChanges(paymentId);
    });

    // Initialize Bootstrap modals
    try {
        console.log('Initializing Bootstrap modals...');
        $('#editPaymentModal').modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });
    } catch (error) {
        console.error('Error initializing modals:', error);
    }
});

// Function to load payroll data
async function loadPayrollData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/payroll`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load payment details');
        }
        const data = await response.json();
        updatePayrollTable(data);
        updatePayrollSummary(data);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Function to show add payment modal
function showAddPaymentModal() {
    // Load employees for the select dropdown
    loadEmployees();
    $('#addPaymentModal').modal('show');
}

// Function to load employees for the select dropdown
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load employees');
        }
        const employees = await response.json();
        
        const select = document.getElementById('employeeSelect');
        select.innerHTML = '<option value="">Select Employee</option>';
        
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.employeeid} - ${employee.name || 'Unknown'}`;
            option.dataset.salary = employee.salary;
            select.appendChild(option);
        });

        // Add change event listener to update base salary when employee is selected
        select.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const baseSalaryInput = document.getElementById('baseSalary');
            baseSalaryInput.value = selectedOption.dataset.salary || '';
        });
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Function to handle add payment form submission
async function handleAddPayment(event) {
    event.preventDefault();
    
    try {
        const employeeId = document.getElementById('employeeSelect').value;
        const baseSalary = document.getElementById('baseSalary').value;
        const allowances = document.getElementById('allowances').value;
        const deductions = document.getElementById('deductions').value;
        const paymentDate = document.getElementById('paymentDate').value;
        const status = document.getElementById('paymentStatus').value;

        const response = await fetch(`${API_BASE_URL}/admin/payroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeId,
                baseSalary: parseFloat(baseSalary),
                allowances: parseFloat(allowances),
                deductions: parseFloat(deductions),
                paymentDate,
                status
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add payment');
        }

        // Hide modal and reset form
        $('#addPaymentModal').modal('hide');
        document.getElementById('addPaymentForm').reset();

        // Reload payroll data
        loadPayrollData();
        alert('Payment added successfully');
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
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
            <td>RWF ${payment.baseSalary.toFixed(2)}</td>
            <td>RWF ${payment.allowances.toFixed(2)}</td>
            <td>RWF ${payment.deductions.toFixed(2)}</td>
            <td>RWF ${payment.netSalary.toFixed(2)}</td>
            <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
            <td><span class="badge badge-${getStatusBadgeClass(payment.status)}">${payment.status}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-info btn-sm" onclick="editPayment('${payment.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
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
        const response = await fetch(`${API_BASE_URL}/admin/payroll/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to generate payroll');
        }

        const result = await response.json();
        alert(result.message);
        loadPayrollData(); // Reload the table
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Function to edit payment
async function editPayment(paymentId) {
    console.log('Edit button clicked for payment ID:', paymentId);
    try {
        // First, fetch the payment details
        console.log('Fetching payment details from:', `${API_BASE_URL}/admin/payroll/${paymentId}`);
        const response = await fetch(`${API_BASE_URL}/admin/payroll/${paymentId}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            try {
                const error = JSON.parse(errorText);
                throw new Error(error.message || 'Failed to fetch payment details');
            } catch (e) {
                throw new Error('Failed to fetch payment details: ' + errorText);
            }
        }

        const payment = await response.json();
        console.log('Received payment details:', payment);

        // Update the existing modal with the payment details
        document.getElementById('editPaymentId').value = payment.id;
        document.getElementById('editEmployeeId').value = payment.employeeId;
        document.getElementById('editBaseSalary').value = payment.baseSalary;
        document.getElementById('editAllowances').value = payment.allowances;
        document.getElementById('editDeductions').value = payment.deductions;
        document.getElementById('editPaymentDate').value = payment.paymentDate.split('T')[0];
        document.getElementById('editStatus').value = payment.status;

        console.log('Opening edit modal...');
        // Show the modal using Bootstrap's modal method
        $('#editPaymentModal').modal('show');
    } catch (error) {
        console.error('Error in editPayment:', error);
        alert(error.message);
    }
}

// Function to save payment changes
async function savePaymentChanges(paymentId) {
    console.log('Saving changes for payment ID:', paymentId);
    try {
        const baseSalary = document.getElementById('editBaseSalary').value;
        const allowances = document.getElementById('editAllowances').value;
        const deductions = document.getElementById('editDeductions').value;
        const paymentDate = document.getElementById('editPaymentDate').value;
        const status = document.getElementById('editStatus').value;

        const data = {
            baseSalary: parseFloat(baseSalary),
            allowances: parseFloat(allowances),
            deductions: parseFloat(deductions),
            paymentDate,
            status
        };
        console.log('Sending update with data:', data);

        const response = await fetch(`${API_BASE_URL}/admin/payroll/${paymentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            try {
                const error = JSON.parse(errorText);
                throw new Error(error.message || 'Failed to update payment');
            } catch (e) {
                throw new Error('Failed to update payment: ' + errorText);
            }
        }

        console.log('Update successful, hiding modal...');
        // Hide modal using Bootstrap's modal method
        $('#editPaymentModal').modal('hide');

        // Reload payroll data
        await loadPayrollData();

        alert('Payment updated successfully');
    } catch (error) {
        console.error('Error in savePaymentChanges:', error);
        alert(error.message);
    }
}

// Function to delete payment
async function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/payroll/${paymentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete payment');
        }

        loadPayrollData(); // Reload the table
        alert('Payment deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
} 