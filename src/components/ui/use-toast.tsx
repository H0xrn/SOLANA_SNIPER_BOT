import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

type ToastContextType = {
  toast: (props: Omit<ToastProps, 'id'>) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, toasts[0].duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'p-4 rounded-md shadow-lg transition-all transform duration-300 ease-in-out bg-background border',
              toast.variant === 'destructive' ? 'border-destructive text-destructive' : 'border-border'
            )}
          >
            <div className="flex justify-between items-start">
              {toast.title && <h4 className="font-medium">{toast.title}</h4>}
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto hover:bg-accent p-1 rounded-full -mt-1 -mr-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {toast.description && <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 