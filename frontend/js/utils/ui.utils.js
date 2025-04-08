import apiService from './js/services/api.service.js';
import AuthUtils from './js/utils/auth.utils.js';
import UiUtils from './js/utils/ui.utils.js';

class UiUtils {
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    static showLoading() {
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50';
        loading.style.zIndex = '9999';
        
        loading.innerHTML = `
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        
        document.body.appendChild(loading);
    }

    static hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.remove();
        }
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static confirmDialog(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'confirmModal';
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Confirm Action</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmButton">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            const confirmButton = modal.querySelector('#confirmButton');
            confirmButton.addEventListener('click', () => {
                modalInstance.hide();
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                    resolve(true);
                }, { once: true });
            });
            
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
                resolve(false);
            }, { once: true });
        });
    }

    static handleError(error) {
        console.error('Error:', error);
        this.showNotification(
            error.message || 'An unexpected error occurred. Please try again.',
            'danger'
        );
    }
}

export default UiUtils;