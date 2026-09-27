'use client';

import React from 'react';
import { useProfile } from '@/context/ProfileContext';
import { WelcomeScreen } from '@/components/profile/WelcomeScreen';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { activeProfile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center campus-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0D5C46]/20 border-t-[#0D5C46] dark:border-emerald-500/20 dark:border-t-emerald-400 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Opening Campus Life...</span>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row campus-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PwaInstallBanner />
        <MobileHeader />
        <main className="flex-1 pb-24 md:pb-10 pt-3 sm:pt-4 md:pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
