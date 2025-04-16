export function showToast(message, type = 'error', duration = 5000) {
    Toastify({
        text: message,
        duration: duration,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db',
        stopOnFocus: true,
    }).showToast();
}

export function handleError(error, context = 'Operation failed') {
    console.error(`${context}:`, error);
    let message = 'An unexpected error occurred. Please try again.';

    // Handle network errors
    if (!navigator.onLine) {
        message = 'No internet connection. Please check your network and try again.';
    } else if (error.code) {
        // Firebase-specific error codes
        switch (error.code) {
            case 'permission-denied':
                message = 'You do not have permission to perform this action.';
                break;
            case 'unavailable':
                message = 'Firebase service is currently unavailable. Please try again later.';
                break;
            case 'not-found':
                message = 'Requested data was not found.';
                break;
            default:
                message = error.message || message;
        }
    } else if (error.message) {
        message = error.message;
    }

    showToast(`${context}: ${message}`, 'error');
    throw error; // Re-throw for further handling if needed
}

export function handleValidationError(message) {
    showToast(message, 'error');
}

export function handleSuccess(message) {
    showToast(message, 'success');
}