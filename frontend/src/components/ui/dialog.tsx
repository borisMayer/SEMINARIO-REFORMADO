
import React from 'react';
export function Dialog({ children, open, onOpenChange }) {
  return <div>{children}</div>;
}
export function DialogTrigger({ asChild, children }) { return children; }
export function DialogContent({ className='', children }) { return <div className={`fixed inset-0 bg-black/30 flex items-center justify-center z-50`}><div className={`bg-white rounded-xl p-4 w-full max-w-xl ${className}`}>{children}</div></div>; }
export function DialogHeader({ children }) { return <div className='mb-2'>{children}</div>; }
export function DialogFooter({ children }) { return <div className='mt-4 flex justify-end gap-2'>{children}</div>; }
export function DialogTitle({ children }) { return <h3 className='text-lg font-semibold'>{children}</h3>; }
