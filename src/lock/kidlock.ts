interface KeyboardLockApi {
  lock(codes?: string[]): Promise<void>;
  unlock(): void;
}

function keyboardApi(): KeyboardLockApi | null {
  const kb = (navigator as Navigator & { keyboard?: KeyboardLockApi }).keyboard;
  return kb && typeof kb.lock === 'function' ? kb : null;
}

/**
 * The lock that keeps little fingers inside the app: fullscreen + Keyboard Lock
 * (Chromium captures Esc/Tab/F11/Alt+arrows; the browser reserves hold-Esc-2s as
 * the built-in escape hatch) + capture-phase traps for every accidental exit route.
 * Engage must be called from a user gesture.
 */
export class KidLock {
  engaged = false;
  /** Fired when fullscreen is lost while locked (Esc-hold, OS gesture...). */
  onFullscreenLost: (() => void) | null = null;

  private aborter: AbortController | null = null;

  engage(): void {
    if (this.engaged) return;
    this.engaged = true;
    void this.enterFullscreen();
    history.pushState({ tpTrap: true }, '');

    this.aborter = new AbortController();
    const signal = this.aborter.signal;
    const capture = { capture: true, signal };
    const prevent = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', prevent, capture);
    window.addEventListener('selectstart', prevent, capture);
    window.addEventListener('dragstart', prevent, capture);
    window.addEventListener('dblclick', prevent, capture);
    window.addEventListener(
      'wheel',
      (e) => {
        if (e.ctrlKey) e.preventDefault();
      },
      { capture: true, passive: false, signal },
    );
    for (const g of ['gesturestart', 'gesturechange', 'gestureend']) {
      window.addEventListener(g, prevent, capture);
    }
    // Fallback shortcut-swallower for browsers without Keyboard Lock (preventDefault
    // does not stop propagation, so game key handlers still receive the event).
    window.addEventListener('keydown', prevent, capture);
    window.addEventListener(
      'popstate',
      () => {
        history.pushState({ tpTrap: true }, '');
      },
      { signal },
    );
    window.addEventListener(
      'beforeunload',
      (e) => {
        e.preventDefault();
      },
      { signal },
    );
    document.addEventListener(
      'fullscreenchange',
      () => {
        if (this.engaged && !document.fullscreenElement) this.onFullscreenLost?.();
      },
      { signal },
    );
  }

  /** Also used by the resume overlay to re-enter after fullscreen is lost. */
  async enterFullscreen(): Promise<void> {
    const el = document.documentElement;
    if (!document.fullscreenElement && typeof el.requestFullscreen === 'function') {
      try {
        await el.requestFullscreen({ navigationUI: 'hide' });
      } catch {
        // iPhone Safari has no fullscreen — PWA standalone mode covers it
      }
    }
    try {
      await keyboardApi()?.lock();
    } catch {
      // unsupported — capture-phase keydown trap remains as fallback
    }
  }

  release(): void {
    if (!this.engaged) return;
    this.engaged = false;
    this.aborter?.abort();
    this.aborter = null;
    keyboardApi()?.unlock();
    if (document.fullscreenElement) void document.exitFullscreen();
  }
}
