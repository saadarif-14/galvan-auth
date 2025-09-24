import React from 'react';

export function Card({ className = '', children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>
  );
}

export function CardHeader({ className = '', children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: React.PropsWithChildren<{ className?: string }>) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function CardDescription({ className = '', children }: React.PropsWithChildren<{ className?: string }>) {
  return <p className={`text-sm text-neutral-600 ${className}`}>{children}</p>;
}
