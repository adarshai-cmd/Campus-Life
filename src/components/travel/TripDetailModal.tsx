'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { TripWithExpenses } from '@/types/travel';
import { Expense } from '@/types/money';
import { useMoney } from '@/context/MoneyContext';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { TripExpenseModal } from './TripExpenseModal';
import { formatDateSafe } from '@/utils/dateUtils';
import {
  MapPin,
  Calendar,
  Compass,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Users,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripWithExpenses | null;
  onEditTrip?: (trip: TripWithExpenses) => void;
}

export function TripDetailModal({
  isOpen,
  onClose,
  trip,
  onEditTrip,
}: TripDetailModalProps) {
  const { getExpensesForTrip, deleteExpense } = useMoney();
  const { deleteTrip, updateTripBudget, updateTripSplit } = useTravel();
  const { activeProfile } = useProfile();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // In-modal quick edit state for planned budget
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Per-person split settings
  const [splitBasis, setSplitBasis] = useState<'actual' | 'budget'>('actual');
  const [peopleCount, setPeopleCount] = useState<number>(1);

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  if (!trip) return null;

  const tripExpenses = getExpensesForTrip(trip.id);
  const totalActualSpent = tripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const plannedBudget = Number(trip.plannedBudget) || 0;
  const remainingBudget = plannedBudget - totalActualSpent;
  const isOverBudget = remainingBudget < 0 && plannedBudget > 0;
  const budgetPercentageUsed =
    plannedBudget > 0 ? Math.min(100, Math.round((totalActualSpent / plannedBudget) * 100)) : 0;

  // Split calculation
  const effectivePeople = Math.max(1, peopleCount || trip.numberOfPeople || 1);
  const effectiveSplitBasis = splitBasis || trip.splitBasis || 'actual';
  const splitBaseAmount = effectiveSplitBasis === 'budget' ? plannedBudget : totalActualSpent;
  const costPerPerson = Math.round((splitBaseAmount / effectivePeople) * 100) / 100;

  const handleOpenBudgetEdit = () => {
    setBudgetInput(String(plannedBudget));
    setIsEditingBudget(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Math.max(0, parseFloat(budgetInput) || 0);
    updateTripBudget(trip.id, parsed);
    setIsEditingBudget(false);
  };

  const handleUpdatePeople = (val: number) => {
    const cleanVal = Math.max(1, val);
    setPeopleCount(cleanVal);
    updateTripSplit(trip.id, cleanVal, effectiveSplitBasis);
  };

  const handleUpdateBasis = (basis: 'actual' | 'budget') => {
    setSplitBasis(basis);
    updateTripSplit(trip.id, effectivePeople, basis);
  };

  const handleDeleteTrip = () => {
    if (confirm(`Are you sure you want to delete trip "${trip.tripName}"? Linked expenses will be preserved in Money desk.`)) {
      deleteTrip(trip.id);
      onClose();
    }
  };

  const formattedDate = formatDateSafe(trip.startDate, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Modal
        isOpen={isOpen && !isExpenseModalOpen}
        onClose={onClose}
        title={trip.tripName}
        description={`${trip.destination} · ${trip.durationDays} Days · from ${trip.startingLocation}`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Trip Summary Overview Bar (Requirement 13) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850/70 border border-slate-200/70 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                Destination
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400 shrink-0" />
                {trip.destination}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                Dates & Duration
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {formattedDate} ({trip.durationDays}d)
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                Mode & Distance
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5 truncate">
                <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {trip.travelMode} ({trip.distanceKm} km)
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                Purpose
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                {trip.purpose || 'Personal'}
              </span>
            </div>
          </div>

          {/* Section 1: Trip Budget vs Actual Cost (Requirements 7, 8, 11) */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Trip Budget & Spending Health
                </h3>
              </div>

              {!isEditingBudget ? (
                <button
                  onClick={handleOpenBudgetEdit}
                  className="text-xs font-semibold text-[#0D5C46] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Planned Budget</span>
                </button>
              ) : (
                <form onSubmit={handleSaveBudget} className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-24 px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 outline-none font-mono"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="primary" className="text-xs px-2 py-1">
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingBudget(false)}
                    className="text-xs px-2 py-1"
                  >
                    Cancel
                  </Button>
                </form>
              )}
            </div>

            {/* Clear distinction: Planned Budget vs Actual Spent vs Remaining */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Planned Budget
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {currencyConfig.symbol}
                  {plannedBudget.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Actual Spent
                </span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                  {currencyConfig.symbol}
                  {totalActualSpent.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Remaining / Difference
                </span>
                <span
                  className={`text-lg font-bold font-mono mt-0.5 block ${
                    isOverBudget
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {isOverBudget ? '-' : ''}
                  {currencyConfig.symbol}
                  {Math.abs(remainingBudget).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual Budget Progress Bar */}
            {plannedBudget > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {currencyConfig.symbol}
                    {totalActualSpent.toLocaleString()} of {currencyConfig.symbol}
                    {plannedBudget.toLocaleString()} used
                  </span>
                  {isOverBudget ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {currencyConfig.symbol}
                      {Math.abs(remainingBudget).toLocaleString()} over limit
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {budgetPercentageUsed}% used
                    </span>
                  )}
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-rose-500' : 'bg-[#0D5C46] dark:bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (totalActualSpent / plannedBudget) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Split Trip Cost (Requirement 12) */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Split Trip Cost
                </h3>
              </div>

              {/* Basis Selector Toggle */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Split Basis:</span>
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => handleUpdateBasis('actual')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      effectiveSplitBasis === 'actual'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Actual Spent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateBasis('budget')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      effectiveSplitBasis === 'budget'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Planned Budget
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Number of People
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={effectivePeople}
                    onChange={(e) => handleUpdatePeople(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <span className="text-xs text-slate-400">members</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Base Amount ({effectiveSplitBasis === 'budget' ? 'Budget' : 'Actual'})
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 block">
                  {currencyConfig.symbol}
                  {splitBaseAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                  Cost Per Person
                </span>
                <span className="text-xl font-bold font-mono text-purple-900 dark:text-purple-100 mt-0.5 block">
                  {currencyConfig.symbol}
                  {costPerPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-purple-600/80 dark:text-purple-400 block">
                  ({currencyConfig.symbol}{splitBaseAmount.toLocaleString()} ÷ {effectivePeople})
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Trip Expense Breakdown (Requirements 9, 10, 11) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Trip Expense Breakdown ({tripExpenses.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            {tripExpenses.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  No expenses linked to this trip yet.
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Log entries such as Scooty Rent, Hotel stay, Food, Shopping, or Bus tickets.
                </span>
                <div className="mt-2.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingExpense(null);
                      setIsExpenseModalOpen(true);
                    }}
                  >
                    + Add First Trip Expense
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tripExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                          {exp.description}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {exp.tripSubCategory || exp.category}
                          </span>
                          <span>·</span>
                          <span>{exp.date}</span>
                          {exp.notes && (
                            <>
                              <span>·</span>
                              <span className="truncate italic max-w-[120px]">{exp.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {currencyConfig.symbol}
                        {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsExpenseModalOpen(true);
                          }}
                          title="Edit expense"
                          className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExpense(exp.id)}
                          title="Delete expense"
                          className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteTrip}
              className="gap-1.5 text-xs w-full sm:w-auto min-h-[40px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Trip</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onEditTrip && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEditTrip(trip);
                  }}
                  className="text-xs flex-1 sm:flex-initial min-h-[40px]"
                >
                  Edit Itinerary
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs flex-1 sm:flex-initial min-h-[40px]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <TripExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        tripId={trip.id}
        tripName={trip.tripName}
        initialExpense={editingExpense}
      />
    </>
  );
}
