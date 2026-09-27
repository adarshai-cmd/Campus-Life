'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CampusLifeLogo } from '@/components/brand/CampusLifeLogo';
import {
  LayoutDashboard,
  GraduationCap,
  Wallet,
  Plane,
  Lightbulb,
  Settings,
  ChevronsUpDown,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { useCollege } from '@/context/CollegeContext';
import { useMoney } from '@/context/MoneyContext';
import { useTravel } from '@/context/TravelContext';
import { useSkills } from '@/context/SkillsContext';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { PwaInstallToast } from '@/components/pwa/PwaInstallToast';
import { MAIN_NAV_ITEMS, NavigationSectionId } from '@/types/navigation';
import { ProfileSwitcherModal } from '@/components/profile/ProfileSwitcherModal';
import { Download } from 'lucide-react';

const NAV_ICONS: Record<NavigationSectionId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  college: GraduationCap,
  money: Wallet,
  travel: Plane,
  skills: Lightbulb,
  settings: Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { activeProfile } = useProfile();
  const { theme, setTheme } = useTheme();
  const { pendingAssignments } = useCollege();
  const { expenses } = useMoney();
  const { trips } = useTravel();
  const { skills } = useSkills();
  const { isMounted, isInstalled, toastMessage, setToastMessage, install } = usePwaInstall();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const initial = activeProfile?.name ? activeProfile.name.charAt(0).toUpperCase() : '?';

  const getItemBadge = (id: NavigationSectionId) => {
    if (id === 'college' && pendingAssignments.length > 0) {
      return String(pendingAssignments.length);
    }
    if (id === 'money' && expenses.length > 0) {
      return String(expenses.length);
    }
    if (id === 'travel' && trips.length > 0) {
      return String(trips.length);
    }
    if (id === 'skills' && skills.length > 0) {
      return String(skills.length);
    }
    return null;
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800/80 glass-panel bg-white/70 dark:bg-slate-900/60 z-30">
        {/* App Title / Brand Header */}
        <div className="p-5 pb-4 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CampusLifeLogo size="sm" showWordmark={true} />
          </Link>
        </div>

        {/* Profile Switcher Pill */}
        <div className="p-3">
          <button
            onClick={() => setIsSwitcherOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-850 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                style={{ backgroundColor: activeProfile?.avatarColor || '#0D5C46' }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block">
                    {activeProfile?.name || 'Local Student'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {activeProfile?.username && (
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      @{activeProfile.username}
                    </span>
                  )}
                  {activeProfile?.username && <span>·</span>}
                  <span className="truncate">{activeProfile?.residenceLabel || 'Campus / Hostel'}</span>
                </div>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
          </button>
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 px-3 py-1.5 block">
            Workspace
          </span>
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.id];
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badge = getItemBadge(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all select-none ${
                  isActive
                    ? 'bg-[#0D5C46]/10 text-[#0D5C46] dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-[#0D5C46] dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-[#0D5C46] text-white dark:bg-emerald-500 dark:text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Theme Controls & Local Indicator */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/80 space-y-2">
          {/* Persistent Install Campus Life Button (Shown only when not yet installed) */}
          {isMounted && !isInstalled && (
            <button
              onClick={() => install()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0D5C46] to-[#127a5e] text-white hover:opacity-95 text-xs font-bold shadow-sm transition-transform active:scale-98 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📲 Install Campus Life</span>
            </button>
          )}
          {/* Theme Mode Selector */}
          <div className="flex items-center justify-between p-1 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/70 dark:border-slate-800">
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Preference"
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Local Storage
            </span>
            <span>v3.0.0</span>
          </div>
        </div>
      </aside>

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
