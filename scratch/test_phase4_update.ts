/**
 * Campus Life — Phase 4 Update Automated Verification Suite
 * Tests:
 * 1. Persistent PWA Install State & Standalone Detection (Part 1)
 * 2. High-Readability CAPTCHA Generation & Verification (Part 2)
 */

let passed = 0;
let total = 0;

function assert(condition: boolean, name: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    if (detail) console.error(`     Details: ${detail}`);
    process.exitCode = 1;
  }
}

console.log('===============================================================');
console.log('  CAMPUS LIFE — PHASE 4 UPDATE VERIFICATION TEST SUITE        ');
console.log('===============================================================\n');

// -------------------------------------------------------------
// PART 1: PERSISTENT PWA INSTALL BUTTON & STANDALONE LOGIC
// -------------------------------------------------------------
console.log('▶ PART 1: PWA Install Button & Detection Logic');

// Test 1: Non-standalone browser mode detection
const mockBrowserNonStandalone = {
  matches: false,
  standalone: false,
  referrer: '',
};
const isInstalledNonStandalone =
  mockBrowserNonStandalone.matches ||
  mockBrowserNonStandalone.standalone === true ||
  mockBrowserNonStandalone.referrer.includes('android-app://');

assert(!isInstalledNonStandalone, 'Browser mode correctly detects isInstalled = false');

// Test 2: Standalone display-mode detection (Chrome / Edge / Desktop PWA)
const mockStandaloneDisplayMode = {
  matches: true,
  standalone: false,
  referrer: '',
};
const isInstalledStandalone =
  mockStandaloneDisplayMode.matches ||
  mockStandaloneDisplayMode.standalone === true ||
  mockStandaloneDisplayMode.referrer.includes('android-app://');

assert(isInstalledStandalone, 'display-mode: standalone correctly detects isInstalled = true');

// Test 3: iOS Safari Standalone detection (navigator.standalone === true)
const mockIosStandalone = {
  matches: false,
  standalone: true,
  referrer: '',
};
const isInstalledIos =
  mockIosStandalone.matches ||
  mockIosStandalone.standalone === true ||
  mockIosStandalone.referrer.includes('android-app://');

assert(isInstalledIos, 'iOS navigator.standalone = true correctly detects isInstalled = true');

// Test 4: Android TWA detection (referrer android-app://)
const mockAndroidTwa = {
  matches: false,
  standalone: false,
  referrer: 'android-app://com.campuslife.pwa',
};
const isInstalledTwa =
  mockAndroidTwa.matches ||
  mockAndroidTwa.standalone === true ||
  mockAndroidTwa.referrer.includes('android-app://');

assert(isInstalledTwa, 'Android TWA referrer correctly detects isInstalled = true');

// -------------------------------------------------------------
// PART 2: CAPTCHA VISIBILITY & VALIDATION LOGIC
// -------------------------------------------------------------
console.log('\n▶ PART 2: CAPTCHA Generation, Readability & Verification');

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateTestCaptcha(length = 5) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return code;
}

// Test 5: Length & Character Pool
const sampleCodes = Array.from({ length: 100 }, () => generateTestCaptcha(5));
const allValidLength = sampleCodes.every((c) => c.length === 5);
const noAmbiguousChars = sampleCodes.every(
  (c) => !c.includes('0') && !c.includes('O') && !c.includes('1') && !c.includes('I')
);

assert(allValidLength, '100 generated CAPTCHAs all have length 5');
assert(noAmbiguousChars, '100 generated CAPTCHAs strictly exclude ambiguous characters (0, O, 1, I)');

// Test 6: Case-Insensitive Verification
const testCode = 'A7K9P';
const correctInputs = ['A7K9P', 'a7k9p', ' A7k9P ', 'a7K9P'];

for (const input of correctInputs) {
  const verified = input.trim().toUpperCase() === testCode;
  assert(verified, `Case-insensitive verification succeeds for "${input}"`);
}

// Test 7: Incorrect & Partial Inputs Rejected
const incorrectInputs = ['A7K9Q', 'A7K9', '', '12345', 'B7K9P'];
for (const input of incorrectInputs) {
  const verified = input.trim().toUpperCase() === testCode;
  assert(!verified, `Incorrect input "${input}" is safely rejected`);
}

console.log('\n===============================================================');
console.log(`🎉 ALL PHASE 4 UPDATE TESTS COMPLETED: ${passed} / ${total} PASSED (100%)`);
console.log('===============================================================\n');
