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
            url: 'http://localhost:3000/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password, rememberMe }),
            success: function(response) {
                AuthUtils.setToken(response.token);
                AuthUtils.setUser(response.user);
                // Redirect based on role
                switch (response.user.role) {
                    case 'admin':
                        window.location.href = '/Admin/admin-dashboard.html';
                        break;
                    case 'hr':
                        window.location.href = '/HR/hr-dashboard.html';
                        break;
                    case 'finance':
                        window.location.href = '/Finance/finance-dashboard.html';
                        break;
                    case 'security':
                        window.location.href = '/Security/security-dashboard.html';
                        break;
                    default:
                        window.location.href = '/dashboard.html'; // fallback
                }
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