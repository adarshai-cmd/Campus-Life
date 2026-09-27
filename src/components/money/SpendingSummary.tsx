'use client';

import React from 'react';
import { useMoney } from '@/context/MoneyContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { Calendar, Clock, DollarSign, BookOpen, Utensils, Plane } from 'lucide-react';

export function SpendingSummary() {
  const { analytics } = useMoney();
  const { activeProfile } = useProfile();

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const statCards = [
    {
      title: "Today's Spent",
      amount: analytics.todayTotal,
      subtitle: 'Recorded today',
      icon: Clock,
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: "This Week's Spent",
      amount: analytics.weekTotal,
      subtitle: 'Since Monday',
      icon: Calendar,
      accent: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      title: "This Month's Spent",
      amount: analytics.monthTotal,
      subtitle: 'Current billing cycle',
      icon: DollarSign,
      accent: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  const pillarCategories = [
    {
      name: 'Education',
      amount: analytics.educationSpending,
      icon: BookOpen,
      color: 'bg-emerald-500',
    },
    {
      name: 'Food & Mess',
      amount: analytics.foodSpending,
      icon: Utensils,
      color: 'bg-amber-500',
    },
    {
      name: 'Travel & Transit',
      amount: analytics.travelSpending,
      icon: Plane,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {stat.title}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-1 block">
                  {currencyConfig.symbol}
                  {stat.amount.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {stat.subtitle}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.accent}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Pillars Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Major Spending Streams
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pillarCategories.map((p, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {p.name}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                {currencyConfig.symbol}
                {p.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
