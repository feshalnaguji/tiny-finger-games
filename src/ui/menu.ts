import type { GameDefinition } from '../games/types';

interface MenuCallbacks {
  /** First tap ever — the user gesture that unlocks audio, fullscreen, and the kid-lock. */
  onBegin: () => void;
  onPick: (def: GameDefinition) => void;
}

/** Splash (▶️) on first visit, then the big emoji game grid. */
export class Menu {
  readonly el: HTMLElement;
  private started = false;

  constructor(
    private defs: GameDefinition[],
    private callbacks: MenuCallbacks,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'screen';
    this.renderSplash();
  }

  show(): void {
    this.el.style.display = '';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  private renderSplash(): void {
    this.el.classList.add('splash');
    this.el.innerHTML = `
      <div class="splash__logo">🐾</div>
      <div class="splash__title">Tiny Paws</div>
      <button class="splash__play" aria-label="Start playing">▶️</button>
      <div class="splash__hint">Grown-ups: tap play, then hold both top corners to exit</div>
    `;
    const play = this.el.querySelector('.splash__play');
    play?.addEventListener(
      'pointerdown',
      () => {
        if (this.started) return;
        this.started = true;
        this.callbacks.onBegin();
        this.renderGrid();
      },
      { once: true },
    );
  }

  private renderGrid(): void {
    this.el.classList.remove('splash');
    this.el.classList.add('menu');
    this.el.innerHTML = `
      <div class="menu__header">🐾 Pick a game!</div>
      <div class="menu__grid"></div>
    `;
    const grid = this.el.querySelector('.menu__grid');
    if (!grid) return;
    this.defs.forEach((def, i) => {
      const card = document.createElement('button');
      card.className = 'menu__card';
      card.setAttribute('aria-label', def.meta.title);
      card.textContent = def.meta.icon;
      card.style.background = `radial-gradient(circle at 32% 28%, ${def.meta.color}, color-mix(in srgb, ${def.meta.color} 55%, #1a1145))`;
      card.style.animationDelay = `${(i % 6) * 0.25}s`;
      card.addEventListener('pointerdown', () => {
        this.callbacks.onPick(def);
      });
      grid.appendChild(card);
    });
  }
}
