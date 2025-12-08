import React from 'react';

export function Button({ className = '', variant = 'default', size = 'default', children, disabled, ...props }: any) {
  const base = 'inline-flex items-center justify-center rounded-md border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    outline: 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900',
    default: 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2'
  };
  
  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant as keyof typeof variants] || variants.default} ${sizes[size as keyof typeof sizes] || sizes.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
