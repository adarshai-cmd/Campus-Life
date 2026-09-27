'use client';

import React from 'react';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { Plane, MapPin, Compass, DollarSign, TrendingUp } from 'lucide-react';

export function TravelAnalyticsView() {
  const { analytics } = useTravel();
  const { activeProfile } = useProfile();

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const statCards = [
    {
      label: 'Total Trips',
      value: analytics.totalTrips,
      subtitle: `${analytics.tripsThisMonth} logged this month`,
      icon: Compass,
      accent: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: 'Travel Spending',
      value: `${currencyConfig.symbol}${analytics.totalTravelSpending.toLocaleString()}`,
      subtitle: `${currencyConfig.symbol}${analytics.travelSpendingThisMonth.toLocaleString()} this month`,
      icon: DollarSign,
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Average Trip Cost',
      value: `${currencyConfig.symbol}${analytics.averageTripCost.toLocaleString()}`,
      subtitle: 'Per travel excursion',
      icon: TrendingUp,
      accent: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
    {
      label: 'Total Distance',
      value: `${analytics.totalDistanceKm.toLocaleString()} km`,
      subtitle: 'Transit recorded',
      icon: Plane,
      accent: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 font-mono block">
                  {stat.value}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {stat.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
            Top Destination
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400" />
            {analytics.mostVisitedDestination || 'No destination yet'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
            Most Used Transit
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            {analytics.mostUsedTransport || 'None'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
            Most Expensive Trip
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
            {analytics.mostExpensiveTrip
              ? `${analytics.mostExpensiveTrip.tripName} (${currencyConfig.symbol}${(Number(analytics.mostExpensiveTrip.cost) || 0).toLocaleString()})`
              : 'None recorded'}
          </span>
        </div>
      </div>
    </div>
  );
}
