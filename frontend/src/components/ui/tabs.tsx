'use client';
import React, { createContext, useContext } from 'react';

const TabsContext = createContext<{ value: string; onValueChange: (v: string) => void } | null>(null);

export function Tabs({ value, onValueChange, children }: any) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }: any) {
  return <div className={`flex gap-2 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, className = '', children }: any) {
  const context = useContext(TabsContext);
  if (!context) return null;
  
  const isActive = context.value === value;
  const activeClass = isActive ? 'bg-white shadow-sm border-indigo-200' : 'bg-transparent hover:bg-slate-50';
  
  return (
    <button
      className={`px-3 py-2 text-sm border rounded-md transition ${activeClass} ${className}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }: any) {
  const context = useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div className={className}>{children}</div>;
}
