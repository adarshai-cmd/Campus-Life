'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'warning' | 'info' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    neutral:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700 font-semibold',
    accent:
      'bg-emerald-50 text-[#074332] border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/80 font-semibold',
    warning:
      'bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/80 font-semibold',
    info:
      'bg-blue-50 text-blue-950 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700/80 font-semibold',
    outline:
      'bg-white/90 text-slate-800 border-slate-300 dark:bg-slate-900/90 dark:text-slate-200 dark:border-slate-600 font-semibold',
    danger:
      'bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/80 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md tracking-wide',
    md: 'text-xs px-2.5 py-1 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border leading-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
