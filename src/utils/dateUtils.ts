/**
 * Campus Life - Safe Date Formatting and Parsing Utilities
 * Defends against invalid date strings, timezone shifts, and missing timestamps.
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
