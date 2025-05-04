// Initialize the page
$(document).ready(function() {
    checkToken();
    setupEventListeners();
});

// Check token
function checkToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        UiUtils.showNotification('Invalid or expired reset token. Please request a new password reset.', 'danger');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
        return;
    }
    
    $('#token').val(token);
}

// Setup event listeners
function setupEventListeners() {
    // Reset password form submission
    $('#resetPasswordForm').on('submit', function(e) {
        e.preventDefault();
        
        const token = $('#token').val();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        
        if (password !== confirmPassword) {
            UiUtils.showNotification('Passwords do not match.', 'danger');
            return;
        }
        
        UiUtils.showLoading();
        
        $.ajax({
            url: '/api/auth/reset-password',
            method: 'POST',
            data: { token, password },
            success: function() {
                UiUtils.showNotification('Password has been reset successfully. You can now login with your new password.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            },
            error: function(xhr) {
                UiUtils.showNotification(xhr.responseJSON?.message || 'Failed to reset password. Please try again.', 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });
} 