import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ToastProps = {
  children: ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
};

export const Toast = ({ 
  children, 
  type = 'info', 
  onClose,
  className
}: ToastProps) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/80 border-green-500';
      case 'error':
        return 'bg-red-900/80 border-red-500';
      case 'warning':
        return 'bg-yellow-900/80 border-yellow-500';
      case 'info':
      default:
        return 'bg-blue-900/80 border-blue-500';
    }
  };

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 p-3 rounded-md border glass backdrop-blur-sm text-white shadow-lg',
      getToastStyles(),
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="mr-4">{children}</div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:text-white/80 focus:outline-none"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}; 