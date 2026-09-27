'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CollegeOverviewCard } from '@/components/dashboard/CollegeOverviewCard';
import { MoneyOverviewCard } from '@/components/dashboard/MoneyOverviewCard';
import { TravelOverviewCard } from '@/components/dashboard/TravelOverviewCard';
import { SkillsOverviewCard } from '@/components/dashboard/SkillsOverviewCard';
import { useProfile } from '@/context/ProfileContext';
import { Home, ShieldCheck, Cpu } from 'lucide-react';

export default function DashboardPage() {
  const { activeProfile } = useProfile();

  return (
    <div className="space-y-7 pb-8">
      {/* Dynamic Header with Greeting & Status */}
      <DashboardHeader />

      {/* Summary + Navigation Hub: 4 Clickable Core Module Cards */}
      <section aria-labelledby="overview-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="overview-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Core Modules · Summary Hub
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any card to open full module dashboard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <CollegeOverviewCard />
          <MoneyOverviewCard />
          <TravelOverviewCard />
          <SkillsOverviewCard />
        </div>
      </section>

      {/* Campus Residence Snapshot */}
      <section className="glass-card rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200/80 dark:border-slate-700">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Hostel & Residence Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current base: <span className="font-medium text-slate-700 dark:text-slate-300">{activeProfile?.residenceLabel || 'Campus / Hostel'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero Cloud Dependency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-400" />
              <span>Offline Capable</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
