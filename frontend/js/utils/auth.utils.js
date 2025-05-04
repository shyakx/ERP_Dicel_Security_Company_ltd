// Auth utils
const AuthUtils = {
    // Get auth headers
    getAuthHeaders: function() {
        const token = this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // Get token
    getToken: function() {
        return localStorage.getItem('token');
    },

    // Set token
    setToken: function(token) {
        localStorage.setItem('token', token);
    },

    // Set user data
    setUser: function(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Get user data
    getUser: function() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    },

    // Remove token and user data
    removeToken: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Check if authenticated
    isAuthenticated: function() {
        return !!this.getToken();
    },

    // Check if user has role
    hasRole: function(role) {
        const user = this.getUser();
        return user && user.role === role;
    },

    // Check if user has any of the roles
    hasAnyRole: function(roles) {
        const user = this.getUser();
        return user && roles.includes(user.role);
    },

    // Check if user has all of the roles
    hasAllRoles: function(roles) {
        const user = this.getUser();
        return user && roles.every(role => user.roles?.includes(role));
    },

    // Logout
    logout: function() {
        this.removeToken();
        window.location.href = '/login.html';
    }
}; 