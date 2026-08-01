import { describe, expect, it } from 'vitest';
import { dailyIndex } from '../src/engine/daily';

describe('dailyIndex', () => {
  it('is deterministic for the same day', () => {
    const a = dailyIndex(15, new Date(2026, 7, 1, 9, 30));
    const b = dailyIndex(15, new Date(2026, 7, 1, 21, 5));
    expect(a).toBe(b);
  });

  it('stays within bounds', () => {
    for (let d = 1; d <= 28; d++) {
      const i = dailyIndex(15, new Date(2026, 3, d));
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(15);
    }
  });

  it('varies across days', () => {
    const picks = new Set<number>();
    for (let d = 1; d <= 28; d++) picks.add(dailyIndex(15, new Date(2026, 3, d)));
    expect(picks.size).toBeGreaterThan(3);
  });

  it('handles a count of zero without crashing', () => {
    expect(dailyIndex(0)).toBe(0);
  });
});
