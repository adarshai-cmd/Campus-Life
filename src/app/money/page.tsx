'use client';

import React, { useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { QuickExpenseInput } from '@/components/money/QuickExpenseInput';
import { BudgetCard } from '@/components/money/BudgetCard';
import { SpendingSummary } from '@/components/money/SpendingSummary';
import { ExpenseTable } from '@/components/money/ExpenseTable';
import { ExpenseModal } from '@/components/money/ExpenseModal';
import { useProfile } from '@/context/ProfileContext';
import { useMoney } from '@/context/MoneyContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';

export default function MoneyPage() {
  const { activeProfile } = useProfile();
  const { expenses } = useMoney();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="accent" size="sm">
              <Wallet className="w-3.5 h-3.5 mr-1" />
              Finance Desk
            </Badge>
            <Badge variant="neutral" size="sm">
              Currency: {currencyConfig.symbol} {currencyConfig.code}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Money & Allowance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fast student expense logging, monthly budget controls, and automatic trip synchronization.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Quick Entry Input */}
      <QuickExpenseInput />

      {/* Budget Card & Spending Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <BudgetCard />
        </div>
        <div className="lg:col-span-2">
          <SpendingSummary />
        </div>
      </div>

      {/* Transaction Table */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Transaction History
          </h2>
          <span className="text-[11px] text-slate-400">
            Synced with Trips & Dashboard
          </span>
        </div>
        <ExpenseTable />
      </section>

      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
