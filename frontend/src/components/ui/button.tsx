
import React from 'react';
export function Button({ className = '', variant, size, children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md border text-sm px-3 py-2 transition';
  const styles = variant === 'outline' ? 'border-slate-300 bg-white hover:bg-slate-50' : 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700';
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
}
