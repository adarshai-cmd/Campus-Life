'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none
            bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
            border border-slate-300 dark:border-slate-700
            focus:border-[#0D5C46] dark:focus:border-emerald-500
            focus:ring-2 focus:ring-[#0D5C46]/20 dark:focus:ring-emerald-500/20
            placeholder:text-slate-500 dark:placeholder:text-slate-400
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20' : ''}
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</span>}
        {helperText && !error && (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
