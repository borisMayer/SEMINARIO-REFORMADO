'use client';
import React from 'react';

export function Dialog({ children, open, onOpenChange }: any) {
  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { open, onOpenChange });
        }
        return child;
      })}
    </div>
  );
}

export function DialogTrigger({ asChild, children, open, onOpenChange }: any) {
  return React.cloneElement(children as any, {
    onClick: () => onOpenChange?.(true)
  });
}

export function DialogContent({ className = '', children, open, onOpenChange }: any) {
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => onOpenChange?.(false)}
    >
      <div 
        className={`bg-white rounded-xl p-6 w-full max-w-xl shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: any) {
  return <div className="mb-4">{children}</div>;
}

export function DialogFooter({ children }: any) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}

export function DialogTitle({ children }: any) {
  return <h3 className="text-xl font-semibold">{children}</h3>;
}
