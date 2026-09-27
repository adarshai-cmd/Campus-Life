'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useTravel } from '@/context/TravelContext';
import { useMoney } from '@/context/MoneyContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { TRAVEL_SUB_CATEGORIES, TravelSubCategory } from '@/types/travel';
import { Expense } from '@/types/money';
import { getLocalDateString } from '@/utils/dateUtils';

interface TripExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  initialExpense?: Expense | null;
}

function TripExpenseForm({
  tripId,
  initialExpense,
  onClose,
}: {
  tripId: string;
  initialExpense?: Expense | null;
  onClose: () => void;
}) {
  const { addTripExpense, updateTripExpense } = useTravel();
  const { categories } = useMoney();
  const { activeProfile } = useProfile();

  const [description, setDescription] = useState(initialExpense?.description || '');
  const [amount, setAmount] = useState(
    initialExpense?.amount !== undefined ? String(initialExpense.amount) : ''
  );
  const [category, setCategory] = useState<string>(initialExpense?.category || 'Travel');
  const [subCategory, setSubCategory] = useState<TravelSubCategory>(
    (initialExpense?.tripSubCategory as TravelSubCategory) || 'Transport'
  );
  const [date, setDate] = useState(
    initialExpense?.date || getLocalDateString()
  );
  const [notes, setNotes] = useState(initialExpense?.notes || '');
  const [error, setError] = useState('');

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const handleSubCategoryChange = (newSub: TravelSubCategory) => {
    setSubCategory(newSub);
    // Align global category appropriately
    if (newSub === 'Food') {
      setCategory('Food');
    } else if (newSub === 'Shopping') {
      setCategory('Shopping');
    } else if (newSub === 'Activities') {
      setCategory('Entertainment');
    } else if (['Transport', 'Stay', 'Local Travel', 'Tickets'].includes(newSub)) {
      setCategory('Travel');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setError('Please enter a description (e.g. Bus ticket, Hotel stay, Dhaba dinner, Scooty rent).');
      return;
    }

    const numAmount = parseFloat(amount.trim());
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const cleanAmount = Math.round(numAmount * 100) / 100;
    const effectiveCategory = category.trim() || 'Travel';

    if (initialExpense) {
      updateTripExpense(initialExpense.id, {
        description: trimmedDesc,
        amount: cleanAmount,
        category: effectiveCategory,
        categoryId: effectiveCategory,
        tripSubCategory: subCategory,
        date,
        notes: notes.trim() || undefined,
      });
    } else {
      // Automatically writes to unified Money system with tripId!
      addTripExpense(tripId, {
        description: trimmedDesc,
        amount: cleanAmount,
        category: effectiveCategory,
        tripSubCategory: subCategory,
        date,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <Input
        label="Item Description"
        placeholder="e.g. Scooty rent, Hotel, Food, Bus fare"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`Amount (${currencyConfig.symbol})`}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Trip Item Type
          </label>
          <select
            value={subCategory}
            onChange={(e) => handleSubCategoryChange(e.target.value as TravelSubCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            {TRAVEL_SUB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Money Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Notes (Optional)"
        placeholder="e.g. Split with roommates, PNR: 2481920"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialExpense ? 'Update Expense' : 'Save Trip Expense'}
        </Button>
      </div>
    </form>
  );
}

export function TripExpenseModal({
  isOpen,
  onClose,
  tripId,
  tripName,
  initialExpense,
}: TripExpenseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialExpense ? 'Edit Trip Expense' : `Add Expense to ${tripName}`}
      description="Reflects simultaneously in this trip total and your global Money dashboard."
      maxWidth="sm"
    >
      <TripExpenseForm
        key={initialExpense?.id || 'new'}
        tripId={tripId}
        initialExpense={initialExpense}
        onClose={onClose}
      />
    </Modal>
  );
}
