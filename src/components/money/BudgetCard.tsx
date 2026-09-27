'use client';

import React, { useState } from 'react';
import { useMoney } from '@/context/MoneyContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { Button } from '@/components/common/Button';
import { Wallet, Edit3, Check } from 'lucide-react';

export function BudgetCard() {
  const { analytics, budgetConfig, updateBudget } = useMoney();
  const { activeProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [newBudgetStr, setNewBudgetStr] = useState(String(budgetConfig.monthlyBudget));

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const { monthlyBudget, spentThisMonth, remaining, percentageUsed } = analytics.budget;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBudgetStr);
    if (!isNaN(val) && val >= 0) {
      updateBudget(val);
      setIsEditing(false);
    }
  };

  const isOverBudget = remaining < 0;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0D5C46] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Monthly Hostel Budget
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Live burn rate for {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())}
            </span>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => {
              setNewBudgetStr(String(monthlyBudget));
              setIsEditing(true);
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Set Budget</span>
          </button>
        ) : (
          <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                value={newBudgetStr}
                onChange={(e) => setNewBudgetStr(e.target.value)}
                autoFocus
                className="w-24 pl-6 pr-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="px-2 py-1 min-h-0 text-xs">
              <Check className="w-3 h-3" />
            </Button>
          </form>
        )}
      </div>

      {/* Figures Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
            Budget
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
            {currencyConfig.symbol}
            {monthlyBudget.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
            Spent
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
            {currencyConfig.symbol}
            {spentThisMonth.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
            Remaining
          </span>
          <span
            className={`text-base sm:text-lg font-bold font-mono mt-0.5 block ${
              isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {isOverBudget ? '-' : ''}
            {currencyConfig.symbol}
            {Math.abs(remaining).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{percentageUsed}% of allowance utilized</span>
          {isOverBudget ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Budget Exceeded</span>
          ) : (
            <span>
              {currencyConfig.symbol}
              {remaining.toLocaleString()} left
            </span>
          )}
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-rose-500'
                : percentageUsed > 80
                ? 'bg-amber-500'
                : 'bg-[#0D5C46] dark:bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
