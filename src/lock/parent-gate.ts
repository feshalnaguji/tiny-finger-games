export type Corner = 'left' | 'right';

const KEYWORD = 'parent';

/**
 * The deliberate exit gesture: one finger held in EACH top corner simultaneously
 * for `holdMs`, or typing "parent" on a keyboard. Implemented as a pure state
 * machine (times injected) so it is fully unit-testable; the app binds real
 * pointer/key events and calls tick() from its rAF loop.
 */
export class ParentGate {
  onOpen: (() => void) | null = null;

  /** Ring UI appears only after this much sustained hold — casual smashing never sees it. */
  readonly revealMs = 400;
  readonly holdMs: number;

  private pointers = new Map<number, Corner>();
  private holdStart: number | null = null;
  private buffer = '';

  constructor(holdMs = 2500) {
    this.holdMs = holdMs;
  }

  cornerSize(width: number, height: number): number {
    return Math.max(Math.min(width, height) * 0.15, 96);
  }

  private hitCorner(x: number, y: number, width: number, height: number): Corner | null {
    const s = this.cornerSize(width, height);
    if (y > s) return null;
    if (x < s) return 'left';
    if (x > width - s) return 'right';
    return null;
  }

  pointerDown(id: number, x: number, y: number, width: number, height: number, now: number): void {
    const corner = this.hitCorner(x, y, width, height);
    if (!corner) return;
    // one pointer per corner — a second finger in the same corner is ignored
    for (const c of this.pointers.values()) if (c === corner) return;
    this.pointers.set(id, corner);
    if (this.bothCornersHeld() && this.holdStart === null) this.holdStart = now;
  }

  pointerMove(id: number, x: number, y: number, width: number, height: number): void {
    const corner = this.pointers.get(id);
    if (corner === undefined) return;
    if (this.hitCorner(x, y, width, height) !== corner) this.drop(id);
  }

  pointerUp(id: number): void {
    this.drop(id);
  }

  /**
   * Returns hold progress 0..1, or null when idle / before the reveal threshold.
   * Fires onOpen exactly once when the hold completes.
   */
  tick(now: number): number | null {
    if (this.holdStart === null) return null;
    const elapsed = now - this.holdStart;
    if (elapsed >= this.holdMs) {
      this.reset();
      this.onOpen?.();
      return null;
    }
    return elapsed >= this.revealMs ? elapsed / this.holdMs : null;
  }

  key(key: string): void {
    if (key.length !== 1) return;
    this.buffer = (this.buffer + key.toLowerCase()).slice(-KEYWORD.length);
    if (this.buffer === KEYWORD) {
      this.buffer = '';
      this.onOpen?.();
    }
  }

  reset(): void {
    this.pointers.clear();
    this.holdStart = null;
  }

  private bothCornersHeld(): boolean {
    const corners = new Set(this.pointers.values());
    return corners.has('left') && corners.has('right');
  }

  private drop(id: number): void {
    if (this.pointers.delete(id)) this.holdStart = null;
  }
}
