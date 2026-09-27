'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs font-medium min-h-[34px]',
      md: 'px-4 py-2.5 text-sm font-medium min-h-[42px]',
      lg: 'px-5 py-3 text-base font-medium min-h-[48px]',
    };

    const variantClasses = {
      primary:
        'bg-[#0D5C46] text-white hover:bg-[#0A4736] active:bg-[#083A2C] shadow-xs dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-slate-950 font-semibold',
      secondary:
        'bg-slate-100/90 text-slate-800 hover:bg-slate-200/90 active:bg-slate-300/80 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/80 dark:border-slate-700/80',
      outline:
        'bg-transparent text-slate-700 hover:bg-slate-100/70 border border-slate-300 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/60',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/70',
      danger:
        'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-900/40',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] ${
          fullWidth ? 'w-full' : ''
        } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
