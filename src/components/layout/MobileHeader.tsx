'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CampusLifeLogo } from '@/components/brand/CampusLifeLogo';
import { ChevronsUpDown, Sun, Moon, Download } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { PwaInstallToast } from '@/components/pwa/PwaInstallToast';
import { ProfileSwitcherModal } from '@/components/profile/ProfileSwitcherModal';

export function MobileHeader() {
  const { activeProfile } = useProfile();
  const { resolvedTheme, setTheme } = useTheme();
  const { isMounted, isInstalled, toastMessage, setToastMessage, install } = usePwaInstall();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const initial = activeProfile?.name ? activeProfile.name.charAt(0).toUpperCase() : '?';

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 glass-panel bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800/90 px-3 sm:px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] flex items-center justify-between shadow-2xs gap-2">
        <Link href="/" className="flex items-center gap-2 touch-manipulation shrink-0">
          <CampusLifeLogo size="sm" showWordmark={true} />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Persistent Mobile Install Button (Shown until app is actually installed) */}
          {isMounted && !isInstalled && (
            <button
              onClick={() => install()}
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-gradient-to-r from-[#0D5C46] to-[#127a5e] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-transform shrink-0 cursor-pointer"
              title="Install Campus Life"
            >
              <Download className="w-3 h-3" />
              <span>📲 Install</span>
            </button>
          )}

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsSwitcherOpen(true)}
            className="flex items-center gap-1.5 p-1 pl-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shrink-0"
          >
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
              style={{ backgroundColor: activeProfile?.avatarColor || '#0D5C46' }}
            >
              {initial}
            </span>
            <span className="max-w-[65px] truncate">{activeProfile?.name || 'Profile'}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      <ProfileSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      <PwaInstallToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </>
  );
}
