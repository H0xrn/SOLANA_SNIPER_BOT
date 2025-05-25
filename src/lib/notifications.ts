import toast from './toast-shim';

// Define notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  type: NotificationType;
  message: string;
  description?: string;
  txid?: string;
  link?: string;
  linkLabel?: string;
}

// Track last notification times and messages to prevent duplicates
const lastNotificationTimes: Record<NotificationType, number> = {
  success: 0,
  error: 0,
  info: 0,
  warning: 0,
};

const lastNotificationMessages: Record<NotificationType, string | null> = {
  success: null,
  error: null,
  info: null,
  warning: null,
};

// Minimum durations between notifications (in milliseconds)
const MIN_NOTIFICATION_SPACING = {
  success: 2000,   // 2 seconds
  error: 5000,     // 5 seconds
  info: 3000,      // 3 seconds
  warning: 4000,   // 4 seconds
  rpcError: 30000, // RPC errors get a much longer timeout (30 seconds)
};

// Last RPC error time and message to specifically prevent RPC error spam
let lastRpcErrorTime = 0;
let lastRpcErrorMessage: string | null = null;

// Helper to determine if a message is an RPC error
const isRpcError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('rpc') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('solana') ||
    lowerMessage.includes('endpoint') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('403') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('429')
  );
};

/**
 * Show a notification to the user
 */
export const notify = (options: NotificationOptions) => {
  const { type, message, description } = options;
  const now = Date.now();
  
  // Check if this is an RPC-related error
  const isRpc = type === 'error' && isRpcError(message);
  
  // Get appropriate throttle time based on notification type
  const minTime = isRpc 
    ? MIN_NOTIFICATION_SPACING.rpcError
    : MIN_NOTIFICATION_SPACING[type];
  
  // For RPC errors, check against dedicated RPC error trackers
  if (isRpc) {
    const timeSinceLastRpcError = now - lastRpcErrorTime;
    
    // If this is a duplicate RPC error within the throttle window, don't show it
    if (
      timeSinceLastRpcError < MIN_NOTIFICATION_SPACING.rpcError && 
      lastRpcErrorMessage === message
    ) {
      console.log(`[Notification suppressed] ${message} (duplicate RPC error within ${MIN_NOTIFICATION_SPACING.rpcError}ms)`);
      return;
    }
    
    // Update RPC error tracking
    lastRpcErrorTime = now;
    lastRpcErrorMessage = message;
  } else {
    // For non-RPC notifications, check against type-specific trackers
    const timeSinceLastNotification = now - lastNotificationTimes[type];
    
    // If this is a duplicate message within the throttle window, don't show it
    if (
      timeSinceLastNotification < minTime && 
      lastNotificationMessages[type] === message
    ) {
      console.log(`[Notification suppressed] ${message} (duplicate within ${minTime}ms)`);
      return;
    }
    
    // Update notification tracking
    lastNotificationTimes[type] = now;
    lastNotificationMessages[type] = message;
  }
  
  // Log notification to console
  console.log(`[Notification] ${type}: ${message}`);
  if (description) {
    console.log(`[Notification Description] ${description}`);
  }
  
  // Show toast notification using our shim
  try {
    // Different styling based on notification type
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast(message);
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
        });
        break;
      default:
        toast(message);
    }
  } catch (e) {
    // If toast library fails, just log to console
    console.error('Failed to show notification UI:', e);
  }
}; 