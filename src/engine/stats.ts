const KEY = 'tp:stats:v1';

interface StatsData {
  sessions: number;
  taps: Record<string, number>;
}

const FUN_LABELS: readonly [number, string][] = [
  [0, 'Just getting started 🐣'],
  [50, 'Tiny taps 🐾'],
  [250, 'Busy paws 🐹'],
  [1000, 'Boop machine 🤖'],
  [5000, 'Tap tornado 🌪️'],
  [20000, 'Legendary smasher 🏆'],
];

/** Persisted play stats shown in the parent panel. */
export class Stats {
  private data: StatsData = { sessions: 0, taps: {} };
  private saveTimer: number | null = null;

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          const p = parsed as Record<string, unknown>;
          if (typeof p.sessions === 'number') this.data.sessions = p.sessions;
          if (typeof p.taps === 'object' && p.taps !== null) {
            for (const [k, v] of Object.entries(p.taps)) {
              if (typeof v === 'number') this.data.taps[k] = v;
            }
          }
        }
      }
    } catch {
      // no storage — stats just reset each visit
    }
  }

  startSession(): void {
    this.data.sessions += 1;
    this.scheduleSave();
  }

  bump(gameId: string, n = 1): void {
    this.data.taps[gameId] = (this.data.taps[gameId] ?? 0) + n;
    this.scheduleSave();
  }

  get totalTaps(): number {
    return Object.values(this.data.taps).reduce((a, b) => a + b, 0);
  }

  get sessions(): number {
    return this.data.sessions;
  }

  tapsFor(gameId: string): number {
    return this.data.taps[gameId] ?? 0;
  }

  funLabel(): string {
    const total = this.totalTaps;
    let label = FUN_LABELS[0]?.[1] ?? '';
    for (const [threshold, text] of FUN_LABELS) {
      if (total >= threshold) label = text;
    }
    return label;
  }

  private scheduleSave(): void {
    if (this.saveTimer !== null) return;
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch {
        // ignore
      }
    }, 1000);
  }
}
