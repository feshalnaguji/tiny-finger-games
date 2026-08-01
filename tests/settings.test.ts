import { describe, expect, it } from 'vitest';
import { SettingsStore } from '../src/engine/settings';

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    dump: () => Object.fromEntries(map),
  };
}

describe('SettingsStore', () => {
  it('starts with sane defaults', () => {
    const s = new SettingsStore(memoryStorage());
    expect(s.snapshot.sound).toBe(true);
    expect(s.snapshot.speech).toBe(true);
  });

  it('persists changes and reloads them', () => {
    const storage = memoryStorage();
    const a = new SettingsStore(storage);
    a.set('sound', false);
    const b = new SettingsStore(storage);
    expect(b.snapshot.sound).toBe(false);
  });

  it('notifies listeners on change and supports unsubscribe', () => {
    const s = new SettingsStore(memoryStorage());
    const seen: boolean[] = [];
    const off = s.onChange((snap) => seen.push(snap.calm));
    s.set('calm', true);
    off();
    s.set('calm', false);
    expect(seen).toEqual([true]);
  });

  it('does not notify when value is unchanged', () => {
    const s = new SettingsStore(memoryStorage());
    let calls = 0;
    s.onChange(() => calls++);
    s.set('sound', true);
    expect(calls).toBe(0);
  });

  it('survives corrupted storage', () => {
    const s = new SettingsStore(memoryStorage({ 'tp:settings:v1': '{not json' }));
    expect(s.snapshot.sound).toBe(true);
  });

  it('ignores wrong-typed persisted values', () => {
    const s = new SettingsStore(memoryStorage({ 'tp:settings:v1': '{"sound":"yes","calm":true}' }));
    expect(s.snapshot.sound).toBe(true);
    expect(s.snapshot.calm).toBe(true);
  });
});
