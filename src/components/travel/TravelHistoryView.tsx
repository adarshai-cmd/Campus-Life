'use client';

import React, { useState, useMemo } from 'react';
import { useTravel } from '@/context/TravelContext';
import { useProfile } from '@/context/ProfileContext';
import { SUPPORTED_CURRENCIES } from '@/types/profile';
import { TripWithExpenses, TRAVEL_MODES } from '@/types/travel';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { TripModal } from './TripModal';
import { TripDetailModal } from './TripDetailModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Calendar,
  Compass,
  ArrowUpRight,
  Users,
  Receipt,
  X,
} from 'lucide-react';

export function TravelHistoryView({ onOpenNewTrip }: { onOpenNewTrip: () => void }) {
  const { tripsWithExpenses } = useTravel();
  const { activeProfile } = useProfile();

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [destinationFilter, setDestinationFilter] = useState<string>('ALL');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [costFilter, setCostFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'cost-desc' | 'cost-asc' | 'budget-desc'>('date-desc');

  const [selectedTrip, setSelectedTrip] = useState<TripWithExpenses | null>(null);
  const [editingTrip, setEditingTrip] = useState<TripWithExpenses | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === activeProfile?.currency) ||
    SUPPORTED_CURRENCIES[0];

  // Distinct available months across trips
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    tripsWithExpenses.forEach((t) => {
      if (t.startDate) {
        months.add(t.startDate.substring(0, 7));
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [tripsWithExpenses]);

  // Distinct destinations
  const availableDestinations = useMemo(() => {
    const dests = new Set<string>();
    tripsWithExpenses.forEach((t) => {
      const d = t.destination.trim();
      if (d) dests.add(d);
    });
    return Array.from(dests).sort();
  }, [tripsWithExpenses]);

  const hasActiveFilters =
    search.trim() !== '' ||
    monthFilter !== 'ALL' ||
    destinationFilter !== 'ALL' ||
    modeFilter !== 'ALL' ||
    costFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setMonthFilter('ALL');
    setDestinationFilter('ALL');
    setModeFilter('ALL');
    setCostFilter('ALL');
  };

  const filteredTrips = useMemo(() => {
    return tripsWithExpenses
      .filter((t) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = t.tripName.toLowerCase().includes(q);
          const matchDest = t.destination.toLowerCase().includes(q);
          const matchOrigin = t.startingLocation.toLowerCase().includes(q);
          const matchPurpose = t.purpose.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q) || false;
          if (!matchName && !matchDest && !matchOrigin && !matchPurpose && !matchNotes) {
            return false;
          }
        }

        // Month filter
        if (monthFilter !== 'ALL') {
          const startMonth = t.startDate?.substring(0, 7);
          const endMonth = t.endDate?.substring(0, 7);
          if (startMonth !== monthFilter && endMonth !== monthFilter) {
            return false;
          }
        }

        // Destination filter
        if (destinationFilter !== 'ALL' && t.destination.trim() !== destinationFilter) {
          return false;
        }

        // Travel Mode filter
        if (modeFilter !== 'ALL' && t.travelMode !== modeFilter) {
          return false;
        }

        // Cost filter
        if (costFilter !== 'ALL') {
          const cost = t.totalCost || 0;
          if (costFilter === 'UNDER_1K' && cost >= 1000) return false;
          if (costFilter === '1K_5K' && (cost < 1000 || cost > 5000)) return false;
          if (costFilter === '5K_10K' && (cost <= 5000 || cost > 10000)) return false;
          if (costFilter === 'ABOVE_10K' && cost <= 10000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return (b.startDate || '').localeCompare(a.startDate || '');
        }
        if (sortBy === 'date-asc') {
          return (a.startDate || '').localeCompare(b.startDate || '');
        }
        if (sortBy === 'cost-desc') {
          return (b.totalCost || 0) - (a.totalCost || 0);
        }
        if (sortBy === 'cost-asc') {
          return (a.totalCost || 0) - (b.totalCost || 0);
        }
        if (sortBy === 'budget-desc') {
          return (b.plannedBudget || 0) - (a.plannedBudget || 0);
        }
        return 0;
      });
  }, [
    tripsWithExpenses,
    search,
    monthFilter,
    destinationFilter,
    modeFilter,
    costFilter,
    sortBy,
  ]);

  // Format month YYYY-MM helper
  const formatMonthLabel = (m: string) => {
    try {
      const [year, month] = m.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch {
      return m;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Controls Bar (Search + Filter by Month, Destination, Travel Mode, Cost + Sort) */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trip name, destination, route, purpose..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-[#0D5C46] dark:focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-slate-700 dark:text-slate-300 outline-none font-medium text-xs cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="cost-desc">Cost: High to Low</option>
                <option value="cost-asc">Cost: Low to High</option>
                <option value="budget-desc">Budget: High to Low</option>
              </select>
            </div>
          </div>

          {/* Practical Filters Row (Requirement 14: Month, Destination, Travel Mode, Cost) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>

            {/* Destination Filter */}
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Destinations</option>
              {availableDestinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Travel Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              {TRAVEL_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>

            {/* Cost Filter */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Costs</option>
              <option value="UNDER_1K">Under {currencyConfig.symbol}1,000</option>
              <option value="1K_5K">{currencyConfig.symbol}1,000 – {currencyConfig.symbol}5,000</option>
              <option value="5K_10K">{currencyConfig.symbol}5,000 – {currencyConfig.symbol}10,000</option>
              <option value="ABOVE_10K">Above {currencyConfig.symbol}10,000</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors font-medium ml-auto"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Trips Grid (Requirement 13: Summary on each trip) */}
        {filteredTrips.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={tripsWithExpenses.length === 0 ? 'No trips planned yet' : 'No matching trips found'}
            description={
              tripsWithExpenses.length === 0
                ? 'Record your semester break home visits, weekend train/bus travels, and track transit costs.'
                : 'Try adjusting your search keywords, month, destination, or cost filters.'
            }
            actionLabel={tripsWithExpenses.length === 0 ? '+ Plan First Trip' : 'Clear Filters'}
            onAction={tripsWithExpenses.length === 0 ? onOpenNewTrip : resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrips.map((trip) => {
              const formattedDate = trip.startDate
                ? new Date(trip.startDate + 'T00:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—';

              const isOverBudget = trip.remainingBudget < 0 && trip.plannedBudget > 0;

              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="glass-card rounded-2xl p-5 cursor-pointer hover:border-[#0D5C46]/50 dark:hover:border-emerald-500/50 transition-all duration-150 flex flex-col justify-between group shadow-xs hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    {/* Header: Travel mode, Distance, Trip name & arrow */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant="accent" size="sm">
                            <Compass className="w-3 h-3 mr-1" />
                            {trip.travelMode}
                          </Badge>
                          {trip.distanceKm > 0 && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              {trip.distanceKm} km
                            </span>
                          )}
                          {trip.purpose && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              · {trip.purpose}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0D5C46] dark:group-hover:text-emerald-400 transition-colors">
                          {trip.tripName}
                        </h3>
                      </div>
                      <span className="p-1 rounded-lg text-slate-400 group-hover:text-[#0D5C46] dark:group-hover:text-emerald-400 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Route and Dates */}
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0D5C46] dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {trip.destination}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">from {trip.startingLocation}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>{formattedDate}</span>
                        <span>·</span>
                        <span>{trip.durationDays} {trip.durationDays === 1 ? 'Day' : 'Days'}</span>
                      </div>
                    </div>

                    {/* Trip Financial Summary (Requirement 13: Planned Budget, Actual Spending, Remaining) */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 block">
                          Budget
                        </span>
                        <span className="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-0.5 block truncate">
                          {currencyConfig.symbol}
                          {trip.plannedBudget.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 block">
                          Spent
                        </span>
                        <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm mt-0.5 block truncate">
                          {currencyConfig.symbol}
                          {trip.totalCost.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 block">
                          Remaining
                        </span>
                        <span
                          className={`font-bold font-mono text-xs sm:text-sm mt-0.5 block truncate ${
                            isOverBudget
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isOverBudget ? '-' : ''}
                          {currencyConfig.symbol}
                          {Math.abs(trip.remainingBudget).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Per-Person Split Info (Requirement 12 & 13) */}
                    <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                      <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {trip.numberOfPeople} {trip.numberOfPeople === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-purple-900 dark:text-purple-200">
                        {currencyConfig.symbol}
                        {trip.costPerPerson.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / person
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Expense count & Click cue */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {trip.expenseCount} {trip.expenseCount === 1 ? 'expense' : 'expenses'} logged
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#0D5C46] dark:text-emerald-400 group-hover:underline">
                      View Breakdown & Split →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TripDetailModal
        isOpen={selectedTrip !== null}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
        onEditTrip={(t) => {
          setEditingTrip(t);
          setIsEditModalOpen(true);
        }}
      />

      <TripModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTrip(null);
        }}
        initialData={editingTrip}
      />
    </>
  );
}
