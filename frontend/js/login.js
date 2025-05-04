// Initialize the page
$(document).ready(function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');
        
        UiUtils.showLoading();
        
        $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password, rememberMe }),
            success: function(response) {
                AuthUtils.setToken(response.token);
                AuthUtils.setUser(response.user);
                window.location.href = '/dashboard.html';
            },
            error: function(xhr) {
                UiUtils.showNotification(xhr.responseJSON?.message || 'Invalid email or password.', 'danger');
            },
            complete: function() {
                UiUtils.hideLoading();
            }
        });
    });
} 