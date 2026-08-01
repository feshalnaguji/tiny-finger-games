interface MidiInputLike {
  onmidimessage: ((e: { data: Uint8Array | null }) => void) | null;
}

interface MidiAccessLike {
  inputs: { values(): IterableIterator<MidiInputLike>; readonly size: number };
  onstatechange: (() => void) | null;
}

/**
 * Web MIDI support: plug in a real piano keyboard and play. Enabled only from
 * the parent panel (requestMIDIAccess shows a browser permission prompt, which
 * must never interrupt a playing child). Note-on messages become synthetic key
 * presses carrying the pitch, so Rainbow Piano can map them to real notes.
 */
export class MidiInput {
  /** Fired on every note-on with a code like "Midi60" (middle C). */
  onNote: ((code: string, note: number) => void) | null = null;

  private access: MidiAccessLike | null = null;

  get supported(): boolean {
    return 'requestMIDIAccess' in navigator;
  }

  get connected(): boolean {
    return this.access !== null && this.access.inputs.size > 0;
  }

  /** Returns true if access was granted (devices may still be plugged in later). */
  async enable(): Promise<boolean> {
    if (!this.supported) return false;
    if (this.access) return true;
    try {
      const access = (await (
        navigator as Navigator & { requestMIDIAccess(): Promise<unknown> }
      ).requestMIDIAccess()) as MidiAccessLike;
      this.access = access;
      const attach = () => {
        for (const input of access.inputs.values()) {
          input.onmidimessage = (e) => {
            if (e.data) this.handle(e.data);
          };
        }
      };
      attach();
      access.onstatechange = attach;
      return true;
    } catch {
      return false;
    }
  }

  /** Exposed for tests. */
  handle(data: Uint8Array): void {
    const status = (data[0] ?? 0) & 0xf0;
    const note = data[1] ?? 0;
    const velocity = data[2] ?? 0;
    if (status === 0x90 && velocity > 0) this.onNote?.(`Midi${note}`, note);
  }
}
