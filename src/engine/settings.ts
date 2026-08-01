export interface SettingsSnapshot {
  sound: boolean;
  speech: boolean;
  calm: boolean;
}

const KEY = 'tp:settings:v1';

type Listener = (s: SettingsSnapshot) => void;

function systemPrefersCalm(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class SettingsStore {
  private state: SettingsSnapshot;
  private listeners = new Set<Listener>();

  constructor(private storage: Pick<Storage, 'getItem' | 'setItem'> | null = defaultStorage()) {
    this.state = { sound: true, speech: true, calm: systemPrefersCalm(), ...this.load() };
  }

  get snapshot(): Readonly<SettingsSnapshot> {
    return this.state;
  }

  set<K extends keyof SettingsSnapshot>(key: K, value: SettingsSnapshot[K]): void {
    if (this.state[key] === value) return;
    this.state = { ...this.state, [key]: value };
    this.save();
    for (const fn of this.listeners) fn(this.state);
  }

  onChange(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private load(): Partial<SettingsSnapshot> {
    try {
      const raw = this.storage?.getItem(KEY);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return {};
      const out: Partial<SettingsSnapshot> = {};
      for (const k of ['sound', 'speech', 'calm'] as const) {
        const v = (parsed as Record<string, unknown>)[k];
        if (typeof v === 'boolean') out[k] = v;
      }
      return out;
    } catch {
      return {};
    }
  }

  private save(): void {
    try {
      this.storage?.setItem(KEY, JSON.stringify(this.state));
    } catch {
      // storage unavailable (private mode) — settings just won't persist
    }
  }
}

function defaultStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
