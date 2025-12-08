'use client';
import React from 'react';

export function Select({ value, onValueChange, children }: any) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { 
            value, 
            onValueChange, 
            open, 
            setOpen 
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ children, value, open, setOpen }: any) {
  return (
    <button
      type="button"
      className="w-full border rounded-md px-3 py-2 text-sm text-left bg-white hover:bg-slate-50 flex items-center justify-between"
      onClick={() => setOpen?.(!open)}
    >
      {children}
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder, value }: any) {
  return <span className={value ? 'text-slate-900' : 'text-slate-500'}>{value || placeholder}</span>;
}

export function SelectContent({ children, open, setOpen, onValueChange }: any) {
  if (!open) return null;
  
  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { onValueChange, setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ value, children, onValueChange, setOpen }: any) {
  return (
    <div
      className="px-3 py-2 cursor-pointer hover:bg-indigo-50 transition"
      onClick={() => {
        onValueChange?.(value);
        setOpen?.(false);
      }}
    >
      {children}
    </div>
  );
}
