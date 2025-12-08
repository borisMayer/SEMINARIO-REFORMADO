import React from 'react';

export function Card({ className = '', children }: any) {
  return <div className={`bg-white border rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: any) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: any) {
  return <h3 className={`font-semibold text-lg ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
