/**
 * Gamepad support: any button press acts like a key press, which every game
 * already understands. Polled from the app's rAF loop (the Gamepad API has no
 * events for buttons). Edge detection is pure logic so it's unit-testable.
 */
export class GamepadInput {
  /** Fired once per fresh button press with a synthetic key code like "Pad3". */
  onPress: ((code: string) => void) | null = null;

  private prev = new Map<number, boolean[]>();

  /** Call once per frame with the live gamepad list. */
  poll(pads: readonly (Gamepad | null)[] = navigator.getGamepads()): void {
    for (const pad of pads) {
      if (!pad) continue;
      const before = this.prev.get(pad.index) ?? [];
      const now = pad.buttons.map((b) => b.pressed);
      for (let i = 0; i < now.length; i++) {
        if (now[i] && !before[i]) this.onPress?.(`Pad${i}`);
      }
      this.prev.set(pad.index, now);
    }
  }
}
