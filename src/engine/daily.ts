/**
 * Deterministic "game of the day": everyone sees the same surprise pick on the
 * same calendar day (local time), and it rotates naturally at midnight.
 */
export function dailyIndex(count: number, date: Date = new Date()): number {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % Math.max(count, 1);
}
