'use client';

import React from 'react';
import { Smartphone, X } from 'lucide-react';

interface PwaInstallToastProps {
  message: string | null;
  onClose: () => void;
}

export function PwaInstallToast({ message, onClose }: PwaInstallToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 dark:text-emerald-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold leading-snug">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
