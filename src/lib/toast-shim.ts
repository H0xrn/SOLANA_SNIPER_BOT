// Real toast implementation for UI display
const toast = (message: string) => {
  showToastUI(message, 'default');
  console.log(`[TOAST] ${message}`);
  return 'toast-id';
};

toast.success = (message: string) => {
  showToastUI(message, 'success');
  console.log(`[TOAST SUCCESS] ${message}`);
  return 'toast-id';
};

toast.error = (message: string) => {
  showToastUI(message, 'error');
  console.error(`[TOAST ERROR] ${message}`);
  return 'toast-id';
};

toast.info = (message: string) => {
  showToastUI(message, 'info');
  console.log(`[TOAST INFO] ${message}`);
  return 'toast-id';
};

toast.loading = (message: string) => {
  showToastUI(message, 'loading');
  console.log(`[TOAST LOADING] ${message}`);
  return 'toast-id';
};

toast.warning = (message: string) => {
  showToastUI(message, 'warning');
  console.log(`[TOAST WARNING] ${message}`);
  return 'toast-id';
};

// Helper function to show toast UI
function showToastUI(message: string, type: 'default' | 'success' | 'error' | 'info' | 'loading' | 'warning') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = getBackgroundColor(type);
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  toast.style.zIndex = '9999';
  toast.style.minWidth = '300px';
  toast.style.maxWidth = '80vw';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s ease';
  toast.innerText = message;

  // Append to body
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Helper to get background color based on toast type
function getBackgroundColor(type: string): string {
  switch (type) {
    case 'success': return '#10b981'; // green
    case 'error': return '#ef4444';   // red
    case 'info': return '#3b82f6';    // blue
    case 'warning': return '#f59e0b'; // amber
    case 'loading': return '#6366f1'; // indigo
    default: return '#6b7280';        // gray
  }
}

// Add global CSS for toast
const style = document.createElement('style');
style.textContent = `
  .toast-notification {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .toast-notification {
      right: 10px;
      left: 10px;
      width: calc(100% - 20px);
      max-width: none;
    }
  }
`;
document.head.appendChild(style);

toast.custom = () => {
  console.log('[TOAST CUSTOM]');
  return 'toast-id';
};

toast.dismiss = () => {
  console.log('[TOAST DISMISSED]');
  const toasts = document.querySelectorAll('.toast-notification');
  toasts.forEach(toast => {
    toast.remove();
  });
};

toast.promise = <T>(promise: Promise<T>, opts: any) => {
  console.log('[TOAST PROMISE]', opts);
  return promise;
};

toast.remove = (id: string) => {
  console.log(`[TOAST REMOVED] ${id}`);
};

// Default export
export default toast;

// Export Toaster component as a mock
export const Toaster = () => null; 