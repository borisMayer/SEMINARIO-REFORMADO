'use client';
import React from 'react';

export function Checkbox({ id, checked, onCheckedChange, className = '' }: any) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={`w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer ${className}`}
    />
  );
}
