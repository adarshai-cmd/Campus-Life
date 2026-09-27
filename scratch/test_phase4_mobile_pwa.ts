import * as fs from 'fs';
import * as path from 'path';
import { calculateAttendanceStats } from '../src/services/rules/attendanceMath';
import { AttendanceRecord } from '../src/types/college';
import { Expense } from '../src/types/money';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('=== PHASE 4: PWA & MOBILE-FIRST VERIFICATION TEST ===\n');

// 1. Check PWA Manifest
console.log('--- 1. Testing Web App Manifest ---');
const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.json exists');

const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
const manifest = JSON.parse(manifestRaw);

assert(manifest.name === 'Campus Life', 'Manifest name is "Campus Life"');
assert(manifest.short_name === 'Campus Life', 'Manifest short_name is "Campus Life"');
assert(manifest.display === 'standalone', 'Manifest display is "standalone"');
assert(manifest.start_url === '/', 'Manifest start_url is "/"');
assert(manifest.theme_color === '#0D5C46', 'Manifest theme_color is "#0D5C46"');
assert(manifest.background_color === '#F8FAFC', 'Manifest background_color is "#F8FAFC"');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Manifest contains valid icons array');

const has192Png = manifest.icons.some((i: { sizes?: string; type?: string }) => i.sizes === '192x192' && i.type === 'image/png');
const has512Png = manifest.icons.some((i: { sizes?: string; type?: string }) => i.sizes === '512x512' && i.type === 'image/png');
assert(has192Png, 'Manifest specifies 192x192 PNG icon');
assert(has512Png, 'Manifest specifies 512x512 PNG icon');

// 2. Check PWA Icon Assets on Disk
console.log('\n--- 2. Testing Generated PNG & SVG Icons ---');
const icon192Path = path.resolve(process.cwd(), 'public/icons/icon-192.png');
const icon512Path = path.resolve(process.cwd(), 'public/icons/icon-512.png');
const appleTouchPath = path.resolve(process.cwd(), 'public/icons/apple-touch-icon.png');
const rootAppleTouchPath = path.resolve(process.cwd(), 'public/apple-touch-icon.png');
const faviconPath = path.resolve(process.cwd(), 'public/favicon.png');

assert(fs.existsSync(icon192Path) && fs.statSync(icon192Path).size > 500, 'public/icons/icon-192.png is present and non-empty');
assert(fs.existsSync(icon512Path) && fs.statSync(icon512Path).size > 1000, 'public/icons/icon-512.png is present and non-empty');
assert(fs.existsSync(appleTouchPath) && fs.statSync(appleTouchPath).size > 500, 'public/icons/apple-touch-icon.png is present');
assert(fs.existsSync(rootAppleTouchPath) && fs.statSync(rootAppleTouchPath).size > 500, 'public/apple-touch-icon.png is present');
assert(fs.existsSync(faviconPath) && fs.statSync(faviconPath).size > 200, 'public/favicon.png is present');

// 3. Check Service Worker
console.log('\n--- 3. Testing Service Worker Implementation ---');
const swPath = path.resolve(process.cwd(), 'public/sw.js');
assert(fs.existsSync(swPath), 'public/sw.js exists');

const swContent = fs.readFileSync(swPath, 'utf-8');
assert(swContent.includes('campus-life-pwa-v4'), 'Service worker uses scoped cache name "campus-life-pwa-v4"');
assert(swContent.includes('self.addEventListener(\'install\''), 'Service worker handles install event');
assert(swContent.includes('self.addEventListener(\'activate\''), 'Service worker handles activate event');
assert(swContent.includes('self.addEventListener(\'fetch\''), 'Service worker handles fetch event');
assert(swContent.includes('navigate') && swContent.includes('Campus Life (Offline)'), 'Service worker provides safe offline HTML fallback');

// 4. Requirement 30 UX Simulation: Travel Split & Calculation Integrity
console.log('\n--- 4. Testing Real User Travel Split Scenario (Requirement 30) ---');
interface SimTrip {
  id: string;
  name: string;
  budget: number;
  people: number;
}

const trip: SimTrip = {
  id: 'trip-rishikesh',
  name: 'Rishikesh Trip',
  budget: 10000,
  people: 4,
};

const nowISO = new Date().toISOString();
let expenses: Expense[] = [
  { id: 'exp-1', description: 'Bus', amount: 500, category: 'Travel', date: '2026-09-27', tripId: 'trip-rishikesh', createdAt: nowISO },
  { id: 'exp-2', description: 'Hotel', amount: 1500, category: 'Travel', date: '2026-09-27', tripId: 'trip-rishikesh', createdAt: nowISO },
  { id: 'exp-3', description: 'Food', amount: 700, category: 'Food', date: '2026-09-27', tripId: 'trip-rishikesh', createdAt: nowISO },
];

function calculateTripStats(currentTrip: SimTrip, currentExpenses: Expense[]) {
  const tripExps = currentExpenses.filter((e) => e.tripId === currentTrip.id);
  const totalSpent = tripExps.reduce((sum, e) => sum + e.amount, 0);
  const remaining = currentTrip.budget - totalSpent;
  const perPerson = Math.round((totalSpent / currentTrip.people) * 100) / 100;
  return { totalSpent, remaining, perPerson };
}

// Step 1: Initial state (Bus 500 + Hotel 1500 + Food 700)
let stats = calculateTripStats(trip, expenses);
assert(stats.totalSpent === 2700, `Initial Trip Spending: ₹${stats.totalSpent} (Expected: ₹2,700)`);
assert(stats.remaining === 7300, `Initial Remaining Budget: ₹${stats.remaining} (Expected: ₹7,300)`);
assert(stats.perPerson === 675, `Initial Per Person Cost: ₹${stats.perPerson} (Expected: ₹675)`);

// Step 2: Edit Food from ₹700 to ₹900
expenses = expenses.map((e) => (e.id === 'exp-3' ? { ...e, amount: 900 } : e));
stats = calculateTripStats(trip, expenses);
assert(stats.totalSpent === 2900, `After Edit Food: Trip Spending: ₹${stats.totalSpent} (Expected: ₹2,900)`);
assert(stats.remaining === 7100, `After Edit Food: Remaining: ₹${stats.remaining} (Expected: ₹7,100)`);
assert(stats.perPerson === 725, `After Edit Food: Per Person: ₹${stats.perPerson} (Expected: ₹725)`);

// Step 3: Delete Hotel (₹1500)
expenses = expenses.filter((e) => e.id !== 'exp-2');
stats = calculateTripStats(trip, expenses);
assert(stats.totalSpent === 1400, `After Delete Hotel: Trip Spending: ₹${stats.totalSpent} (Expected: ₹1,400)`);
assert(stats.remaining === 8600, `After Delete Hotel: Remaining: ₹${stats.remaining} (Expected: ₹8,600)`);
assert(stats.perPerson === 350, `After Delete Hotel: Per Person: ₹${stats.perPerson} (Expected: ₹350)`);

// Step 4: Requirement 12 verification (₹16,000 spending for 8 people -> ₹2,000 per person)
const trip8: SimTrip = { id: 't-group', name: 'Manali Expedition', budget: 20000, people: 8 };
const exps8: Expense[] = [
  { id: 'exp-g1', description: 'Group package', amount: 16000, category: 'Travel', date: '2026-09-27', tripId: 't-group', createdAt: nowISO }
];
const stats8 = calculateTripStats(trip8, exps8);
assert(stats8.totalSpent === 16000, 'Group spending is ₹16,000');
assert(stats8.perPerson === 2000, `Per person split for 8 people with ₹16,000: ₹${stats8.perPerson} (Expected: ₹2,000)`);

// 5. College Attendance Math Verification
console.log('\n--- 5. Testing Attendance Calculation & Safe Bunk Logic ---');
const sampleRecord: AttendanceRecord = {
  id: 'att-ds',
  subjectName: 'Data Structures',
  totalClasses: 22,
  attendedClasses: 18,
  targetPercentage: 75,
};

const attStats = calculateAttendanceStats(sampleRecord);
assert(Math.round(attStats.percentage) === 82 && attStats.percentage === 81.8, `Attendance % for 18/22 is ${attStats.percentage}% (~82%) (Expected: ~82%)`);
assert(attStats.isSafe === true, 'Attendance is above 75% target');
assert(attStats.classesCanMissWhileAboveTarget === 2, `Can safely miss ${attStats.classesCanMissWhileAboveTarget} classes (Expected: 2)`);

console.log('\n✨ ALL PHASE 4 TESTS PASSED ACCURATELY! ✨\n');
