import React from 'react';

type AlertProps = {
  variant?: 'info' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
};

export function Alert({ variant = 'info', children }: AlertProps) {
  const classes = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  }[variant];
  return <div className={`rounded-md border px-3 py-2 text-sm ${classes}`}>{children}</div>;
}
