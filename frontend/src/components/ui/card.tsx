
import React from 'react';
export function Card({ className='', children }) { return <div className={`bg-white border rounded-2xl ${className}`}>{children}</div>; }
export function CardHeader({ children }) { return <div className='p-4 border-b'>{children}</div>; }
export function CardTitle({ children, className='' }) { return <h3 className={`font-semibold ${className}`}>{children}</h3>; }
export function CardContent({ children, className='' }) { return <div className={`p-4 ${className}`}>{children}</div>; }
