// Fallback native alert functions in case SweetAlert2 has issues

export const confirmationAlert = (title, text, confirmText = 'Yes, Continue') => {
  return new Promise((resolve) => {
    const result = window.confirm(`${title}\n\n${text}`);
    resolve({ isConfirmed: result });
  });
};

export const successAlert = (title, text, confirmText = 'OK') => {
  return new Promise((resolve) => {
    window.alert(`${title}\n\n${text}`);
    resolve({ isConfirmed: true });
  });
};

export const errorAlert = (title, text, confirmText = 'Try Again') => {
  return new Promise((resolve) => {
    window.alert(`${title}\n\n${text}`);
    resolve({ isConfirmed: true });
  });
};

export const infoAlert = (title, text, confirmText = 'OK') => {
  return new Promise((resolve) => {
    window.alert(`${title}\n\n${text}`);
    resolve({ isConfirmed: true });
  });
};