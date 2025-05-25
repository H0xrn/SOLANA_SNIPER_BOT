import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
}

export const TooltipProvider: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

interface TooltipTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const childProps = {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
    onFocus: () => setIsOpen(true),
    onBlur: () => setIsOpen(false),
    'aria-expanded': isOpen,
  };

  if (asChild) {
    return React.cloneElement(children, childProps);
  }

  return React.cloneElement(children, childProps);
};

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
          'absolute -translate-y-full -translate-x-1/2 top-0 left-1/2 mt-2',
          className
        )}
        {...props}
      />
    );
  }
);

TooltipContent.displayName = 'TooltipContent'; 