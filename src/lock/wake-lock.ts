/** Keeps the screen awake while a toddler stares at fireworks. */
export class WakeLock {
  private sentinel: WakeLockSentinel | null = null;
  private wanted = false;

  acquire(): void {
    this.wanted = true;
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(
      (s) => {
        this.sentinel = s;
      },
      () => undefined,
    );
  }

  /** Wake locks are auto-released when the tab hides; call this on return. */
  reacquire(): void {
    if (this.wanted && document.visibilityState === 'visible') this.acquire();
  }

  release(): void {
    this.wanted = false;
    void this.sentinel?.release();
    this.sentinel = null;
  }
}
