import { beforeEach, describe, expect, it } from 'vitest';
import { ParentGate } from '../src/lock/parent-gate';

const W = 1000;
const H = 600;

describe('ParentGate', () => {
  let gate: ParentGate;
  let opened: number;

  beforeEach(() => {
    gate = new ParentGate(2500);
    opened = 0;
    gate.onOpen = () => opened++;
  });

  const downLeft = (id: number, t: number) => {
    gate.pointerDown(id, 10, 10, W, H, t);
  };
  const downRight = (id: number, t: number) => {
    gate.pointerDown(id, W - 10, 10, W, H, t);
  };

  it('opens after both corners are held for the full duration', () => {
    downLeft(1, 0);
    downRight(2, 100);
    expect(gate.tick(500)).toBeCloseTo(400 / 2500);
    expect(opened).toBe(0);
    gate.tick(2700); // 100 + 2500 elapsed
    expect(opened).toBe(1);
  });

  it('does not open for a single corner, however long', () => {
    downLeft(1, 0);
    expect(gate.tick(60_000)).toBeNull();
    expect(opened).toBe(0);
  });

  it('does not open for two fingers in the SAME corner', () => {
    downLeft(1, 0);
    gate.pointerDown(2, 12, 12, W, H, 0);
    expect(gate.tick(60_000)).toBeNull();
    expect(opened).toBe(0);
  });

  it('ignores presses outside the corners', () => {
    gate.pointerDown(1, W / 2, H / 2, W, H, 0);
    downRight(2, 0);
    expect(gate.tick(60_000)).toBeNull();
  });

  it('resets when a finger lifts early', () => {
    downLeft(1, 0);
    downRight(2, 0);
    gate.pointerUp(1);
    expect(gate.tick(60_000)).toBeNull();
    expect(opened).toBe(0);
  });

  it('resets when a finger slides out of its corner', () => {
    downLeft(1, 0);
    downRight(2, 0);
    gate.pointerMove(1, W / 2, H / 2, W, H);
    expect(gate.tick(60_000)).toBeNull();
  });

  it('hides the progress ring before the reveal threshold', () => {
    downLeft(1, 0);
    downRight(2, 0);
    expect(gate.tick(200)).toBeNull();
    expect(gate.tick(450)).not.toBeNull();
  });

  it('opens via the typed keyword', () => {
    for (const ch of 'xxparent') gate.key(ch);
    expect(opened).toBe(1);
  });

  it('ignores non-character keys inside the keyword', () => {
    for (const ch of ['p', 'a', 'r', 'Shift', 'e', 'n', 't']) gate.key(ch);
    expect(opened).toBe(1);
  });

  it('opens only once per completed hold', () => {
    downLeft(1, 0);
    downRight(2, 0);
    gate.tick(2600);
    gate.tick(5000);
    expect(opened).toBe(1);
  });
});
