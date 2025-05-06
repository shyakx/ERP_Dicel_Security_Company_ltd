// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load all dashboard data
    loadDashboardData();
});

const API_BASE = 'http://localhost:3000';

// Function to load all dashboard data
async function loadDashboardData() {
    try {
        // Load security statistics
        const stats = await fetch(API_BASE + '/api/security/statistics').then(res => res.json());
        updateSecurityStats(stats);

        // Load recent incidents
        const recentIncidents = await fetch(API_BASE + '/api/security/recent-incidents').then(res => res.json());
        updateRecentIncidents(recentIncidents);

        // Load current shifts
        const currentShifts = await fetch(API_BASE + '/api/security/current-shifts').then(res => res.json());
        updateCurrentShifts(currentShifts);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data');
    }
}

// Function to update security statistics
function updateSecurityStats(stats) {
    document.getElementById('totalGuards').textContent = stats.totalGuards;
    document.getElementById('onDutyGuards').textContent = stats.onDutyGuards;
    document.getElementById('pendingIncidents').textContent = stats.pendingIncidents;
    document.getElementById('todayShifts').textContent = stats.todayShifts;
}

// Function to update recent incidents table
function updateRecentIncidents(incidents) {
    const tbody = document.getElementById('recentIncidents');
    tbody.innerHTML = '';

    incidents.forEach(incident => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(incident.date).toLocaleDateString()}</td>
            <td>${incident.type}</td>
            <td>${incident.location}</td>
            <td>
                <span class="badge badge-${getIncidentStatusBadgeClass(incident.status)}">
                    ${incident.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to update current shifts table
function updateCurrentShifts(shifts) {
    const tbody = document.getElementById('currentShifts');
    tbody.innerHTML = '';

    shifts.forEach(shift => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${shift.guardName}</td>
            <td>${shift.location}</td>
            <td>${new Date(shift.startTime).toLocaleTimeString()}</td>
            <td>${new Date(shift.endTime).toLocaleTimeString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to get badge class for incident status
function getIncidentStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'resolved':
            return 'success';
        case 'critical':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Function to handle quick action buttons
document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.dataset.action;
        switch (action) {
            case 'manage-guards':
                window.location.href = 'guards.html';
                break;
            case 'manage-shifts':
                window.location.href = 'shifts.html';
                break;
            case 'guard-attendance':
                window.location.href = 'attendance.html';
                break;
            case 'incident-reports':
                window.location.href = 'incident-reports.html';
                break;
        }
    });
}); 