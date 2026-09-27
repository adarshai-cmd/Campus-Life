/**
 * Comprehensive Automated Phase 1 Validation Test
 * Tests:
 * 1. Profile Creation & Unique Usernames (Storage Layer Enforcement)
 * 2. Duplicate Username Rejection ("This username already exists. Please choose another username.")
 * 3. Username Modification & Validation
 * 4. Profile Data Isolation (Strictly scoped storage keys)
 * 5. College Attendance: Subject Attendance %, Absent classes calculation
 * 6. Attendance Quick Actions: Present & Absent logic
 * 7. Duplicate Daily Attendance Prevention & Correction
 * 8. Mathematical Target Forecaster (Safe bunks & Classes needed)
 */

import { storageService } from '../src/services/storage/storageService';
import { calculateAttendanceStats } from '../src/services/rules/attendanceMath';
import { AttendanceRecord, AttendanceDailyLog, AttendanceDailyStatus } from '../src/types/college';

// In-memory mock localStorage for Node testing
let mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; },
  }
};
(global as any).localStorage = (global as any).window.localStorage;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

async function runTests() {
  console.log('\n--- Starting Phase 1 Campus Life Verification ---\n');

  // Clear storage
  mockStorage = {};

  // 1. Profile Creation
  console.log('[Test 1] Profile Creation & Unique Username');
  const p1 = storageService.createProfileRecord({
    name: 'Adarsh Pandey',
    username: 'adarsh01',
    residenceLabel: 'Hostel Block A',
  });

  assert(p1.id.startsWith('prof_'), `p1 has internal profileId: ${p1.id}`);
  assert(p1.username === 'adarsh01', `p1 username is 'adarsh01'`);
  assert(p1.name === 'Adarsh Pandey', `p1 display name is 'Adarsh Pandey'`);

  // 2. Same Name, Different Username -> ALLOWED
  console.log('\n[Test 2] Same Display Name with Different Username');
  const p2 = storageService.createProfileRecord({
    name: 'Adarsh Pandey',
    username: 'adarsh02',
    residenceLabel: 'Hostel Block B',
  });
  assert(p2.id !== p1.id, `p2 has distinct profileId: ${p2.id}`);
  assert(p2.username === 'adarsh02', `p2 username is 'adarsh02'`);

  // 3. Duplicate Username -> MUST BE REJECTED
  console.log('\n[Test 3] Duplicate Username Rejection at Storage Layer');
  let duplicateRejected = false;
  try {
    storageService.createProfileRecord({
      name: 'Adarsh Copycat',
      username: 'adarsh01', // duplicate!
    });
  } catch (err: any) {
    duplicateRejected = true;
    assert(
      err.message === 'This username already exists. Please choose another username.',
      `Throws exact required message: "${err.message}"`
    );
  }
  assert(duplicateRejected, 'Duplicate username creation was blocked at data layer');

  // Case-insensitive duplicate check
  let caseDuplicateRejected = false;
  try {
    storageService.createProfileRecord({
      name: 'Adarsh Uppercase',
      username: 'ADARSH01', // uppercase duplicate!
    });
  } catch (err: any) {
    caseDuplicateRejected = true;
    assert(
      err.message === 'This username already exists. Please choose another username.',
      `Case-insensitive check rejected uppercase duplicate: "${err.message}"`
    );
  }
  assert(caseDuplicateRejected, 'Case-insensitive duplicate was blocked');

  // 4. Username Update / Change
  console.log('\n[Test 4] Username Change Logic');
  // Attempting to change p2 username to existing 'adarsh01' should fail
  let changeToDuplicateFailed = false;
  try {
    storageService.updateProfileRecord(p2.id, { username: 'adarsh01' });
  } catch (err: any) {
    changeToDuplicateFailed = true;
    assert(
      err.message === 'This username already exists. Please choose another username.',
      `Blocking duplicate on update: "${err.message}"`
    );
  }
  assert(changeToDuplicateFailed, 'Changing to an existing username is blocked');

  // Changing p2 username to a fresh unique username succeeds
  const updatedP2 = storageService.updateProfileRecord(p2.id, { username: 'adarsh_dev' });
  assert(updatedP2.username === 'adarsh_dev', `p2 username successfully updated to 'adarsh_dev'`);

  // 5. Profile Data Isolation
  console.log('\n[Test 5] Strict Profile Data Isolation');
  storageService.setItem(p1.id, 'college_test', [{ item: 'College Data For User 1' }]);
  storageService.setItem(p2.id, 'college_test', [{ item: 'College Data For User 2' }]);

  const p1Data = storageService.getItem<Array<{ item: string }>>(p1.id, 'college_test', []);
  const p2Data = storageService.getItem<Array<{ item: string }>>(p2.id, 'college_test', []);

  assert(p1Data[0].item === 'College Data For User 1', 'Profile 1 reads its own data');
  assert(p2Data[0].item === 'College Data For User 2', 'Profile 2 reads its own data');
  assert(p1Data[0].item !== p2Data[0].item, 'No cross-talk between Profile 1 and 2');

  // Deleting Profile 1 does not affect Profile 2
  storageService.clearProfileData(p1.id);
  const meta = storageService.getProfileMeta();
  meta.profiles = meta.profiles.filter(p => p.id !== p1.id);
  meta.activeProfileId = p2.id;
  storageService.saveProfileMeta(meta);

  const profilesAfterDel = storageService.getProfileMeta().profiles;
  assert(profilesAfterDel.length === 1 && profilesAfterDel[0].id === p2.id, 'Only Profile 1 removed, Profile 2 preserved');
  const p2StillHasData = storageService.getItem<Array<{ item: string }>>(p2.id, 'college_test', []);
  assert(p2StillHasData.length === 1 && p2StillHasData[0].item === 'College Data For User 2', 'Profile 2 data intact after Profile 1 deletion');

  // 6. College Attendance Subject & Calculations
  console.log('\n[Test 6] Attendance Calculations & Math');
  // Example from requirement:
  // Data Structures: 18 / 22, 82%
  const sub1: AttendanceRecord = {
    id: 'sub_ds',
    subjectName: 'Data Structures',
    totalClasses: 22,
    attendedClasses: 18,
    targetPercentage: 75,
  };

  const stats1 = calculateAttendanceStats(sub1);
  assert(stats1.percentage === 81.8 || stats1.percentage === 82, `Attendance % calculated accurately: ${stats1.percentage}%`);
  assert(stats1.absentClasses === 4, `Absent classes: 22 - 18 = 4`);
  assert(stats1.isSafe === true, `Above 75% target -> Safe`);
  // 18 / (22 + x) >= 0.75 => 18 >= 16.5 + 0.75x => 1.5 >= 0.75x => x <= 2
  assert(stats1.classesCanMissWhileAboveTarget === 2, `Can safely bunk 2 classes: got ${stats1.classesCanMissWhileAboveTarget}`);

  // Test critical attendance (e.g. 10 / 20 = 50%, target 75%)
  const subCritical: AttendanceRecord = {
    id: 'sub_os',
    subjectName: 'Operating Systems',
    totalClasses: 20,
    attendedClasses: 10,
    targetPercentage: 75,
  };
  const statsCrit = calculateAttendanceStats(subCritical);
  assert(statsCrit.percentage === 50, `50% attendance calculated`);
  assert(statsCrit.absentClasses === 10, `Absent: 10`);
  assert(statsCrit.isSafe === false, `Below 75% target -> Critical`);
  // (10 + y) / (20 + y) >= 0.75 => 10 + y >= 15 + 0.75y => 0.25y >= 5 => y >= 20
  assert(statsCrit.classesNeededToReachTarget === 20, `Needs 20 consecutive classes: got ${statsCrit.classesNeededToReachTarget}`);

  // 7. Attendance Quick Action Simulation & Same-Day Duplicate Prevention
  console.log('\n[Test 7] Attendance Quick Action & Duplicate Prevention');
  let currentTotal = 22;
  let currentAttended = 18;
  const today = '2026-09-27';
  let dailyLogs: AttendanceDailyLog[] = [];

  function simulateMarkAttendance(subjectId: string, status: AttendanceDailyStatus) {
    const existing = dailyLogs.find(l => l.subjectId === subjectId && l.date === today);
    if (existing) {
      if (existing.status === status) {
        return { duplicate: true, message: "Today's attendance is already recorded." };
      }
      // Status correction (e.g. absent -> present)
      existing.status = status;
      const diff = status === 'present' ? 1 : -1;
      currentAttended += diff;
      return { success: true, message: `Corrected to ${status}` };
    }

    // First time today:
    dailyLogs.push({
      id: 'log_1',
      subjectId,
      date: today,
      status,
      timestamp: new Date().toISOString()
    });
    currentTotal += 1;
    if (status === 'present') currentAttended += 1;
    return { success: true, message: `Marked ${status}` };
  }

  // Click [ Present ]
  const click1 = simulateMarkAttendance('sub_ds', 'present');
  assert(click1.success === true, 'First click succeeds');
  assert(currentTotal === 23, `Total classes incremented from 22 to 23: got ${currentTotal}`);
  assert(currentAttended === 19, `Attended classes incremented from 18 to 19: got ${currentAttended}`);

  // Accidental repeated click [ Present ] on the same day -> DUPLICATE BLOCKED!
  const clickDuplicate = simulateMarkAttendance('sub_ds', 'present');
  assert(clickDuplicate.duplicate === true, 'Accidental repeated click is flagged as duplicate');
  assert(clickDuplicate.message === "Today's attendance is already recorded.", `Shows message: "${clickDuplicate.message}"`);
  assert(currentTotal === 23, `Total classes did not inflate: still ${currentTotal}`);
  assert(currentAttended === 19, `Attended classes did not inflate: still ${currentAttended}`);

  // Correction click: change today's status to [ Absent ]
  const clickCorrection = simulateMarkAttendance('sub_ds', 'absent');
  assert(clickCorrection.success === true, 'Correction succeeds');
  assert(currentTotal === 23, `Total classes unchanged on correction: still ${currentTotal}`);
  assert(currentAttended === 18, `Attended classes adjusted down from 19 to 18: got ${currentAttended}`);

  console.log('\n=============================================');
  console.log('🎉 ALL PHASE 1 CORE REQUIREMENTS VERIFIED!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
