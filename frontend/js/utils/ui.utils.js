import apiService from './js/services/api.service.js';
import AuthUtils from './js/utils/auth.utils.js';
import UiUtils from './js/utils/ui.utils.js';

// UI utils
const UiUtils = {
    // Show loading spinner
    showLoading: function() {
        if (!$('#loadingSpinner').length) {
            $('body').append(`
                <div id="loadingSpinner" class="position-fixed w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(0,0,0,0.5); z-index: 9999;">
                    <div class="spinner-border text-light" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            `);
        }
    },

    // Hide loading spinner
    hideLoading: function() {
        $('#loadingSpinner').remove();
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const id = 'notification-' + Date.now();
        const notification = $(`
            <div id="${id}" class="alert alert-${type} alert-dismissible fade show position-fixed" role="alert" style="top: 20px; right: 20px; z-index: 9999;">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);

        $('body').append(notification);
        setTimeout(() => {
            notification.alert('close');
        }, 5000);
    },

    // Show confirmation dialog
    confirmDialog: function(message) {
        return new Promise((resolve) => {
            const id = 'confirmDialog-' + Date.now();
            const dialog = $(`
                <div id="${id}" class="modal fade" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirm</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                ${message}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary confirm-btn">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            $('body').append(dialog);
            dialog.modal('show');

            dialog.find('.confirm-btn').on('click', function() {
                dialog.modal('hide');
                resolve(true);
            });

            dialog.on('hidden.bs.modal', function() {
                dialog.remove();
                resolve(false);
            });
        });
    },

    // Format currency
    formatCurrency: function(amount, currency = 'RWF') {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date
    formatDate: function(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();

        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default:
                return d.toLocaleDateString();
        }
    },

    // Format time
    formatTime: function(date) {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    // Format datetime
    formatDateTime: function(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    // Validate email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone
    validatePhone: function(phone) {
        const re = /^\+?[\d\s-]{10,}$/;
        return re.test(phone);
    },

    // Validate password
    validatePassword: function(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return re.test(password);
    }
};

export default UiUtils;