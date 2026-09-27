'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Wallet,
  Plane,
  Lightbulb,
  Settings,
} from 'lucide-react';
import { MAIN_NAV_ITEMS, NavigationSectionId } from '@/types/navigation';

const NAV_ICONS: Record<NavigationSectionId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  college: GraduationCap,
  money: Wallet,
  travel: Plane,
  skills: Lightbulb,
  settings: Settings,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/90 dark:border-slate-800/90 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
    >
      <div className="grid grid-cols-6 h-15 max-w-lg mx-auto items-center px-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id];
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full py-1.5 transition-all relative select-none active:scale-90 touch-manipulation min-h-[48px] ${
                isActive
                  ? 'text-[#0D5C46] dark:text-emerald-400 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0.5 w-7 h-0.5 rounded-full bg-[#0D5C46] dark:bg-emerald-400" />
              )}
              <Icon className={`w-5 h-5 mb-0.5 mt-0.5 shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] leading-tight tracking-tight truncate max-w-full px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
