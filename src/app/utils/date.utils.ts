/**
 * Small, timezone-safe date helpers.
 *
 * Dates coming from `<input type="date">` are `YYYY-MM-DD` strings. We parse
 * them as *local* dates (not UTC) to avoid off-by-one day issues.
 */

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Parse a `YYYY-MM-DD` string into a local `Date`. */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

/** Format a `Date` as `YYYY-MM-DD` using local time. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Monday-based start of the week. */
export function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  const mondayOffset = (copy.getDay() + 6) % 7; // Sun=0 -> 6, Mon=1 -> 0 ...
  copy.setDate(copy.getDate() - mondayOffset);
  return copy;
}

/** A stable key (`YYYY-MM-DD` of the Monday) identifying the week of a date. */
export function weekKey(date: Date): string {
  return toISODate(startOfWeek(date));
}

/** Human friendly German date, e.g. `Do, 25. Jun`. */
export function formatHumanDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}
