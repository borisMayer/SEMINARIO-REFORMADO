import React from 'react';

export function Badge({ children, variant = 'secondary', className = '', ...props }: any) {
  const styles = variant === 'outline' 
    ? 'border border-slate-300 text-slate-700 bg-white' 
    : 'bg-slate-200 text-slate-700';
  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${styles} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}
