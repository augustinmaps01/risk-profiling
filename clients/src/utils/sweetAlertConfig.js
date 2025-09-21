import Swal from 'sweetalert2';

// Default SweetAlert configuration for the application
export const defaultSwalConfig = {
  background: '#ffffff',
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-200',
    title: 'text-slate-800 font-bold',
    content: 'text-slate-600',
    confirmButton: 'rounded-lg px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200',
    cancelButton: 'rounded-lg px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200',
  },
  buttonsStyling: false,
};

// Confirmation dialogs
export const confirmationAlert = (title, text, confirmText = 'Yes, Continue') => {
  return Swal.fire({
    ...defaultSwalConfig,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#64748b',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  });
};

// Success alerts
export const successAlert = (title, text, confirmText = 'OK') => {
  return Swal.fire({
    ...defaultSwalConfig,
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#10b981',
    confirmButtonText: confirmText,
  });
};

// Error alerts
export const errorAlert = (title, text, confirmText = 'Try Again') => {
  return Swal.fire({
    ...defaultSwalConfig,
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#ef4444',
    confirmButtonText: confirmText,
  });
};

// Warning alerts
export const warningAlert = (title, text, confirmText = 'OK') => {
  return Swal.fire({
    ...defaultSwalConfig,
    title,
    text,
    icon: 'warning',
    confirmButtonColor: '#f59e0b',
    confirmButtonText: confirmText,
  });
};

// Info alerts
export const infoAlert = (title, text, confirmText = 'OK') => {
  return Swal.fire({
    ...defaultSwalConfig,
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: confirmText,
  });
};

// Loading/Progress alerts
export const showLoading = (title = 'Please wait...', text = 'Processing your request') => {
  return Swal.fire({
    ...defaultSwalConfig,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const hideLoading = () => {
  Swal.close();
};