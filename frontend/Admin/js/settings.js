// Global variables
let settings = {};

// Initialize the page
$(document).ready(function() {
    checkAuth();
    loadSettings();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    $.ajax({
        url: '/api/auth/check',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            if (!response.authenticated || response.role !== 'admin') {
                window.location.href = '/login.html';
            }
        },
        error: function() {
            window.location.href = '/login.html';
        }
    });
}

// Load settings
function loadSettings() {
    UiUtils.showLoading();
    $.ajax({
        url: '/api/settings',
        method: 'GET',
        headers: AuthUtils.getAuthHeaders(),
        success: function(response) {
            settings = response;
            updateForms();
        },
        error: function(xhr) {
            UiUtils.showNotification('Error loading settings: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
        },
        complete: function() {
            UiUtils.hideLoading();
        }
    });
}

// Update forms with loaded settings
function updateForms() {
    // Company Settings
    $('#companyName').val(settings.company?.name || '');
    $('#companyAddress').val(settings.company?.address || '');
    $('#companyPhone').val(settings.company?.phone || '');
    $('#companyEmail').val(settings.company?.email || '');

    // System Settings
    $('#timezone').val(settings.system?.timezone || 'Africa/Kigali');
    $('#dateFormat').val(settings.system?.dateFormat || 'DD/MM/YYYY');
    $('#currency').val(settings.system?.currency || 'RWF');
    $('#language').val(settings.system?.language || 'en');

    // Security Settings
    $('#passwordPolicy').val(settings.security?.passwordPolicy || 'standard');
    $('#sessionTimeout').val(settings.security?.sessionTimeout || 30);
    $('#twoFactorAuth').val(settings.security?.twoFactorAuth || 'disabled');
    $('#ipWhitelist').val(settings.security?.ipWhitelist?.join('\n') || '');

    // Backup Settings
    $('#backupFrequency').val(settings.backup?.frequency || 'daily');
    $('#backupTime').val(settings.backup?.time || '00:00');
    $('#retentionPeriod').val(settings.backup?.retentionPeriod || 30);
    $('#backupLocation').val(settings.backup?.location || '');
}

// Setup event listeners
function setupEventListeners() {
    // Company Settings Form
    $('#companySettingsForm').on('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', $('#companyName').val());
        formData.append('address', $('#companyAddress').val());
        formData.append('phone', $('#companyPhone').val());
        formData.append('email', $('#companyEmail').val());
        
        const logoFile = $('#companyLogo')[0].files[0];
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        UiUtils.showLoading();
        $.ajax({
            url: '/api/settings/company',
            method: 'PUT',
            headers: AuthUtils.getAuthHeaders(),
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                loadSettings();
                UiUtils.showNotification('Company settings updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating company settings: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // System Settings Form
    $('#systemSettingsForm').on('submit', function(e) {
        e.preventDefault();
        const systemSettings = {
            timezone: $('#timezone').val(),
            dateFormat: $('#dateFormat').val(),
            currency: $('#currency').val(),
            language: $('#language').val()
        };

        UiUtils.showLoading();
        $.ajax({
            url: '/api/settings/system',
            method: 'PUT',
            headers: AuthUtils.getAuthHeaders(),
            data: systemSettings,
            success: function() {
                loadSettings();
                UiUtils.showNotification('System settings updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating system settings: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Security Settings Form
    $('#securitySettingsForm').on('submit', function(e) {
        e.preventDefault();
        const securitySettings = {
            passwordPolicy: $('#passwordPolicy').val(),
            sessionTimeout: parseInt($('#sessionTimeout').val()),
            twoFactorAuth: $('#twoFactorAuth').val(),
            ipWhitelist: $('#ipWhitelist').val().split('\n').filter(ip => ip.trim())
        };

        UiUtils.showLoading();
        $.ajax({
            url: '/api/settings/security',
            method: 'PUT',
            headers: AuthUtils.getAuthHeaders(),
            data: securitySettings,
            success: function() {
                loadSettings();
                UiUtils.showNotification('Security settings updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating security settings: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Backup Settings Form
    $('#backupSettingsForm').on('submit', function(e) {
        e.preventDefault();
        const backupSettings = {
            frequency: $('#backupFrequency').val(),
            time: $('#backupTime').val(),
            retentionPeriod: parseInt($('#retentionPeriod').val()),
            location: $('#backupLocation').val()
        };

        UiUtils.showLoading();
        $.ajax({
            url: '/api/settings/backup',
            method: 'PUT',
            headers: AuthUtils.getAuthHeaders(),
            data: backupSettings,
            success: function() {
                loadSettings();
                UiUtils.showNotification('Backup settings updated successfully', 'success');
            },
            error: function(xhr) {
                UiUtils.showNotification('Error updating backup settings: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });

    // Backup Now Button
    $('#backupNow').on('click', function() {
        UiUtils.confirmDialog('Are you sure you want to create a backup now?')
            .then(confirmed => {
                if (confirmed) {
                    UiUtils.showLoading();
                    $.ajax({
                        url: '/api/settings/backup/now',
                        method: 'POST',
                        headers: AuthUtils.getAuthHeaders(),
                        success: function(response) {
                            const link = document.createElement('a');
                            link.href = response.download_url;
                            link.download = 'backup_' + new Date().toISOString().split('T')[0] + '.zip';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            UiUtils.showNotification('Backup created successfully', 'success');
                        },
                        error: function(xhr) {
                            UiUtils.showNotification('Error creating backup: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                        },
                        complete: function() {
                            UiUtils.hideLoading();
                        }
                    });
                }
            });
    });

    // Restore Backup Button
    $('#restoreBackup').on('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                UiUtils.confirmDialog('Are you sure you want to restore from this backup? This will overwrite current data.')
                    .then(confirmed => {
                        if (confirmed) {
        const formData = new FormData();
                            formData.append('backup', file);

                            UiUtils.showLoading();
                            $.ajax({
                                url: '/api/settings/backup/restore',
                method: 'POST',
                                headers: AuthUtils.getAuthHeaders(),
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function() {
                                    UiUtils.showNotification('Backup restored successfully', 'success');
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 2000);
                                },
                                error: function(xhr) {
                                    UiUtils.showNotification('Error restoring backup: ' + (xhr.responseJSON?.message || 'Unknown error'), 'danger');
                                },
                                complete: function() {
                                    UiUtils.hideLoading();
                                }
                            });
        }
    });
}
        };
        
        fileInput.click();
    });

    // Logout
    $('#logoutModal .btn-primary').on('click', function() {
        $.ajax({
            url: '/api/auth/logout',
            method: 'POST',
            headers: AuthUtils.getAuthHeaders(),
            success: function() {
                window.location.href = '/login.html';
            },
            error: function() {
                window.location.href = '/login.html';
            }
        });
    });
} 