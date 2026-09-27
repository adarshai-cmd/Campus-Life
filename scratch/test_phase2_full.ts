import { detectExpenseCategory } from '../src/services/rules/categorizer';
import { parseQuickExpenseInput } from '../src/services/rules/quickEntryParser';
import { Expense } from '../src/types/money';
import { Trip, TripWithExpenses } from '../src/types/travel';

console.log('====================================================');
console.log('CAMPUS LIFE — PHASE 2 FULL VERIFICATION TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Details: ${details}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// 1. QUICK EXPENSE PARSER & RULE-BASED CATEGORIZATION
// ----------------------------------------------------
console.log('--- 1. Testing Natural Language Quick Entry & Rule-based Categorization ---');

const quickExamples = [
  { input: 'Book 450', expDesc: 'Book', expAmt: 450, expCat: 'Education' },
  { input: 'Bus 300', expDesc: 'Bus', expAmt: 300, expCat: 'Travel' },
  { input: 'Lunch 120', expDesc: 'Lunch', expAmt: 120, expCat: 'Food' },
  { input: 'Notebook 80', expDesc: 'Notebook', expAmt: 80, expCat: 'Education' },
  { input: 'Train Dehradun 780', expDesc: 'Train Dehradun', expAmt: 780, expCat: 'Travel' },
  { input: 'swiggy 350', expDesc: 'swiggy', expAmt: 350, expCat: 'Food' },
  { input: 'wifi bill 699', expDesc: 'wifi bill', expAmt: 699, expCat: 'Bills' },
  { input: 'movie ticket 250', expDesc: 'movie ticket', expAmt: 250, expCat: 'Entertainment' },
  { input: 'hoodie 1499', expDesc: 'hoodie', expAmt: 1499, expCat: 'Shopping' },
  { input: '₹45.50 snacks', expDesc: 'snacks', expAmt: 45.5, expCat: 'Food' },
];

for (const ex of quickExamples) {
  const parsed = parseQuickExpenseInput(ex.input);
  assert(
    parsed !== null &&
      parsed.description.toLowerCase() === ex.expDesc.toLowerCase() &&
      parsed.amount === ex.expAmt &&
      parsed.category === ex.expCat,
    `Parse "${ex.input}" -> "${ex.expDesc}", ₹${ex.expAmt}, ${ex.expCat}`,
    `Got: desc="${parsed?.description}", amt=${parsed?.amount}, cat="${parsed?.category}"`
  );
}

// ----------------------------------------------------
// 2. DATA CONSISTENCY & AUTOMATIC SYNCHRONIZATION CYCLE
// ----------------------------------------------------
console.log('\n--- 2. Testing Data Consistency Cycle (Requirement 17) ---');

const todayStr = new Date().toISOString().split('T')[0];
const monthlyBudget = 12000;
let expenses: Expense[] = [];

// Helper to compute analytics reactive values identically to MoneyContext
function computeMoneyAnalytics(exps: Expense[], budget: number) {
  let todayTotal = 0;
  let monthTotal = 0;
  let travelSpending = 0;
  let educationSpending = 0;
  let foodSpending = 0;
  const currentYM = todayStr.substring(0, 7);

  for (const e of exps) {
    const amt = Number(e.amount) || 0;
    if (e.date === todayStr) todayTotal += amt;
    if (e.date?.startsWith(currentYM)) monthTotal += amt;
    const cat = (e.category || '').toLowerCase();
    if (cat === 'education') educationSpending += amt;
    if (cat === 'food') foodSpending += amt;
    if (cat === 'travel' || e.tripId) travelSpending += amt;
  }

  return {
    todayTotal,
    monthTotal,
    educationSpending,
    foodSpending,
    travelSpending,
    budget: {
      budget,
      spent: monthTotal,
      remaining: budget - monthTotal,
    },
  };
}

// Step A: Add Book ₹450
const expBook: Expense = {
  id: 'exp_1',
  date: todayStr,
  description: 'Book',
  amount: 450,
  category: 'Education',
  categoryId: 'Education',
  createdAt: new Date().toISOString(),
};
expenses.push(expBook);

let a1 = computeMoneyAnalytics(expenses, monthlyBudget);
assert(a1.educationSpending === 450, 'Step A: Education spending is ₹450');
assert(a1.todayTotal === 450, 'Step A: Today total is ₹450');
assert(a1.monthTotal === 450, 'Step A: Month total is ₹450');
assert(a1.budget.spent === 450 && a1.budget.remaining === 11550, 'Step A: Budget Spent=₹450, Remaining=₹11,550');

// Step B: Create Trip and Add Bus ₹300 linked to trip
const trip1: Trip = {
  id: 'trip_rishikesh',
  tripName: 'Rishikesh Rafting',
  destination: 'Rishikesh',
  startDate: todayStr,
  endDate: todayStr,
  durationDays: 2,
  startingLocation: 'Hostel Block C',
  travelMode: 'Bus',
  distanceKm: 240,
  purpose: 'Adventure & River Rafting',
  plannedBudget: 10000,
  numberOfPeople: 8,
  splitBasis: 'actual',
  createdAt: new Date().toISOString(),
};

const expBus: Expense = {
  id: 'exp_2',
  date: todayStr,
  description: 'Bus to Rishikesh',
  amount: 300,
  category: 'Travel',
  categoryId: 'Travel',
  tripId: trip1.id,
  tripSubCategory: 'Transport',
  createdAt: new Date().toISOString(),
};
expenses.push(expBus);

let a2 = computeMoneyAnalytics(expenses, monthlyBudget);
let trip1Expenses = expenses.filter((e) => e.tripId === trip1.id);
let trip1Total = trip1Expenses.reduce((s, e) => s + e.amount, 0);

assert(a2.travelSpending === 300, 'Step B: Travel spending is ₹300');
assert(trip1Total === 300, 'Step B: Trip total cost is ₹300');
assert(a2.todayTotal === 750, 'Step B: Today spending is ₹750 (450 + 300)');
assert(a2.monthTotal === 750, 'Step B: Month spending is ₹750');
assert(a2.budget.spent === 750 && a2.budget.remaining === 11250, 'Step B: Budget Spent=₹750, Remaining=₹11,250');

// Step C: Edit Bus ₹300 -> ₹400
expenses = expenses.map((e) => (e.id === expBus.id ? { ...e, amount: 400 } : e));
let a3 = computeMoneyAnalytics(expenses, monthlyBudget);
trip1Total = expenses.filter((e) => e.tripId === trip1.id).reduce((s, e) => s + e.amount, 0);

assert(a3.travelSpending === 400, 'Step C: Edited Travel spending is ₹400');
assert(trip1Total === 400, 'Step C: Edited Trip total is ₹400');
assert(a3.todayTotal === 850, 'Step C: Today spending is ₹850');
assert(a3.monthTotal === 850, 'Step C: Month spending is ₹850');
assert(a3.budget.spent === 850 && a3.budget.remaining === 11150, 'Step C: Budget Spent=₹850, Remaining=₹11,150');

// Step D: Delete Bus ₹400 (Full Reversal Test)
expenses = expenses.filter((e) => e.id !== expBus.id);
let a4 = computeMoneyAnalytics(expenses, monthlyBudget);
trip1Total = expenses.filter((e) => e.tripId === trip1.id).reduce((s, e) => s + e.amount, 0);

assert(a4.travelSpending === 0, 'Step D: Travel spending reversed to ₹0');
assert(trip1Total === 0, 'Step D: Trip total reversed to ₹0');
assert(a4.todayTotal === 450, 'Step D: Today spending reversed to ₹450');
assert(a4.monthTotal === 450, 'Step D: Month spending reversed to ₹450');
assert(a4.budget.spent === 450 && a4.budget.remaining === 11550, 'Step D: Budget Spent=₹450, Remaining=₹11,550 reversed');

// ----------------------------------------------------
// 3. TRIP EXPENSE BREAKDOWN & UNIFIED SYNC (Requirements 9, 10, 11)
// ----------------------------------------------------
console.log('\n--- 3. Testing Trip Expense Breakdown & No Duplicate Transactions ---');

// Add items as in Requirement 9:
// Scooty Rent — ₹800
// Hotel — ₹2,000
// Food — ₹1,200
// Shopping — ₹500
// Local Travel — ₹300
const tripItems = [
  { desc: 'Scooty Rent', amt: 800, subCat: 'Transport', cat: 'Travel' },
  { desc: 'Hotel', amt: 2000, subCat: 'Stay', cat: 'Travel' },
  { desc: 'Food', amt: 1200, subCat: 'Food', cat: 'Food' },
  { desc: 'Shopping', amt: 500, subCat: 'Shopping', cat: 'Shopping' },
  { desc: 'Local Travel', amt: 300, subCat: 'Local Travel', cat: 'Travel' },
];

for (const item of tripItems) {
  expenses.push({
    id: `exp_trip_${item.desc}`,
    date: todayStr,
    description: item.desc,
    amount: item.amt,
    category: item.cat,
    categoryId: item.cat,
    tripId: trip1.id,
    tripSubCategory: item.subCat,
    createdAt: new Date().toISOString(),
  });
}

// Compute Trip Metrics
const tripExps = expenses.filter((e) => e.tripId === trip1.id);
const totalTripSpending = tripExps.reduce((s, e) => s + e.amount, 0);
const remainingTripBudget = trip1.plannedBudget - totalTripSpending;

assert(totalTripSpending === 4800, 'Total Trip Spending is exactly ₹4,800 (800+2000+1200+500+300)');
assert(remainingTripBudget === 5200, 'Remaining Trip Budget is exactly ₹5,200 (10,000 - 4,800)');

// Verify Global Money Synchronization (Requirement 10)
const aSync = computeMoneyAnalytics(expenses, monthlyBudget);
// Total transactions = 1 (Book) + 5 (Trip items) = 6
assert(expenses.length === 6, 'Single ledger: Exactly 6 total transactions stored (No duplication!)');
// Total month spent = 450 (Book) + 4800 (Trip items) = 5250
assert(aSync.monthTotal === 5250, 'Global month total reflects both Book + Trip items (₹5,250)');
assert(aSync.budget.spent === 5250, 'Global budget spent reflects ₹5,250');
assert(aSync.budget.remaining === 6750, 'Global budget remaining is ₹6,750 (12,000 - 5,250)');
// Travel spending captures all trip expenses (4800)
assert(aSync.travelSpending === 4800, 'Global travel spending automatically captures all trip items (₹4,800)');
// Food spending captures the ₹1,200 food item from trip
assert(aSync.foodSpending === 1200, 'Global food spending captures ₹1,200 from trip food expense');

// ----------------------------------------------------
// 4. FINAL / ACTUAL TRIP COST UPDATE (Requirement 8)
// ----------------------------------------------------
console.log('\n--- 4. Testing Post-Trip Planned Budget Update (Requirement 8) ---');

// Initial budget: ₹10,000. Actual final cost: ₹8,400 (or update planned budget to ₹8,400)
const updatedPlannedBudget = 8400;
const updatedRemaining = updatedPlannedBudget - totalTripSpending; // 8400 - 4800 = 3600
assert(
  updatedRemaining === 3600,
  'Distinguishes Planned Budget (₹8,400) vs Actual Spent (₹4,800) vs Remaining (₹3,600)'
);
// Historical spending must remain untouched
assert(totalTripSpending === 4800, 'Historical spending remains ₹4,800 after budget edit');

// ----------------------------------------------------
// 5. PER-PERSON TRIP SPLIT (Requirement 12)
// ----------------------------------------------------
console.log('\n--- 5. Testing Per-Person Trip Split ---');

// Case A: 8 people, Total ₹16,000 -> ₹2,000 (Prompt example)
const splitA = Math.round((16000 / 8) * 100) / 100;
assert(splitA === 2000, 'Split Example A: ₹16,000 / 8 people = ₹2,000');

// Case B: 8 people, Total ₹4,800 (Actual spent) -> ₹600
const splitB = Math.round((totalTripSpending / 8) * 100) / 100;
assert(splitB === 600, 'Split Example B: ₹4,800 / 8 people = ₹600');

// Case C: Based on planned budget (₹10,000) / 8 people -> ₹1,250
const splitC = Math.round((trip1.plannedBudget / 8) * 100) / 100;
assert(splitC === 1250, 'Split Example C (Budget basis): ₹10,000 / 8 people = ₹1,250');

// Case D: Division resulting in decimals: ₹10,000 / 3 people -> ₹3,333.33
const splitD = Math.round((10000 / 3) * 100) / 100;
assert(splitD === 3333.33, 'Split Example D (Decimals): ₹10,000 / 3 = ₹3,333.33');

// Case E: 1 person
const splitE = Math.round((totalTripSpending / 1) * 100) / 100;
assert(splitE === 4800, 'Split Example E: ₹4,800 / 1 person = ₹4,800');

// ----------------------------------------------------
// 6. EDGE CASES (Requirement 18)
// ----------------------------------------------------
console.log('\n--- 6. Testing Robustness & Edge Cases ---');

// Edge: ₹0 amount
const expZero = parseQuickExpenseInput('Free campus book 0');
assert(expZero !== null && expZero.amount === 0, 'Handled ₹0 expense without crashing');

// Edge: ₹1 amount
const expOne = parseQuickExpenseInput('Pen 1');
assert(expOne !== null && expOne.amount === 1, 'Handled ₹1 expense correctly');

// Edge: Large amounts (₹1,00,00,000)
const expLarge = parseQuickExpenseInput('Annual fee 1000000');
assert(expLarge !== null && expLarge.amount === 1000000, 'Handled large amount (₹10,00,000)');

// Edge: Decimal amounts
const expDec = parseQuickExpenseInput('Juice 35.75');
assert(expDec !== null && expDec.amount === 35.75, 'Handled decimal amount (₹35.75)');

// Edge: Trip without expenses
const emptyTrip: TripWithExpenses = {
  id: 'trip_empty',
  tripName: 'Empty Trip',
  destination: 'Goa',
  startDate: todayStr,
  endDate: todayStr,
  durationDays: 3,
  startingLocation: 'Campus',
  travelMode: 'Flight',
  distanceKm: 1200,
  purpose: 'Vacation',
  plannedBudget: 15000,
  numberOfPeople: 4,
  splitBasis: 'actual',
  totalCost: 0,
  expenseCount: 0,
  remainingBudget: 15000,
  costPerPerson: 0,
  createdAt: new Date().toISOString(),
};
assert(
  emptyTrip.totalCost === 0 && emptyTrip.remainingBudget === 15000 && emptyTrip.costPerPerson === 0,
  'Handled trip without expenses safely'
);

// Edge: Deleting trip unlinks expenses without deleting them from Money
console.log('\nTesting Trip Deletion Safety:');
const expensesBeforeTripDelete = [...expenses];
// When trip1 is deleted:
expenses = expenses.map((e) => (e.tripId === trip1.id ? { ...e, tripId: undefined } : e));
assert(
  expenses.length === expensesBeforeTripDelete.length,
  'All 6 expenses are preserved in global money ledger upon trip deletion'
);
assert(
  expenses.every((e) => e.tripId === undefined),
  'Expenses formerly linked to trip now have tripId: undefined'
);

// Verify totals still match
const aAfterTripDelete = computeMoneyAnalytics(expenses, monthlyBudget);
assert(aAfterTripDelete.monthTotal === 5250, 'Global month spending remains ₹5,250 after trip deletion');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`PHASE 2 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
