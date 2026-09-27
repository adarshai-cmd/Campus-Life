export type DefaultExpenseCategory =
  | 'Education'
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';

export const DEFAULT_EXPENSE_CATEGORIES: DefaultExpenseCategory[] = [
  'Education',
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
];

export interface Expense {
  id: string;
  profileId?: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: string; // DefaultExpenseCategory or custom string
  categoryId?: string; // Standard category identifier
  tripId?: string; // Optional reference linking to a Trip (ENTER ONCE -> REFLECT EVERYWHERE)
  tripSubCategory?: string; // e.g. Transport, Stay, Food, Local Travel, Tickets, Activities, Shopping, Other
  notes?: string;
  createdAt: string;
}

export interface BudgetConfig {
  monthlyBudget: number; // e.g. 12000
}

export interface ParsedExpenseDraft {
  description: string;
  amount: number;
  category: string;
  rawInput: string;
}

export interface SpendingAnalytics {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  totalExpenses: number;
  categoryTotals: Record<string, number>;
  travelSpending: number;
  educationSpending: number;
  foodSpending: number;
  budget: {
    monthlyBudget: number;
    spentThisMonth: number;
    remaining: number;
    percentageUsed: number;
  };
}
