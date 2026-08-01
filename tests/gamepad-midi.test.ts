import { describe, expect, it } from 'vitest';
import { GamepadInput } from '../src/engine/gamepad';
import { MidiInput } from '../src/engine/midi';

function fakePad(index: number, pressed: boolean[]): Gamepad {
  return { index, buttons: pressed.map((p) => ({ pressed: p })) } as unknown as Gamepad;
}

describe('GamepadInput', () => {
  it('fires once per fresh press, not while held', () => {
    const gp = new GamepadInput();
    const presses: string[] = [];
    gp.onPress = (c) => presses.push(c);

    gp.poll([fakePad(0, [false, false])]);
    gp.poll([fakePad(0, [true, false])]);
    gp.poll([fakePad(0, [true, false])]); // held — no repeat
    gp.poll([fakePad(0, [false, true])]);
    expect(presses).toEqual(['Pad0', 'Pad1']);
  });

  it('tracks multiple gamepads independently', () => {
    const gp = new GamepadInput();
    const presses: string[] = [];
    gp.onPress = (c) => presses.push(c);

    gp.poll([fakePad(0, [true]), fakePad(1, [true])]);
    expect(presses).toEqual(['Pad0', 'Pad0']);
  });

  it('ignores null slots', () => {
    const gp = new GamepadInput();
    expect(() => {
      gp.poll([null, null]);
    }).not.toThrow();
  });
});

describe('MidiInput', () => {
  it('fires on note-on with the pitch in the code', () => {
    const midi = new MidiInput();
    const notes: [string, number][] = [];
    midi.onNote = (code, note) => notes.push([code, note]);

    midi.handle(new Uint8Array([0x90, 60, 100]));
    expect(notes).toEqual([['Midi60', 60]]);
  });

  it('ignores note-off and zero-velocity note-on', () => {
    const midi = new MidiInput();
    let fired = 0;
    midi.onNote = () => fired++;

    midi.handle(new Uint8Array([0x80, 60, 100])); // note-off
    midi.handle(new Uint8Array([0x90, 60, 0])); // running-status note-off
    midi.handle(new Uint8Array([0xb0, 7, 100])); // control change
    expect(fired).toBe(0);
  });

  it('handles note-on across channels', () => {
    const midi = new MidiInput();
    let fired = 0;
    midi.onNote = () => fired++;
    midi.handle(new Uint8Array([0x95, 64, 80])); // channel 6 note-on
    expect(fired).toBe(1);
  });
});
