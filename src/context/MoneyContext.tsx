'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Expense, BudgetConfig, SpendingAnalytics, DEFAULT_EXPENSE_CATEGORIES } from '@/types/money';
import { storageService } from '@/services/storage/storageService';
import { useProfile } from './ProfileContext';
import { getLocalDateString } from '@/utils/dateUtils';

interface MoneyContextType {
  expenses: Expense[];
  budgetConfig: BudgetConfig;
  categories: string[];
  analytics: SpendingAnalytics;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateBudget: (monthlyBudget: number) => void;
  addCustomCategory: (category: string) => void;
  getExpensesForTrip: (tripId: string) => Expense[];
}

const MoneyContext = createContext<MoneyContextType | undefined>(undefined);

const STORAGE_KEY_EXPENSES = 'expenses_v2';
const STORAGE_KEY_BUDGET = 'budget_config_v2';
const STORAGE_KEY_CUSTOM_CATEGORIES = 'custom_categories_v2';

export function MoneyProvider({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id;

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<Expense[]>(profileId, STORAGE_KEY_EXPENSES) || [];
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    if (!profileId) return { monthlyBudget: 12000 };
    return storageService.getItem<BudgetConfig>(profileId, STORAGE_KEY_BUDGET) || {
      monthlyBudget: 12000,
    };
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (!profileId) return [];
    return storageService.getItem<string[]>(profileId, STORAGE_KEY_CUSTOM_CATEGORIES) || [];
  });

  const categories = useMemo(() => {
    return Array.from(new Set([...DEFAULT_EXPENSE_CATEGORIES, ...customCategories]));
  }, [customCategories]);

  const addExpense = useCallback(
    (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
      const amt = Math.round((Number(data.amount) || 0) * 100) / 100;
      const newExpense: Expense = {
        ...data,
        profileId,
        categoryId: data.categoryId || data.category,
        amount: amt,
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      setExpenses((prev) => {
        const next = [newExpense, ...prev];
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_EXPENSES, next);
        }
        return next;
      });

      return newExpense;
    },
    [profileId]
  );

  const updateExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      setExpenses((prev) => {
        const next = prev.map((exp) => {
          if (exp.id !== id) return exp;
          const updatedAmount =
            updates.amount !== undefined
              ? Math.round((Number(updates.amount) || 0) * 100) / 100
              : exp.amount;
          return {
            ...exp,
            ...updates,
            amount: updatedAmount,
            categoryId: updates.categoryId || updates.category || exp.categoryId || exp.category,
          };
        });
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_EXPENSES, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => {
        const next = prev.filter((exp) => exp.id !== id);
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_EXPENSES, next);
        }
        return next;
      });
    },
    [profileId]
  );

  const updateBudget = useCallback(
    (monthlyBudget: number) => {
      const validBudget = Math.max(0, monthlyBudget);
      const newConfig = { monthlyBudget: validBudget };
      setBudgetConfig(newConfig);
      if (profileId) {
        storageService.setItem(profileId, STORAGE_KEY_BUDGET, newConfig);
      }
    },
    [profileId]
  );

  const addCustomCategory = useCallback(
    (category: string) => {
      const trimmed = category.trim();
      if (!trimmed || categories.includes(trimmed)) return;

      setCustomCategories((prev) => {
        const next = [...prev, trimmed];
        if (profileId) {
          storageService.setItem(profileId, STORAGE_KEY_CUSTOM_CATEGORIES, next);
        }
        return next;
      });
    },
    [categories, profileId]
  );

  const getExpensesForTrip = useCallback(
    (tripId: string) => {
      if (!tripId) return [];
      return expenses.filter((e) => e.tripId === tripId);
    },
    [expenses]
  );

  // Automatic calculations
  const analytics: SpendingAnalytics = useMemo(() => {
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const currentYearMonth = todayStr.substring(0, 7);

    // Start of current week (Monday)
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let totalExpenses = 0;
    let travelSpending = 0;
    let educationSpending = 0;
    let foodSpending = 0;
    const categoryTotals: Record<string, number> = {};

    categories.forEach((cat) => {
      categoryTotals[cat] = 0;
    });

    for (const exp of expenses) {
      const amt = Number(exp.amount) || 0;
      totalExpenses += amt;

      const expCategory = exp.category || 'Other';
      categoryTotals[expCategory] = (categoryTotals[expCategory] || 0) + amt;

      if (expCategory.toLowerCase() === 'education') {
        educationSpending += amt;
      } else if (expCategory.toLowerCase() === 'food') {
        foodSpending += amt;
      } else if (expCategory.toLowerCase() === 'travel' || exp.tripId) {
        travelSpending += amt;
      }

      if (exp.date === todayStr) {
        todayTotal += amt;
      }

      if (exp.date && exp.date.startsWith(currentYearMonth)) {
        monthTotal += amt;
      }

      if (exp.date) {
        try {
          const expDate = exp.date.includes('T') ? new Date(exp.date) : new Date(exp.date + 'T00:00:00');
          if (!isNaN(expDate.getTime()) && expDate >= monday && expDate <= now) {
            weekTotal += amt;
          }
        } catch {
          // ignore malformed date
        }
      }
    }

    const monthlyBudget = budgetConfig.monthlyBudget || 0;
    const remaining = monthlyBudget - monthTotal;
    const percentageUsed =
      monthlyBudget > 0 ? Math.min(100, Math.round((monthTotal / monthlyBudget) * 100)) : 0;

    return {
      todayTotal,
      weekTotal,
      monthTotal,
      totalExpenses,
      categoryTotals,
      travelSpending,
      educationSpending,
      foodSpending,
      budget: {
        monthlyBudget,
        spentThisMonth: monthTotal,
        remaining,
        percentageUsed,
      },
    };
  }, [expenses, categories, budgetConfig.monthlyBudget]);

  return (
    <MoneyContext.Provider
      value={{
        expenses,
        budgetConfig,
        categories,
        analytics,
        addExpense,
        updateExpense,
        deleteExpense,
        updateBudget,
        addCustomCategory,
        getExpensesForTrip,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}

export function useMoney() {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error('useMoney must be used within a MoneyProvider');
  }
  return context;
}
