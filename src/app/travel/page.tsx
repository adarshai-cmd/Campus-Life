'use client';

import React, { useState } from 'react';
import { Plane, Plus } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { TravelAnalyticsView } from '@/components/travel/TravelAnalyticsView';
import { TravelHistoryView } from '@/components/travel/TravelHistoryView';
import { TripModal } from '@/components/travel/TripModal';
import { useTravel } from '@/context/TravelContext';

export default function TravelPage() {
  const { trips } = useTravel();
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="accent" size="sm">
              <Plane className="w-3.5 h-3.5 mr-1" />
              Travel Desk
            </Badge>
            <Badge variant="neutral" size="sm">
              {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'} Logged
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Travel & Home Trips
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track semester break travels home, weekend bus/train transit, and link trip expenses directly to your global ledger.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsNewTripModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Button>
      </div>

      {/* Analytics Overview */}
      <TravelAnalyticsView />

      {/* Travel History */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Travel Itineraries & Expense Records
          </h2>
          <span className="text-[11px] text-slate-400">
            Click trip to manage expenses
          </span>
        </div>
        <TravelHistoryView onOpenNewTrip={() => setIsNewTripModalOpen(true)} />
      </section>

      <TripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
      />
    </div>
  );
}
