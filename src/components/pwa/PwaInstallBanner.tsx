'use client';

import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { PwaInstallToast } from './PwaInstallToast';

export const PwaInstallBanner: React.FC = () => {
  const {
    isMounted,
    isInstalled,
    isDismissed,
    toastMessage,
    setToastMessage,
    install,
    dismissBanner,
  } = usePwaInstall();

  if (!isMounted || isInstalled || isDismissed) {
    return (
      <PwaInstallToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    );
  }

  return (
    <>
      <div className="relative z-40 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white px-4 py-2.5 shadow-md transition-all animate-in fade-in slide-in-from-top-2">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-sm shrink-0">
              <Smartphone className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold tracking-tight">📲 Install Campus Life:</span>{' '}
              <span className="text-emerald-100 hidden sm:inline">
                Instant access, mobile-first design, and offline reliability.
              </span>
              <span className="text-emerald-100 sm:hidden">
                Add to your home screen.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => install()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Campus Life</span>
            </button>

            <button
              onClick={dismissBanner}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PwaInstallToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </>
  );
};
