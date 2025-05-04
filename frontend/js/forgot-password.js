// Initialize the page
$(document).ready(function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Forgot password form submission
    $('#forgotPasswordForm').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        
        UiUtils.showLoading();
        
        $.ajax({
            url: '/api/auth/forgot-password',
            method: 'POST',
            data: { email },
            success: function() {
                UiUtils.showNotification('Password reset instructions have been sent to your email.', 'success');
                $('#email').val('');
            },
            error: function(xhr) {
                UiUtils.showNotification(xhr.responseJSON?.message || 'Failed to send password reset email. Please try again.', 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });
} 