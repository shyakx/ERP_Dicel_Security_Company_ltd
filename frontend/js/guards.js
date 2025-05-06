document.addEventListener('DOMContentLoaded', () => {
    // Load guards when page loads
    loadGuards();

    // Add event listeners
    document.getElementById('saveGuardBtn').addEventListener('click', addGuard);
    document.getElementById('updateGuardBtn').addEventListener('click', updateGuard);
});

const API_BASE = 'http://localhost:3000';

// Load all guards
async function loadGuards() {
    try {
        const response = await fetch(API_BASE + '/api/security/guards');
        if (!response.ok) {
            throw new Error('Failed to fetch guards');
        }
        const guards = await response.json();
        displayGuards(guards);
    } catch (error) {
        console.error('Error loading guards:', error);
        alert('Failed to load guards. Please try again.');
    }
}

// Display guards in the table
function displayGuards(guards) {
    const tbody = document.querySelector('#guardsTable tbody');
    tbody.innerHTML = '';

    guards.forEach(guard => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${guard.guardid}</td>
            <td>${guard.firstname} ${guard.lastname}</td>
            <td>${guard.email}</td>
            <td>${guard.phone}</td>
            <td>${guard.rank}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(guard.status)}">
                    ${guard.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editGuard(${guard.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteGuard(${guard.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Get badge class based on status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active':
            return 'bg-success';
        case 'Inactive':
            return 'bg-danger';
        case 'On Leave':
            return 'bg-warning';
        default:
            return 'bg-secondary';
    }
}

// Add new guard
async function addGuard() {
    const form = document.getElementById('addGuardForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const guardData = {
        guardId: document.getElementById('guardId').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        rank: document.getElementById('rank').value
    };

    try {
        const response = await fetch(API_BASE + '/api/security/guards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guardData)
        });

        if (!response.ok) {
            throw new Error('Failed to add guard');
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGuardModal'));
        modal.hide();
        form.reset();
        loadGuards();
    } catch (error) {
        console.error('Error adding guard:', error);
        alert('Failed to add guard. Please try again.');
    }
}

// Edit guard
async function editGuard(id) {
    try {
        const response = await fetch(API_BASE + `/api/security/guards/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch guard details');
        }
        const guard = await response.json();

        // Populate form
        document.getElementById('editGuardId').value = guard.id;
        document.getElementById('editGuardIdField').value = guard.guardid;
        document.getElementById('editFirstName').value = guard.firstname;
        document.getElementById('editLastName').value = guard.lastname;
        document.getElementById('editEmail').value = guard.email;
        document.getElementById('editPhone').value = guard.phone;
        document.getElementById('editRank').value = guard.rank;
        document.getElementById('editStatus').value = guard.status;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editGuardModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading guard details:', error);
        alert('Failed to load guard details. Please try again.');
    }
}

// Update guard
async function updateGuard() {
    const form = document.getElementById('editGuardForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('editGuardId').value;
    const guardData = {
        guardId: document.getElementById('editGuardIdField').value,
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        rank: document.getElementById('editRank').value,
        status: document.getElementById('editStatus').value
    };

    try {
        const response = await fetch(API_BASE + `/api/security/guards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guardData)
        });

        if (!response.ok) {
            throw new Error('Failed to update guard');
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGuardModal'));
        modal.hide();
        form.reset();
        loadGuards();
    } catch (error) {
        console.error('Error updating guard:', error);
        alert('Failed to update guard. Please try again.');
    }
}

// Delete guard
async function deleteGuard(id) {
    if (!confirm('Are you sure you want to delete this guard?')) {
        return;
    }

    try {
        const response = await fetch(API_BASE + `/api/security/guards/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete guard');
        }

        loadGuards();
    } catch (error) {
        console.error('Error deleting guard:', error);
        alert('Failed to delete guard. Please try again.');
    }
} 