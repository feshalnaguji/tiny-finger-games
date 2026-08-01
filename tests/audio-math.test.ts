import { describe, expect, it } from 'vitest';
import { midiToFreq, MAJOR_SCALE, PENTATONIC } from '../src/engine/audio';

describe('midiToFreq', () => {
  it('maps A4 (midi 69) to 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
  });

  it('maps middle C (midi 60) to ~261.63 Hz', () => {
    expect(midiToFreq(60)).toBeCloseTo(261.63, 1);
  });

  it('doubles per octave', () => {
    expect(midiToFreq(81)).toBeCloseTo(midiToFreq(69) * 2);
  });
});

describe('scales', () => {
  it('pentatonic is strictly ascending and pleasant-sized', () => {
    for (let i = 1; i < PENTATONIC.length; i++) {
      expect(PENTATONIC[i]).toBeGreaterThan(PENTATONIC[i - 1] as number);
    }
    expect(PENTATONIC.length).toBeGreaterThanOrEqual(8);
  });

  it('major scale spans exactly one octave', () => {
    expect(MAJOR_SCALE.length).toBe(8);
    expect((MAJOR_SCALE[7] as number) - (MAJOR_SCALE[0] as number)).toBe(12);
  });
});
