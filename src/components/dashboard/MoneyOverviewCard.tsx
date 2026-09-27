'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useMoney } from '@/context/MoneyContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';

export function MoneyOverviewCard() {
  const { analytics, expenses } = useMoney();
  const { activeProfile } = useProfile();

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const { spentThisMonth, remaining, monthlyBudget } = analytics.budget;
  const isOverBudget = remaining < 0;

  return (
    <Link
      href="/money"
      className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-md transition-all cursor-pointer group select-none block"
      aria-label="Open Money Dashboard"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                MONEY
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Budget & Expenses
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50/60 dark:group-hover:bg-blue-950/40 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Structured Summary Rows */}
        <div className="py-4 space-y-2.5">
          {/* Monthly Budget */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Budget
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {currencyConfig.symbol}
              {monthlyBudget.toLocaleString()}
            </span>
          </div>

          {/* Spent */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Spent
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {currencyConfig.symbol}
              {spentThisMonth.toLocaleString()}
            </span>
          </div>

          {/* Remaining */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Remaining
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-bold font-mono ${
                  isOverBudget
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {isOverBudget ? '-' : ''}
                {currencyConfig.symbol}
                {Math.abs(remaining).toLocaleString()}
              </span>
              {isOverBudget && (
                <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Over
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Cue */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {expenses.length} recorded {expenses.length === 1 ? 'transaction' : 'transactions'}
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          Open Money Dashboard →
        </span>
      </div>
    </Link>
  );
}
