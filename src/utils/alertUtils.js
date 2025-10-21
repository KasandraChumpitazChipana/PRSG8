import alertify from 'alertifyjs';

// Configure alertify settings
alertify.set('notifier', 'position', 'top-right');
alertify.set('notifier', 'delay', 5);

/**
 * Shows a success notification
 * @param {string} message - The message to display
 */
export const showSuccess = (message) => {
  alertify.success(message);
};

/**
 * Shows an error notification
 * @param {string} message - The message to display
 */
export const showError = (message) => {
  alertify.error(message);
};

/**
 * Shows a warning notification
 * @param {string} message - The message to display
 */
export const showWarning = (message) => {
  alertify.warning(message);
};

/**
 * Shows an info notification
 * @param {string} message - The message to display
 */
export const showInfo = (message) => {
  alertify.message(message);
};

/**
 * Shows a confirmation dialog
 * @param {string} message - The message to display
 * @param {function} onOk - Callback function when OK is clicked
 * @param {function} onCancel - Callback function when Cancel is clicked
 */
export const showConfirm = (message, onOk, onCancel) => {
  alertify.confirm(message, onOk, onCancel);
};

/**
 * Shows an alert dialog
 * @param {string} message - The message to display
 * @param {function} onClose - Callback function when dialog is closed
 */
export const showAlert = (message, onClose) => {
  alertify.alert(message, onClose);
};