import AuthUtils from '../utils/auth.utils.js';
import UiUtils from '../utils/ui.utils.js';

// API Base URL based on environment
const API_BASE = 'http://localhost:3000';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE;
    }

    // Generic request method with retry logic
    async request(endpoint, options = {}, retryCount = 3) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...AuthUtils.getAuthHeaders(),
            ...options.headers,
        };

        try {
            const response = await this._makeRequest(url, { ...options, headers }, retryCount);
            return await this._handleResponse(response);
        } catch (error) {
            return this._handleError(error);
        }
    }

    // Private method for making requests with retry logic
    async _makeRequest(url, options, retriesLeft) {
        try {
            const response = await fetch(API_BASE + url, {
                ...options,
                credentials: 'include',
            });
            
            if (!response.ok && retriesLeft > 0 && this._shouldRetry(response.status)) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this._makeRequest(url, options, retriesLeft - 1);
            }
            
            return response;
        } catch (error) {
            if (retriesLeft > 0 && this._shouldRetry()) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this._makeRequest(url, options, retriesLeft - 1);
            }
            throw error;
        }
    }

    // Private method to determine if request should be retried
    _shouldRetry(status) {
        const retriableStatuses = [408, 500, 502, 503, 504];
        return !status || retriableStatuses.includes(status);
    }

    // Private method for handling responses
    async _handleResponse(response) {
        if (!response.ok) {
            if (response.status === 401) {
                AuthUtils.logout();
                window.location.href = '/login.html';
                return;
            }
            
            if (response.status === 403) {
                const errorData = await response.json();
                if (errorData.message === 'Role not allowed for this resource') {
                    UiUtils.showNotification('You do not have permission to access this resource', 'danger');
                    return;
                }
                if (errorData.message === 'CORS error') {
                    UiUtils.showNotification('Access denied due to CORS policy', 'danger');
                    return;
                }
            }
            
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Private method for handling errors
    _handleError(error) {
        console.error('API request failed:', error);
        
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            UiUtils.showNotification('Unable to connect to the server. Please check your connection.', 'danger');
        } else {
            UiUtils.showNotification(error.message || 'An unexpected error occurred', 'danger');
        }
        
        throw error;
    }

    // Authentication
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        
        if (response.token) {
            AuthUtils.setToken(response.token);
            AuthUtils.setUser(response.user);
        }
        
        return response;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        AuthUtils.logout();
        window.location.href = '/login.html';
    }

    // Equipment endpoints
    async getAllEquipment() {
        return this.request('/equipment');
    }

    async getEquipmentById(id) {
        return this.request(`/equipment/${id}`);
    }

    async createEquipment(equipmentData) {
        return this.request('/equipment', {
            method: 'POST',
            body: JSON.stringify(equipmentData),
        });
    }

    async updateEquipment(id, equipmentData) {
        return this.request(`/equipment/${id}`, {
            method: 'PUT',
            body: JSON.stringify(equipmentData),
        });
    }

    async deleteEquipment(id) {
        return this.request(`/equipment/${id}`, {
            method: 'DELETE',
        });
    }

    // Incident endpoints
    async getAllIncidents() {
        return this.request('/incidents');
    }

    async getIncidentById(id) {
        return this.request(`/incidents/${id}`);
    }

    async createIncident(incidentData) {
        return this.request('/incidents', {
            method: 'POST',
            body: JSON.stringify(incidentData),
        });
    }

    async updateIncident(id, incidentData) {
        return this.request(`/incidents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(incidentData),
        });
    }

    async deleteIncident(id) {
        return this.request(`/incidents/${id}`, {
            method: 'DELETE',
        });
    }

    // Report endpoints
    async getAttendanceReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reports/attendance?${queryString}`);
    }

    async getLeaveReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reports/leave?${queryString}`);
    }

    async getPayrollReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reports/payroll?${queryString}`);
    }

    async getIncidentReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reports/incident?${queryString}`);
    }

    async getEquipmentReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reports/equipment?${queryString}`);
    }

    async getProjectReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/reports/project?${queryString}`);
    }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService; 