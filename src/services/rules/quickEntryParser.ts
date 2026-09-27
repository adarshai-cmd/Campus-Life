import { ParsedExpenseDraft } from '@/types/money';
import { detectExpenseCategory } from './categorizer';

export function parseQuickExpenseInput(input: string): ParsedExpenseDraft | null {
  if (!input || !input.trim()) return null;

  const raw = input.trim();

  // Pattern 1: Look for numbers (possibly with currency symbol ₹, $, etc.) at the end or beginning
  // Examples: "Book 450", "Train Dehradun 780", "Lunch 120", "₹500 Groceries", "450 Book"

  // Regex to extract amount from string
  // Matches digits optionally preceded by currency symbols, e.g., "450", "₹450", "120.50"
  const amountRegexEnd = /(?:^|\s)(?:₹|\$|€|£|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)\s*$/i;
  const amountRegexStart = /^\s*(?:₹|\$|€|£|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)(?:\s+|$)/i;

  let amount = 0;
  let description = '';

  const matchEnd = raw.match(amountRegexEnd);
  if (matchEnd && matchEnd[1]) {
    amount = parseFloat(matchEnd[1]);
    description = raw.slice(0, matchEnd.index).trim();
  } else {
    const matchStart = raw.match(amountRegexStart);
    if (matchStart && matchStart[1]) {
      amount = parseFloat(matchStart[1]);
      description = raw.slice(matchStart[0].length).trim();
    } else {
      // General match anywhere in the string if followed or preceded by space
      const anyNumberMatch = raw.match(/\b(\d+(?:\.\d{1,2})?)\b/);
      if (anyNumberMatch) {
        amount = parseFloat(anyNumberMatch[1]);
        description = raw.replace(anyNumberMatch[0], '').trim();
      }
    }
  }

  // Clean description of unwanted filler words e.g. "for", "rs", "inr", "₹"
  description = description
    .replace(/^(?:for|at|rs\.?|inr|₹|\$)\s+/i, '')
    .replace(/\s+(?:for|at|rs\.?|inr|₹|\$)$/i, '')
    .trim();

  if (!description && amount > 0) {
    description = 'Expense';
  }

  if (amount < 0 || isNaN(amount)) {
    return null;
  }

  const category = detectExpenseCategory(description);

  return {
    description: description || 'Expense',
    amount,
    category,
    rawInput: raw,
  };
}
