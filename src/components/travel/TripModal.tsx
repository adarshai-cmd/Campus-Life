'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useTravel } from '@/context/TravelContext';
import { Trip, TRAVEL_MODES, TravelMode } from '@/types/travel';
import { getLocalDateString } from '@/utils/dateUtils';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Trip | null;
}

function TripForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: Trip | null;
  onSave: (data: Omit<Trip, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const todayStr = getLocalDateString();

  const [tripName, setTripName] = useState(initialData?.tripName || '');
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || todayStr);
  const [endDate, setEndDate] = useState(initialData?.endDate || todayStr);
  const [durationDays, setDurationDays] = useState(String(initialData?.durationDays || 2));
  const [startingLocation, setStartingLocation] = useState(
    initialData?.startingLocation || 'Hostel Campus'
  );
  const [travelMode, setTravelMode] = useState<TravelMode>(initialData?.travelMode || 'Bus');
  const [distanceKm, setDistanceKm] = useState(String(initialData?.distanceKm || ''));
  const [purpose, setPurpose] = useState(initialData?.purpose || 'Home Visit');
  const [plannedBudget, setPlannedBudget] = useState(String(initialData?.plannedBudget || '10000'));
  const [numberOfPeople, setNumberOfPeople] = useState(String(initialData?.numberOfPeople || '1'));
  const [splitBasis, setSplitBasis] = useState<'actual' | 'budget'>(initialData?.splitBasis || 'actual');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 0) {
      setDurationDays(String(diffDays));
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    calculateDays(val, endDate);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    calculateDays(startDate, val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripName.trim()) {
      setError('Please provide a trip name (e.g. "Diwali Break" or "Rishikesh Weekend").');
      return;
    }

    if (!destination.trim()) {
      setError('Please provide a destination.');
      return;
    }

    if (!startDate) {
      setError('Please provide a start date.');
      return;
    }

    const dur = parseInt(durationDays, 10);
    const dist = parseFloat(distanceKm) || 0;
    const budget = Math.max(0, parseFloat(plannedBudget) || 0);
    const people = Math.max(1, parseInt(numberOfPeople, 10) || 1);

    onSave({
      tripName: tripName.trim(),
      destination: destination.trim(),
      startDate,
      endDate: endDate || startDate,
      durationDays: dur > 0 ? dur : 1,
      startingLocation: startingLocation.trim() || 'Campus',
      travelMode,
      distanceKm: dist,
      purpose: purpose.trim() || 'Personal',
      plannedBudget: budget,
      numberOfPeople: people,
      splitBasis,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Trip Name"
          placeholder="e.g. Home Visit / Rishikesh Trek"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          autoFocus
          required
        />

        <Input
          label="Destination"
          placeholder="e.g. Lucknow, Pune, Rishikesh"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          required
        />

        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          required
        />

        <Input
          label="Duration (Days)"
          type="number"
          min="1"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Input
          label="Starting Location"
          placeholder="e.g. Hostel Block B"
          value={startingLocation}
          onChange={(e) => setStartingLocation(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Travel Mode
          </label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as TravelMode)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
          >
            {TRAVEL_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Distance (km)"
          type="number"
          min="0"
          placeholder="e.g. 250"
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
        />
      </div>

      {/* Budget & Group Split Settings (Phase 2 Requirement) */}
      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
          Trip Budget & Group Split
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Planned Budget (₹)"
            type="number"
            min="0"
            step="1"
            placeholder="10000"
            value={plannedBudget}
            onChange={(e) => setPlannedBudget(e.target.value)}
            helperText="Editable cap"
          />

          <Input
            label="Number of People"
            type="number"
            min="1"
            placeholder="8"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(e.target.value)}
            helperText="For per-person split"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Split Basis
            </label>
            <select
              value={splitBasis}
              onChange={(e) => setSplitBasis(e.target.value as 'actual' | 'budget')}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="actual">Actual Spending</option>
              <option value="budget">Planned Budget</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Purpose"
          placeholder="e.g. Home Visit, Weekend Getaway, Hackathon"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Train ticket booked on 3A, seat 42"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Trip' : 'Save Trip'}
        </Button>
      </div>
    </form>
  );
}

export function TripModal({ isOpen, onClose, initialData }: TripModalProps) {
  const { addTrip, updateTrip } = useTravel();

  const handleSave = (data: Omit<Trip, 'id' | 'createdAt'>) => {
    if (initialData) {
      updateTrip(initialData.id, data);
    } else {
      addTrip(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Trip' : 'Plan New Trip'}
      description="Track transit bookings, routes, and link expenses to this itinerary."
      maxWidth="md"
    >
      <TripForm
        key={initialData?.id || 'new_trip'}
        initialData={initialData}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
}
