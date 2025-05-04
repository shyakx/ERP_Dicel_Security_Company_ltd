document.addEventListener('DOMContentLoaded', () => {
    // Load incidents and guards when page loads
    loadIncidents();
    loadGuards();

    // Add event listeners
    document.getElementById('saveIncidentBtn').addEventListener('click', addIncident);
    document.getElementById('updateIncidentBtn').addEventListener('click', updateIncident);
});

// Load all incidents
async function loadIncidents() {
    try {
        const response = await fetch('/api/security/incidents');
        if (!response.ok) {
            throw new Error('Failed to fetch incidents');
        }
        const incidents = await response.json();
        displayIncidents(incidents);
    } catch (error) {
        console.error('Error loading incidents:', error);
        alert('Failed to load incidents. Please try again.');
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
        populateGuardDropdown(guards);
    } catch (error) {
        console.error('Error loading guards:', error);
        alert('Failed to load guards. Please try again.');
    }
}

// Populate guard dropdown
function populateGuardDropdown(guards) {
    const reportedBySelect = document.getElementById('reportedBy');

    // Clear existing options
    reportedBySelect.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a guard';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    reportedBySelect.appendChild(defaultOption);

    // Add guard options
    guards.forEach(guard => {
        const option = document.createElement('option');
        option.value = guard.id;
        option.textContent = `${guard.guardid} - ${guard.firstname} ${guard.lastname}`;
        reportedBySelect.appendChild(option);
    });
}

// Display incidents in the table
function displayIncidents(incidents) {
    const tbody = document.querySelector('#incidentsTable tbody');
    tbody.innerHTML = '';

    incidents.forEach(incident => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateTime(incident.date)}</td>
            <td>${incident.type}</td>
            <td>${incident.location}</td>
            <td>${incident.description}</td>
            <td>${incident.reportedBy}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(incident.status)}">
                    ${incident.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editIncident(${incident.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteIncident(${incident.id})">
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
        case 'Pending':
            return 'bg-warning';
        case 'Under Investigation':
            return 'bg-info';
        case 'Resolved':
            return 'bg-success';
        case 'Closed':
            return 'bg-secondary';
        default:
            return 'bg-primary';
    }
}

// Add new incident
async function addIncident() {
    const form = document.getElementById('addIncidentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const incidentData = {
        type: document.getElementById('type').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        reportedBy: document.getElementById('reportedBy').value
    };

    try {
        const response = await fetch('/api/security/incidents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incidentData)
        });

        if (!response.ok) {
            throw new Error('Failed to add incident');
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('addIncidentModal'));
        modal.hide();
        form.reset();
        loadIncidents();
    } catch (error) {
        console.error('Error adding incident:', error);
        alert('Failed to add incident. Please try again.');
    }
}

// Edit incident
async function editIncident(id) {
    try {
        const response = await fetch(`/api/security/incidents/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch incident details');
        }
        const incident = await response.json();

        // Populate form
        document.getElementById('editIncidentId').value = incident.id;
        document.getElementById('editType').value = incident.type;
        document.getElementById('editLocation').value = incident.location;
        document.getElementById('editDescription').value = incident.description;
        document.getElementById('editStatus').value = incident.status;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editIncidentModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading incident details:', error);
        alert('Failed to load incident details. Please try again.');
    }
}

// Update incident
async function updateIncident() {
    const form = document.getElementById('editIncidentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('editIncidentId').value;
    const incidentData = {
        type: document.getElementById('editType').value,
        location: document.getElementById('editLocation').value,
        description: document.getElementById('editDescription').value,
        status: document.getElementById('editStatus').value
    };

    try {
        const response = await fetch(`/api/security/incidents/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incidentData)
        });

        if (!response.ok) {
            throw new Error('Failed to update incident');
        }

        // Close modal and refresh table
        const modal = bootstrap.Modal.getInstance(document.getElementById('editIncidentModal'));
        modal.hide();
        form.reset();
        loadIncidents();
    } catch (error) {
        console.error('Error updating incident:', error);
        alert('Failed to update incident. Please try again.');
    }
}

// Delete incident
async function deleteIncident(id) {
    if (!confirm('Are you sure you want to delete this incident?')) {
        return;
    }

    try {
        const response = await fetch(`/api/security/incidents/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete incident');
        }

        loadIncidents();
    } catch (error) {
        console.error('Error deleting incident:', error);
        alert('Failed to delete incident. Please try again.');
    }
} 