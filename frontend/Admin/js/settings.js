document.addEventListener('DOMContentLoaded', function() {
    // Load all settings when the page loads
    loadAllSettings();

    // Set up form submit handlers
    setupFormHandlers();

    // Set up backup and restore handlers
    setupBackupRestore();
});

async function loadAllSettings() {
    try {
        // Load company settings
        const companySettings = await fetch('/api/settings/company').then(res => res.json());
        document.getElementById('companyName').value = companySettings.company_name || '';
        document.getElementById('registrationNumber').value = companySettings.registration_number || '';
        document.getElementById('companyEmail').value = companySettings.email || '';
        document.getElementById('companyPhone').value = companySettings.phone || '';
        document.getElementById('companyAddress').value = companySettings.address || '';
        
        if (companySettings.logo_url) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.innerHTML = `<img src="${companySettings.logo_url}" alt="Company Logo" style="max-width: 200px;">`;
        }

        // Load system preferences
        const preferences = await fetch('/api/settings/preferences').then(res => res.json());
        document.getElementById('defaultCurrency').value = preferences.default_currency || 'RWF';
        document.getElementById('dateFormat').value = preferences.date_format || 'YYYY-MM-DD';
        document.getElementById('timeZone').value = preferences.time_zone || 'Africa/Kigali';
        document.getElementById('enableNotifications').checked = preferences.enable_notifications || false;

        // Load email settings
        const emailSettings = await fetch('/api/settings/email').then(res => res.json());
        document.getElementById('smtpServer').value = emailSettings.smtp_server || '';
        document.getElementById('smtpPort').value = emailSettings.smtp_port || '';
        document.getElementById('smtpSecurity').value = emailSettings.smtp_security || 'none';
        document.getElementById('smtpUsername').value = emailSettings.smtp_username || '';
        document.getElementById('smtpPassword').value = emailSettings.smtp_password || '';
        document.getElementById('fromEmail').value = emailSettings.from_email || '';

    } catch (error) {
        showToast('Error loading settings', 'error');
        console.error('Error loading settings:', error);
    }
}

function setupFormHandlers() {
    // Company Settings Form
    document.getElementById('companyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('company_name', document.getElementById('companyName').value);
        formData.append('registration_number', document.getElementById('registrationNumber').value);
        formData.append('email', document.getElementById('companyEmail').value);
        formData.append('phone', document.getElementById('companyPhone').value);
        formData.append('address', document.getElementById('companyAddress').value);

        const logoFile = document.getElementById('companyLogo').files[0];
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        try {
            const response = await fetch('/api/settings/company', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                showToast('Company settings saved successfully', 'success');
                loadAllSettings(); // Reload settings to show updated values
            } else {
                throw new Error('Failed to save company settings');
            }
        } catch (error) {
            showToast('Error saving company settings', 'error');
            console.error('Error:', error);
        }
    });

    // System Preferences Form
    document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            default_currency: document.getElementById('defaultCurrency').value,
            date_format: document.getElementById('dateFormat').value,
            time_zone: document.getElementById('timeZone').value,
            enable_notifications: document.getElementById('enableNotifications').checked
        };

        try {
            const response = await fetch('/api/settings/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showToast('System preferences saved successfully', 'success');
            } else {
                throw new Error('Failed to save system preferences');
            }
        } catch (error) {
            showToast('Error saving system preferences', 'error');
            console.error('Error:', error);
        }
    });

    // Email Settings Form
    document.getElementById('emailForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            smtp_server: document.getElementById('smtpServer').value,
            smtp_port: document.getElementById('smtpPort').value,
            smtp_security: document.getElementById('smtpSecurity').value,
            smtp_username: document.getElementById('smtpUsername').value,
            smtp_password: document.getElementById('smtpPassword').value,
            from_email: document.getElementById('fromEmail').value
        };

        try {
            const response = await fetch('/api/settings/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showToast('Email settings saved successfully', 'success');
            } else {
                throw new Error('Failed to save email settings');
            }
        } catch (error) {
            showToast('Error saving email settings', 'error');
            console.error('Error:', error);
        }
    });

    // Test Email Settings
    document.getElementById('testEmail').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/settings/email/test', {
                method: 'POST'
            });
            
            if (response.ok) {
                showToast('Test email sent successfully', 'success');
            } else {
                throw new Error('Failed to send test email');
            }
        } catch (error) {
            showToast('Error sending test email', 'error');
            console.error('Error:', error);
        }
    });
}

function setupBackupRestore() {
    // Create Backup
    document.getElementById('createBackup').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/settings/backup', {
                method: 'POST'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dicel_backup_${new Date().toISOString().split('T')[0]}.sql`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                showToast('Backup created successfully', 'success');
            } else {
                throw new Error('Failed to create backup');
            }
        } catch (error) {
            showToast('Error creating backup', 'error');
            console.error('Error:', error);
        }
    });

    // Restore Backup
    document.getElementById('restoreBackup').addEventListener('click', async () => {
        const fileInput = document.getElementById('restoreFile');
        if (!fileInput.files.length) {
            showToast('Please select a backup file', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('backup', fileInput.files[0]);

        try {
            const response = await fetch('/api/settings/restore', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                showToast('Backup restored successfully', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                throw new Error('Failed to restore backup');
            }
        } catch (error) {
            showToast('Error restoring backup', 'error');
            console.error('Error:', error);
        }
    });
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Initialize and show the toast
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
} 