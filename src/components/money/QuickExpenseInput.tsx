'use client';

import React, { useState, useMemo } from 'react';
import { useMoney } from '@/context/MoneyContext';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { parseQuickExpenseInput } from '@/services/rules/quickEntryParser';
import { Button } from '@/components/common/Button';
import { Zap, Check, ArrowRight, Tag, Plane } from 'lucide-react';
import { getLocalDateString } from '@/utils/dateUtils';

export function QuickExpenseInput() {
  const { addExpense, categories } = useMoney();
  const { trips } = useTravel();
  const { activeProfile } = useProfile();

  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const parsed = useMemo(() => {
    return parseQuickExpenseInput(input);
  }, [input]);

  // When parsed category changes and user hasn't manually overridden yet
  const effectiveCategory = selectedCategory || parsed?.category || 'Other';

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || parsed.amount <= 0) return;

    const todayStr = getLocalDateString();

    const newExp = addExpense({
      description: parsed.description,
      amount: parsed.amount,
      category: effectiveCategory,
      tripId: selectedTripId || undefined,
      date: todayStr,
    });

    setSuccessMessage(
      `Logged "${newExp.description}" for ${currencyConfig.symbol}${newExp.amount} under ${newExp.category}`
    );
    setInput('');
    setSelectedCategory('');
    setSelectedTripId('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-[#0D5C46] dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Quick Log · Enter Once → Reflect Everywhere
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
          Format: &quot;Book 450&quot;, &quot;Bus 300&quot;, &quot;Lunch 120&quot;
        </span>
      </div>

      <form onSubmit={handleQuickSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSelectedCategory(''); // Reset override on new raw input
            }}
            placeholder="Type expense (e.g. Notebook 80, Train Dehradun 780, Mess 1200)..."
            className="w-full pl-3.5 pr-28 py-3 rounded-xl text-sm bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-300/80 dark:border-slate-700 focus:border-[#0D5C46] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#0D5C46]/20 outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />

          <div className="absolute right-1.5 flex items-center">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!parsed || parsed.amount <= 0}
              className="gap-1 px-3 py-1.5 text-xs shadow-none"
            >
              <span>Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Real-time interpretation preview */}
        {parsed && parsed.amount > 0 && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Interpreted:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {parsed.description}
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                {currencyConfig.symbol}
                {parsed.amount}
              </span>

              {/* Category selector override */}
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400 ml-1" />
                <select
                  value={effectiveCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 py-1 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Trip linker */}
              {trips.length > 0 && (
                <div className="flex items-center gap-1">
                  <Plane className="w-3 h-3 text-slate-400 ml-1" />
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="px-2 py-1 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="">No Trip (Daily)</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tripName} ({t.destination})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <span className="text-[11px] text-slate-400 italic">
              Press Enter or click Log
            </span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
}
