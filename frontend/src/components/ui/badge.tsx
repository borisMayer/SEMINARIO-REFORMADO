
import React from 'react';
export function Badge({ children, variant='secondary', className='', ...props }) {
  const styles = variant==='outline' ? 'border border-slate-300 text-slate-700' : 'bg-slate-200 text-slate-700';
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${styles} ${className}`} {...props}>{children}</span>;
}
