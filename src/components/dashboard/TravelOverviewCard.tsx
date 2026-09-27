'use client';

import React from 'react';
import Link from 'next/link';
import { Plane, ArrowUpRight, MapPin } from 'lucide-react';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';

export function TravelOverviewCard() {
  const { trips, analytics } = useTravel();
  const { activeProfile } = useProfile();

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const upcoming = analytics.upcomingTrip;

  // Format date helper (e.g. "12 Oct")
  const formatDateSnippet = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <Link
      href="/travel"
      className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-md transition-all cursor-pointer group select-none block"
      aria-label="Open Travel Dashboard"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60 group-hover:scale-105 transition-transform">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                TRAVEL
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Trips & Transit
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:bg-teal-50/60 dark:group-hover:bg-teal-950/40 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Structured Summary Rows */}
        <div className="py-4 space-y-2.5">
          {/* Next Trip */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Next Trip
            </span>
            <div className="flex items-center gap-1.5 max-w-[65%] truncate">
              {upcoming ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {upcoming.destination || upcoming.tripName}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  None planned
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Date
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {upcoming ? formatDateSnippet(upcoming.startDate) : '—'}
            </span>
          </div>

          {/* Budget */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Budget
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {upcoming ? (
                `${currencyConfig.symbol}${(Number(upcoming.plannedBudget) || 0).toLocaleString()}`
              ) : (
                '—'
              )}
            </span>
          </div>

          {/* Spent */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Spent
            </span>
            <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {upcoming ? (
                `${currencyConfig.symbol}${(Number(upcoming.totalCost) || 0).toLocaleString()}`
              ) : (
                `${currencyConfig.symbol}${(Number(analytics.totalTravelSpending) || 0).toLocaleString()}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation Cue */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {trips.length} {trips.length === 1 ? 'trip' : 'trips'} logged
        </span>
        <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          Open Travel Dashboard →
        </span>
      </div>
    </Link>
  );
}
