'use client';

import React, { useState, useMemo } from 'react';
import { useMoney } from '@/context/MoneyContext';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { Expense } from '@/types/money';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ExpenseModal } from './ExpenseModal';
import {
  Search,
  ArrowUpDown,
  Filter,
  Edit2,
  Trash2,
  Plane,
  ReceiptText,
} from 'lucide-react';

export function ExpenseTable() {
  const { expenses, deleteExpense, categories } = useMoney();
  const { trips } = useTravel();
  const { activeProfile } = useProfile();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [tripFilter, setTripFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  const tripMap = useMemo(() => {
    const map = new Map<string, string>();
    trips.forEach((t) => map.set(t.id, t.tripName));
    return map;
  }, [trips]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchDesc = exp.description.toLowerCase().includes(q);
          const matchNotes = exp.notes?.toLowerCase().includes(q) || false;
          const matchCat = exp.category.toLowerCase().includes(q);
          const matchTrip = exp.tripId ? (tripMap.get(exp.tripId)?.toLowerCase().includes(q) || false) : false;
          if (!matchDesc && !matchNotes && !matchCat && !matchTrip) return false;
        }

        // Category filter
        if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) {
          return false;
        }

        // Trip filter
        if (tripFilter !== 'ALL') {
          if (tripFilter === 'HAS_TRIP' && !exp.tripId) return false;
          if (tripFilter === 'NO_TRIP' && exp.tripId) return false;
          if (tripFilter !== 'HAS_TRIP' && tripFilter !== 'NO_TRIP' && exp.tripId !== tripFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const comp = (b.date || '').localeCompare(a.date || '');
          return sortOrder === 'asc' ? -comp : comp;
        } else {
          const comp = (b.amount || 0) - (a.amount || 0);
          return sortOrder === 'asc' ? -comp : comp;
        }
      });
  }, [expenses, search, categoryFilter, tripFilter, sortField, sortOrder, tripMap]);

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-5 space-y-4">
        {/* Table Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-[#0D5C46] dark:focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 outline-none font-medium"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs">
              <Plane className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={tripFilter}
                onChange={(e) => setTripFilter(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 outline-none font-medium"
              >
                <option value="ALL">All Transactions</option>
                <option value="HAS_TRIP">Trip Expenses Only</option>
                <option value="NO_TRIP">Campus / Daily Only</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    Trip: {t.tripName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={() => {
                if (sortField === 'date') {
                  if (sortOrder === 'desc') setSortOrder('asc');
                  else {
                    setSortField('amount');
                    setSortOrder('desc');
                  }
                } else {
                  if (sortOrder === 'desc') setSortOrder('asc');
                  else {
                    setSortField('date');
                    setSortOrder('desc');
                  }
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {sortField === 'date' ? 'Date' : 'Amount'} ({sortOrder === 'desc' ? 'High' : 'Low'})
              </span>
            </button>
          </div>
        </div>

        {/* Content View: Mobile Card Stream (< sm) & Full Table (>= sm) */}
        {filteredExpenses.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
            description={
              expenses.length === 0
                ? 'Your transactions will appear here once logged via the quick input bar or + Log Expense button.'
                : 'Try adjusting your search query or category filters.'
            }
          />
        ) : (
          <>
            {/* Mobile Cards List (< sm) */}
            <div className="block sm:hidden space-y-2.5">
              {filteredExpenses.map((exp) => {
                const tripName = exp.tripId ? tripMap.get(exp.tripId) : null;
                const formattedDate = exp.date
                  ? new Date(exp.date + 'T00:00:00').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—';

                return (
                  <div
                    key={`mobile-${exp.id}`}
                    className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {exp.description}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {formattedDate}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-base text-slate-900 dark:text-emerald-400">
                          {currencyConfig.symbol}
                          {Number(exp.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <Badge
                        variant={
                          exp.category === 'Education'
                            ? 'accent'
                            : exp.category === 'Food'
                            ? 'warning'
                            : exp.category === 'Travel'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {exp.category}
                      </Badge>

                      {tripName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          <Plane className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{tripName}</span>
                        </span>
                      )}
                    </div>

                    {exp.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        {exp.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[36px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[36px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= sm) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Description</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Trip</th>
                    <th className="py-3 px-3.5">Notes</th>
                    <th className="py-3 px-3.5 text-right">Amount</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredExpenses.map((exp) => {
                    const tripName = exp.tripId ? tripMap.get(exp.tripId) : null;
                    const formattedDate = exp.date
                      ? new Date(exp.date + 'T00:00:00').toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—';

                    return (
                      <tr
                        key={exp.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        <td className="py-3 px-3.5 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                          {exp.description}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <Badge
                            variant={
                              exp.category === 'Education'
                                ? 'accent'
                                : exp.category === 'Food'
                                ? 'warning'
                                : exp.category === 'Travel'
                                ? 'info'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {exp.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                          {tripName ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <Plane className="w-3 h-3" />
                              {tripName}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                          {exp.notes || '—'}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {currencyConfig.symbol}
                          {Number(exp.amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(exp)}
                              title="Edit expense"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              title="Delete expense"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />
    </>
  );
}
