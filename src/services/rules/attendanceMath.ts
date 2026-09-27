import { AttendanceRecord, AttendanceStats } from '@/types/college';

export function calculateAttendanceStats(record: AttendanceRecord): AttendanceStats {
  const { totalClasses, attendedClasses, targetPercentage = 75 } = record;

  if (totalClasses <= 0) {
    return {
      percentage: 100,
      isSafe: true,
      absentClasses: 0,
      classesNeededToReachTarget: 0,
      classesCanMissWhileAboveTarget: 0,
    };
  }

  const validAttended = Math.min(Math.max(0, attendedClasses), totalClasses);
  const absentClasses = Math.max(0, totalClasses - validAttended);
  const percentage = (validAttended / totalClasses) * 100;
  const isSafe = percentage >= targetPercentage;

  const T = targetPercentage / 100;

  let classesNeededToReachTarget = 0;
  let classesCanMissWhileAboveTarget = 0;

  if (!isSafe) {
    if (T < 1) {
      const required = (T * totalClasses - validAttended) / (1 - T);
      classesNeededToReachTarget = Math.max(0, Math.ceil(required));
    } else {
      // 100% target: can never mathematically reach if missed at least 1, but display remaining
      classesNeededToReachTarget = totalClasses - validAttended;
    }
  } else {
    if (T > 0) {
      const maxMissable = validAttended / T - totalClasses;
      classesCanMissWhileAboveTarget = Math.max(0, Math.floor(maxMissable));
    } else {
      classesCanMissWhileAboveTarget = 999;
    }
  }

  return {
    percentage: Math.round(percentage * 10) / 10,
    isSafe,
    absentClasses,
    classesNeededToReachTarget,
    classesCanMissWhileAboveTarget,
  };
}
