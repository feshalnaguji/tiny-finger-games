/**
 * Shown when fullscreen is lost without the parent gate (Esc-hold, OS gesture).
 * Any tap — which a toddler supplies instantly — is the user gesture that
 * re-enters fullscreen. The overlay is still the app, so the child stays contained.
 */
export class ResumeOverlay {
  readonly el: HTMLElement;
  onTap: (() => void) | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'resume-overlay';
    this.el.innerHTML = `
      <div class="resume-overlay__face">🙂</div>
      <div class="resume-overlay__hint">tap to keep playing!</div>
    `;
    this.el.addEventListener('pointerdown', () => this.onTap?.());
    this.hide();
  }

  show(): void {
    this.el.style.display = '';
  }

  hide(): void {
    this.el.style.display = 'none';
  }
}
