/**
 * Date helper utilities (no external dep — avoids date-fns install in Docker)
 */

/**
 * Returns the number of calendar days between two dates (end - start).
 * e.g. Jan 1 → Jan 3 = 2
 */
export const differenceInCalendarDays = (end, start) => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / MS_PER_DAY);
};

/**
 * Returns a new Date with `days` added to `date`.
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
