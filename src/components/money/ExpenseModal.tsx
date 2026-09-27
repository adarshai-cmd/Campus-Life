'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useMoney } from '@/context/MoneyContext';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { Expense } from '@/types/money';
import { getLocalDateString } from '@/utils/dateUtils';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Expense | null;
  defaultTripId?: string;
}

function ExpenseForm({
  initialData,
  defaultTripId,
  onSave,
  onCancel,
}: {
  initialData?: Expense | null;
  defaultTripId?: string;
  onSave: (data: {
    description: string;
    amount: number;
    category: string;
    date: string;
    tripId?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}) {
  const { categories, addCustomCategory } = useMoney();
  const { trips } = useTravel();
  const { activeProfile } = useProfile();

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const todayStr = getLocalDateString();

  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(
    initialData?.amount !== undefined ? String(initialData.amount) : ''
  );
  const [category, setCategory] = useState(
    initialData?.category || (defaultTripId ? 'Travel' : 'Food')
  );
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [date, setDate] = useState(initialData?.date || todayStr);
  const [tripId, setTripId] = useState(initialData?.tripId || defaultTripId || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setError('Please provide an expense description.');
      return;
    }

    const numAmount = parseFloat(amount.trim());
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!date) {
      setError('Please specify a valid date.');
      return;
    }

    let effectiveCat = category;
    if (isAddingCustom && newCustomCategory.trim()) {
      effectiveCat = newCustomCategory.trim();
      addCustomCategory(effectiveCat);
    }

    onSave({
      description: trimmedDesc,
      amount: numAmount,
      category: effectiveCat,
      date,
      tripId: tripId || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <Input
        label="Description"
        placeholder="e.g. Textbook, Bus fare, Mess coupon, Dinner"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label={`Amount (${currencyConfig.symbol})`}
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Category
            </label>
            <button
              type="button"
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="text-[11px] text-[#0D5C46] dark:text-emerald-400 hover:underline"
            >
              {isAddingCustom ? 'Pick Existing' : '+ Custom'}
            </button>
          </div>

          {isAddingCustom ? (
            <input
              type="text"
              placeholder="New Category Name"
              value={newCustomCategory}
              onChange={(e) => setNewCustomCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 focus:border-[#0D5C46] outline-none"
            />
          ) : (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Link to Trip (Optional)
          </label>
          <select
            value={tripId}
            onChange={(e) => {
              setTripId(e.target.value);
              if (e.target.value && category !== 'Travel') {
                setCategory('Travel');
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="">None (General campus spending)</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tripName} ({t.destination})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Notes (Optional)"
        placeholder="e.g. Paid via UPI, split 50/50 with roommate"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Expense' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}

export function ExpenseModal({
  isOpen,
  onClose,
  initialData,
  defaultTripId,
}: ExpenseModalProps) {
  const { addExpense, updateExpense } = useMoney();

  const handleSave = (data: {
    description: string;
    amount: number;
    category: string;
    date: string;
    tripId?: string;
    notes?: string;
  }) => {
    if (initialData) {
      updateExpense(initialData.id, data);
    } else {
      addExpense(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense' : 'Log New Expense'}
      description="Reflects in daily, monthly, category, and connected trip budgets."
      maxWidth="md"
    >
      <ExpenseForm
        key={initialData?.id || (isOpen ? 'open' : 'closed')}
        initialData={initialData}
        defaultTripId={defaultTripId}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
