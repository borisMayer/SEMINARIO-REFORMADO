import React from 'react';

export function Textarea({ className = '', ...props }: any) {
  return (
    <textarea
      className={`w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[100px] ${className}`}
      {...props}
    />
  );
}
