
import React from 'react';
export function Select({ value, onValueChange, children }) { return <div>{children}</div>; }
export function SelectTrigger({ children }) { return <div className='border rounded-md px-3 py-2 text-sm'>{children}</div>; }
export function SelectValue({ placeholder }) { return <span className='text-slate-600'>{placeholder}</span>; }
export function SelectContent({ children }) { return <div className='mt-2 space-y-1'>{children}</div>; }
export function SelectItem({ value, children, onClick }) { return <div className='px-3 py-2 border rounded-md cursor-pointer' onClick={() => onClick && onClick(value)}>{children}</div>; }
