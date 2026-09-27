'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Trip, TripWithExpenses, TravelAnalyticsData, TravelMode } from '@/types/travel';
import { Expense } from '@/types/money';
import { storageService } from '@/services/storage/storageService';
import { useProfile } from './ProfileContext';
import { useMoney } from './MoneyContext';

interface TravelContextType {
  trips: Trip[];
  tripsWithExpenses: TripWithExpenses[];
  analytics: TravelAnalyticsData;
  addTrip: (tripData: Omit<Trip, 'id' | 'createdAt'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addTripExpense: (
    tripId: string,
    data: {
      description: string;
      amount: number;
      category?: string;
      tripSubCategory?: string;
      date?: string;
      notes?: string;
    }
  ) => void;
  updateTripExpense: (expenseId: string, updates: Partial<Expense>) => void;
  deleteTripExpense: (expenseId: string) => void;
  updateTripBudget: (tripId: string, plannedBudget: number) => void;
  updateTripSplit: (tripId: string, numberOfPeople: number, splitBasis?: 'actual' | 'budget') => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

const STORAGE_KEY_TRIPS = 'trips_v2';

export function TravelProvider({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile();
  const { expenses, addExpense, updateExpense, deleteExpense } = useMoney();
  const profileId = activeProfile?.id;

  const [trips, setTrips] = useState<Trip[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<Trip[]>(profileId, STORAGE_KEY_TRIPS) || [];
  });

  const addTrip = useCallback(
    (tripData: Omit<Trip, 'id' | 'createdAt'>): Trip => {
      const newTrip: Trip = {
        ...tripData,
        plannedBudget: Math.max(0, Number(tripData.plannedBudget) || 0),
        numberOfPeople: Math.max(1, Number(tripData.numberOfPeople) || 1),
        splitBasis: tripData.splitBasis || 'actual',
        id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      setTrips((prev) => {
        const next = [newTrip, ...prev];
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_TRIPS, next);
        }
        return next;
      });

      return newTrip;
    },
    [profileId]
  );

  const updateTrip = useCallback(
    (id: string, updates: Partial<Trip>) => {
      setTrips((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_TRIPS, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const deleteTrip = useCallback(
    (id: string) => {
      setTrips((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_TRIPS, next);
        }
        return next;
      });

      // Unlink any expenses that were linked to this trip
      expenses
        .filter((e) => e.tripId === id)
        .forEach((e) => {
          updateExpense(e.id, { tripId: undefined });
        });
    },
    [profileId, expenses, updateExpense]
  );

  const updateTripBudget = useCallback(
    (tripId: string, plannedBudget: number) => {
      updateTrip(tripId, { plannedBudget: Math.max(0, Number(plannedBudget) || 0) });
    },
    [updateTrip]
  );

  const updateTripSplit = useCallback(
    (tripId: string, numberOfPeople: number, splitBasis?: 'actual' | 'budget') => {
      updateTrip(tripId, {
        numberOfPeople: Math.max(1, Number(numberOfPeople) || 1),
        ...(splitBasis ? { splitBasis } : {}),
      });
    },
    [updateTrip]
  );

  const addTripExpense = useCallback(
    (
      tripId: string,
      data: {
        description: string;
        amount: number;
        category?: string;
        tripSubCategory?: string;
        date?: string;
        notes?: string;
      }
    ) => {
      const todayStr = new Date().toISOString().split('T')[0];
      addExpense({
        description: data.description.trim() || 'Trip Expense',
        amount: Number(data.amount) || 0,
        category: data.category || 'Travel',
        categoryId: data.category || 'Travel',
        tripId,
        tripSubCategory: data.tripSubCategory || 'Transport',
        date: data.date || todayStr,
        notes: data.notes,
      });
    },
    [addExpense]
  );

  const updateTripExpense = useCallback(
    (expenseId: string, updates: Partial<Expense>) => {
      updateExpense(expenseId, updates);
    },
    [updateExpense]
  );

  const deleteTripExpense = useCallback(
    (expenseId: string) => {
      deleteExpense(expenseId);
    },
    [deleteExpense]
  );

  const tripsWithExpenses: TripWithExpenses[] = useMemo(() => {
    return trips.map((trip) => {
      const tripExpenses = expenses.filter((e) => e.tripId === trip.id);
      const totalCost = tripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const plannedBudget = Number(trip.plannedBudget) || 0;
      const remainingBudget = plannedBudget - totalCost;
      const numPeople = Math.max(1, Number(trip.numberOfPeople) || 1);
      const splitBasis = trip.splitBasis || 'actual';
      const splitBaseAmount = splitBasis === 'budget' ? plannedBudget : totalCost;
      const costPerPerson = Math.round((splitBaseAmount / numPeople) * 100) / 100;

      return {
        ...trip,
        plannedBudget,
        numberOfPeople: numPeople,
        splitBasis,
        totalCost,
        expenseCount: tripExpenses.length,
        remainingBudget,
        costPerPerson,
      };
    });
  }, [trips, expenses]);

  const analytics: TravelAnalyticsData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYearMonth = todayStr.substring(0, 7);

    const totalTrips = tripsWithExpenses.length;
    let tripsThisMonth = 0;
    let totalDistanceKm = 0;
    const destinationCounts: Record<string, number> = {};
    const transportCounts: Record<string, number> = {};

    let mostExpensive: { tripName: string; cost: number } | null = null;

    const futureTrips = tripsWithExpenses
      .filter((t) => (t.endDate || t.startDate) >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const upcomingTrip = futureTrips.length > 0 ? futureTrips[0] : null;

    for (const trip of tripsWithExpenses) {
      if (trip.startDate && trip.startDate.startsWith(currentYearMonth)) {
        tripsThisMonth++;
      }
      totalDistanceKm += Number(trip.distanceKm) || 0;

      const dest = trip.destination.trim();
      if (dest) {
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      }

      if (trip.travelMode) {
        transportCounts[trip.travelMode] = (transportCounts[trip.travelMode] || 0) + 1;
      }

      if (!mostExpensive || trip.totalCost > mostExpensive.cost) {
        if (trip.totalCost > 0) {
          mostExpensive = { tripName: trip.tripName, cost: trip.totalCost };
        }
      }
    }

    let mostVisitedDestination: string | null = null;
    let maxDestCount = 0;
    for (const [dest, count] of Object.entries(destinationCounts)) {
      if (count > maxDestCount) {
        maxDestCount = count;
        mostVisitedDestination = dest;
      }
    }

    let mostUsedTransport: TravelMode | null = null;
    let maxTransCount = 0;
    for (const [mode, count] of Object.entries(transportCounts)) {
      if (count > maxTransCount) {
        maxTransCount = count;
        mostUsedTransport = mode as TravelMode;
      }
    }

    let totalTravelSpending = 0;
    let travelSpendingThisMonth = 0;
    const monthlySpendingMap: Record<string, number> = {};

    for (const exp of expenses) {
      if (exp.category === 'Travel' || exp.tripId) {
        const amt = Number(exp.amount) || 0;
        totalTravelSpending += amt;
        if (exp.date && exp.date.startsWith(currentYearMonth)) {
          travelSpendingThisMonth += amt;
        }

        if (exp.date) {
          const monthKey = exp.date.substring(0, 7);
          monthlySpendingMap[monthKey] = (monthlySpendingMap[monthKey] || 0) + amt;
        }
      }
    }

    const averageTripCost = totalTrips > 0 ? Math.round(totalTravelSpending / totalTrips) : 0;

    const monthlySpending = Object.entries(monthlySpendingMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([monthKey, amount]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthLabel = date.toLocaleString('default', { month: 'short' });
        return { monthLabel, amount };
      });

    return {
      totalTrips,
      tripsThisMonth,
      totalTravelSpending,
      travelSpendingThisMonth,
      averageTripCost,
      totalDistanceKm,
      upcomingTrip,
      mostVisitedDestination,
      mostExpensiveTrip: mostExpensive,
      mostUsedTransport,
      monthlySpending,
    };
  }, [tripsWithExpenses, expenses]);

  return (
    <TravelContext.Provider
      value={{
        trips,
        tripsWithExpenses,
        analytics,
        addTrip,
        updateTrip,
        deleteTrip,
        addTripExpense,
        updateTripExpense,
        deleteTripExpense,
        updateTripBudget,
        updateTripSplit,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
}
