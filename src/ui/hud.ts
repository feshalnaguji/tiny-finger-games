const HOLD_MS = 1000;

/**
 * The only in-game chrome: a hold-to-go-home button. Plain taps do nothing
 * (a toddler smashing it stays in the game); a 1-second hold with a visible
 * progress ring returns to the menu.
 */
export class Hud {
  readonly el: HTMLElement;
  onHome: (() => void) | null = null;

  private holdStart: number | null = null;
  private raf = 0;

  constructor() {
    this.el = document.createElement('button');
    this.el.className = 'hud-home';
    this.el.setAttribute('aria-label', 'Hold to go back to the menu');
    this.el.innerHTML =
      '<span class="hud-home__ring"></span><span class="hud-home__icon">🏠</span>';
    this.el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.el.setPointerCapture(e.pointerId);
      this.holdStart = performance.now();
      this.animate();
    });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) {
      this.el.addEventListener(ev, () => {
        this.cancel();
      });
    }
    this.hide();
  }

  show(): void {
    this.el.style.display = '';
  }

  hide(): void {
    this.cancel();
    this.el.style.display = 'none';
  }

  private cancel(): void {
    this.holdStart = null;
    cancelAnimationFrame(this.raf);
    this.el.style.setProperty('--hold', '0');
  }

  private animate(): void {
    cancelAnimationFrame(this.raf);
    const step = () => {
      if (this.holdStart === null) return;
      const p = (performance.now() - this.holdStart) / HOLD_MS;
      if (p >= 1) {
        this.cancel();
        this.onHome?.();
        return;
      }
      this.el.style.setProperty('--hold', String(p));
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
}
