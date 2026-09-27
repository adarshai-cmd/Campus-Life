/**
 * Campus Life - Safe Date Formatting, Device Time, and Parsing Utilities
 * Manages device-local date, time, and day automatically without UTC timezone offset skew.
 */

/**
 * Returns YYYY-MM-DD string matching the device's local calendar date.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns 24h or 12h time formatted string from local device time.
 */
export function getLocalTimeString(
  d: Date = new Date(),
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  try {
    return d.toLocaleTimeString(undefined, options);
  } catch {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

/**
 * Returns full name of current day (e.g. 'Monday', 'Tuesday') in local device time.
 */
export function getLocalDayName(d: Date = new Date()): string {
  try {
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  } catch {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()] || 'Today';
  }
}

/**
 * Parses date string or Date object safely to a local Date instance without throwing.
 */
export function parseDateSafe(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  const str = String(input).trim();
  if (!str) return null;

  try {
    // If it's already an ISO timestamp (e.g. 2026-09-27T10:00:00.000Z)
    if (str.includes('T')) {
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    }

    // If it's YYYY-MM-DD
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(year, month - 1, day);
        return isNaN(d.getTime()) ? null : d;
      }
    }

    // Fallback standard parse
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback;
  } catch {
    return null;
  }
}

/**
 * Formats a date using the device's locale and timezone.
 */
export function formatDateSafe(
  input: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
  fallback = '—'
): string {
  const d = parseDateSafe(input);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString(undefined, options);
  } catch {
    return fallback;
  }
}

/**
 * Formats month (e.g. "2026-09" -> "Sep 2026")
 */
export function formatMonthSafe(monthKey: string, fallback?: string): string {
  if (!monthKey) return fallback || '—';
  try {
    const parts = monthKey.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      if (!isNaN(year) && !isNaN(month)) {
        const d = new Date(year, month - 1, 1);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        }
      }
    }
    return fallback || monthKey;
  } catch {
    return fallback || monthKey;
  }
}
