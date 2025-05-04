document.addEventListener('DOMContentLoaded', () => {
    // Load shifts and guards when page loads
    loadShifts();
    loadGuards();

    // Add event listeners
    document.getElementById('saveShiftBtn').addEventListener('click', addShift);
    document.getElementById('updateShiftBtn').addEventListener('click', updateShift);
});

// Load all shifts
async function loadShifts() {
    try {
        const response = await fetch('/api/security/shifts');
        if (!response.ok) {
            throw new Error('Failed to fetch shifts');
        }
        const shifts = await response.json();
        displayShifts(shifts);
    } catch (error) {
        console.error('Error loading shifts:', error);
        alert('Failed to load shifts. Please try again.');
    }
}

// Load all guards for dropdowns
async function loadGuards() {
    try {
        const response = await fetch('/api/security/guards');
        if (!response.ok) {
            throw new Error('Failed to fetch guards');
        }
        const guards = await response.json();
        populateGuardDropdowns(guards);
    } catch (error) {
        console.error('Error loading guards:', error);
        alert('Failed to load guards. Please try again.');
    }
}

// Populate guard dropdowns
function populateGuardDropdowns(guards) {
    const addGuardSelect = document.getElementById('guardId');
    const editGuardSelect = document.getElementById('editGuardId');

    // Clear existing options
    addGuardSelect.innerHTML = '';
    editGuardSelect.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a guard';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    addGuardSelect.appendChild(defaultOption.cloneNode(true));
    editGuardSelect.appendChild(defaultOption.cloneNode(true));

    // Add guard options
    guards.forEach(guard => {
        const option = document.createElement('option');
        option.value = guard.id;
        option.textContent = `${guard.guardid} - ${guard.firstname} ${guard.lastname}`;
        addGuardSelect.appendChild(option.cloneNode(true));
        editGuardSelect.appendChild(option.cloneNode(true));
    });
}

// Display shifts in the table
function displayShifts(shifts) {
    const tbody = document.querySelector('#shiftsTable tbody');
    tbody.innerHTML = '';

    shifts.forEach(shift => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${shift.guardName}</td>
            <td>${shift.location}</td>
            <td>${formatDateTime(shift.startTime)}</td>
            <td>${formatDateTime(shift.endTime)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(shift.status)}">
                    ${shift.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editShift(${shift.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteShift(${shift.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Format date and time
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

// Get badge class based on status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Scheduled':
            return 'bg-primary';
        case 'In Progress':
            return 'bg-warning';
        case 'Completed':
            return 'bg-success';
        case 'Cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Add new shift
async function addShift() {
    const form = document.getElementById('addShiftForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const shiftData = {
        guardId: document.getElementById('guardId').value,
        location: document.getElementById('location').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value
    };

    try {
        const response = await fetch('/api/security/shifts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shiftData)
        });

        if (!response.ok) {
            throw new Error('Failed to add shift');
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('addShiftModal'));
        modal.hide();
        form.reset();
        loadShifts();
    } catch (error) {
        console.error('Error adding shift:', error);
        alert('Failed to add shift. Please try again.');
    }
}

// Edit shift
async function editShift(id) {
    try {
        const response = await fetch(`/api/security/shifts/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch shift details');
        }
        const shift = await response.json();

        // Populate form
        document.getElementById('editShiftId').value = shift.id;
        document.getElementById('editGuardId').value = shift.guardid;
        document.getElementById('editLocation').value = shift.location;
        document.getElementById('editStartTime').value = formatDateTimeForInput(shift.startTime);
        document.getElementById('editEndTime').value = formatDateTimeForInput(shift.endTime);
        document.getElementById('editStatus').value = shift.status;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editShiftModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading shift details:', error);
        alert('Failed to load shift details. Please try again.');
    }
}

// Format date and time for input field
function formatDateTimeForInput(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
}

// Update shift
async function updateShift() {
    const form = document.getElementById('editShiftForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('editShiftId').value;
    const shiftData = {
        guardId: document.getElementById('editGuardId').value,
        location: document.getElementById('editLocation').value,
        startTime: document.getElementById('editStartTime').value,
        endTime: document.getElementById('editEndTime').value,
        status: document.getElementById('editStatus').value
    };

    try {
        const response = await fetch(`/api/security/shifts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shiftData)
        });

        if (!response.ok) {
            throw new Error('Failed to update shift');
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('editShiftModal'));
        modal.hide();
        form.reset();
        loadShifts();
    } catch (error) {
        console.error('Error updating shift:', error);
        alert('Failed to update shift. Please try again.');
    }
}

// Delete shift
async function deleteShift(id) {
    if (!confirm('Are you sure you want to delete this shift?')) {
        return;
    }

    try {
        const response = await fetch(`/api/security/shifts/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete shift');
        }

        loadShifts();
    } catch (error) {
        console.error('Error deleting shift:', error);
        alert('Failed to delete shift. Please try again.');
    }
} 