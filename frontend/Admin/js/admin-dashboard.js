// Global variables
let userData = null;
let revenueChart = null;
let contractsChart = null;
let attendanceChart = null;
let equipmentChart = null;

// Initialize the page
$(document).ready(function() {
    checkAuth();
    initializeCharts();
    loadDashboardData();
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
            } else {
                userData = response.user;
                updateProfileInfo();
            }
        },
        error: function() {
            window.location.href = '/login.html';
        }
    });
}

// Initialize charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                lineTension: 0.3,
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderColor: 'rgba(78, 115, 223, 1)',
                pointRadius: 3,
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: 'rgba(78, 115, 223, 1)',
                pointHoverRadius: 3,
                pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: []
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        callback: function(value) {
                            return 'RWF ' + value.toLocaleString();
                        }
                    },
                    gridLines: {
                        color: 'rgb(234, 236, 244)',
                        zeroLineColor: 'rgb(234, 236, 244)',
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: 'rgb(255,255,255)',
                bodyFontColor: '#858796',
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem) {
                        return 'Revenue: RWF ' + tooltipItem.yLabel.toLocaleString();
                    }
                }
            }
        }
    });

    // Contracts Chart
    const contractsCtx = document.getElementById('contractsChart').getContext('2d');
    contractsChart = new Chart(contractsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Security', 'Maintenance', 'Training', 'Consulting'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
                hoverBorderColor: 'rgba(234, 236, 244, 1)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: 'rgb(255,255,255)',
                bodyFontColor: '#858796',
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10
            },
            legend: {
                display: true,
                position: 'bottom'
            },
            cutoutPercentage: 80
        }
    });

    // Attendance Chart
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    attendanceChart = new Chart(attendanceCtx, {
        type: 'bar',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#1cc88a', '#e74a3b'],
                hoverBackgroundColor: ['#17a673', '#d52a1a'],
                hoverBorderColor: 'rgba(234, 236, 244, 1)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            }
        }
    });

    // Equipment Chart
    const equipmentCtx = document.getElementById('equipmentChart').getContext('2d');
    equipmentChart = new Chart(equipmentCtx, {
        type: 'bar',
        data: {
            labels: ['Assigned', 'Available'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#36b9cc', '#f6c23e'],
                hoverBackgroundColor: ['#2c9faf', '#dda20a'],
                hoverBorderColor: 'rgba(234, 236, 244, 1)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            }
        }
    });
}

// Load dashboard data
function loadDashboardData() {
    UiUtils.showLoading();
    
    // Load summary data
    $.ajax({
        url: '/api/dashboard/summary',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            updateSummaryCards(response);
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading summary data: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        }
    });

    // Load revenue data
    $.ajax({
        url: '/api/dashboard/revenue',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            updateRevenueChart(response);
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading revenue data: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        }
    });

    // Load contracts data
    $.ajax({
        url: '/api/dashboard/contracts',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            updateContractsChart(response);
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading contracts data: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        }
    });

    // Load attendance data
    $.ajax({
        url: '/api/dashboard/attendance',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            updateAttendanceChart(response);
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading attendance data: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        }
    });

    // Load equipment data
    $.ajax({
        url: '/api/dashboard/equipment',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            updateEquipmentChart(response);
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading equipment data: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        },
        complete: function() {
            UiUtils.hideLoading();
        }
    });
}

// Update summary cards
function updateSummaryCards(data) {
    $('#totalEmployees').text(data.total_employees);
    $('#monthlyRevenue').text(UiUtils.formatCurrency(data.monthly_revenue));
    $('#activeContracts').text(data.active_contracts);
    
    const progress = data.tasks_progress;
    $('#tasksProgress').text(progress + '%');
    $('#tasksProgressBar').css('width', progress + '%').attr('aria-valuenow', progress);
}

// Update revenue chart
function updateRevenueChart(data) {
    revenueChart.data.labels = data.labels;
    revenueChart.data.datasets[0].data = data.values;
    revenueChart.update();
}

// Update contracts chart
function updateContractsChart(data) {
    contractsChart.data.datasets[0].data = [
        data.security_contracts,
        data.maintenance_contracts,
        data.training_contracts,
        data.consulting_contracts
    ];
    contractsChart.update();
}

// Update attendance chart
function updateAttendanceChart(data) {
    attendanceChart.data.datasets[0].data = [data.present, data.absent];
    attendanceChart.update();
    $('#presentCount').text(data.present);
    $('#absentCount').text(data.absent);
}

// Update equipment chart
function updateEquipmentChart(data) {
    equipmentChart.data.datasets[0].data = [data.assigned, data.available];
    equipmentChart.update();
    $('#assignedEquipment').text(data.assigned);
    $('#availableEquipment').text(data.available);
}

// Setup event listeners
function setupEventListeners() {
    // Generate report button
    $('.btn-primary.shadow-sm').click(function(e) {
        e.preventDefault();
        window.location.href = 'reports.html';
    });

    // Profile dropdown
    $('#userDropdown').click(function(e) {
        e.preventDefault();
        $('.dropdown-menu').toggleClass('show');
    });

    // Profile menu items
    $('.dropdown-menu .dropdown-item').click(function(e) {
        e.preventDefault();
        const action = $(this).find('i').attr('class');
        
        if (action.includes('fa-user')) {
            showProfileModal();
        } else if (action.includes('fa-cogs')) {
            window.location.href = 'settings.html';
        } else if (action.includes('fa-sign-out-alt')) {
            $('#logoutModal').modal('show');
        }
    });

    // Logout confirmation
    $('#logoutModal .btn-primary').click(function() {
        AuthUtils.logout();
        window.location.href = '/login.html';
    });
}

// Show profile modal
function showProfileModal() {
    const modalHtml = `
        <div class="modal fade" id="profileModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Profile</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="profileForm">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" class="form-control" id="profileName" value="${userData.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="form-control" id="profileEmail" value="${userData.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" class="form-control" id="profilePhone" value="${userData.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label>Profile Picture</label>
                                <div class="custom-file">
                                    <input type="file" class="custom-file-input" id="profilePicture" accept="image/*">
                                    <label class="custom-file-label" for="profilePicture">Choose file</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Current Password</label>
                                <input type="password" class="form-control" id="currentPassword">
                            </div>
                            <div class="form-group">
                                <label>New Password</label>
                                <input type="password" class="form-control" id="newPassword">
                            </div>
                            <div class="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" class="form-control" id="confirmPassword">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveProfile">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('body').append(modalHtml);
    const $modal = $('#profileModal');
    
    $modal.modal('show');

    // Handle file input change
    $('#profilePicture').change(function() {
        const file = this.files[0];
        $(this).next('.custom-file-label').html(file ? file.name : 'Choose file');
    });

    // Handle form submission
    $('#saveProfile').click(function() {
        const formData = new FormData();
        formData.append('name', $('#profileName').val());
        formData.append('email', $('#profileEmail').val());
        formData.append('phone', $('#profilePhone').val());

        const profilePicture = $('#profilePicture')[0].files[0];
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }

        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        if (newPassword) {
            if (!currentPassword) {
                UiUtils.showNotification('Please enter your current password', 'warning');
                return;
            }
            if (newPassword !== confirmPassword) {
                UiUtils.showNotification('New passwords do not match', 'warning');
                return;
            }
            formData.append('current_password', currentPassword);
            formData.append('new_password', newPassword);
        }

        UiUtils.showLoading();

        $.ajax({
            url: '/api/profile/update',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: AuthUtils.getAuthHeaders(),
            success: function(response) {
                userData = response.user;
                updateProfileInfo();
                $modal.modal('hide');
                UiUtils.showNotification('Profile updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating profile: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Clean up modal on hide
    $modal.on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// Update profile info in the UI
function updateProfileInfo() {
    if (userData) {
        $('.user-name').text(userData.name);
        $('.user-email').text(userData.email);
        if (userData.profile_picture) {
            $('.img-profile').attr('src', userData.profile_picture);
        }
    }
} 