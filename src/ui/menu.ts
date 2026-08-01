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
    private dailyId: string | null = null,
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

  get isShowingGrid(): boolean {
    return this.started && this.el.style.display !== 'none';
  }

  /** Keyboard smashing on the menu wiggles a random card so keys always do something. */
  pulseRandom(): void {
    const cards = this.el.querySelectorAll<HTMLElement>('.menu__card');
    const card = cards[Math.floor(Math.random() * cards.length)];
    card?.animate(
      [
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.15) rotate(-5deg)' },
        { transform: 'scale(1.15) rotate(5deg)' },
        { transform: 'scale(1) rotate(0deg)' },
      ],
      { duration: 350, easing: 'ease-in-out' },
    );
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
      if (def.meta.id === this.dailyId) {
        card.classList.add('menu__card--daily');
        card.setAttribute('aria-label', `${def.meta.title} — today's surprise!`);
        const badge = document.createElement('span');
        badge.className = 'menu__card-badge';
        badge.textContent = '✨';
        card.appendChild(badge);
      }
      card.style.background = `radial-gradient(circle at 32% 28%, ${def.meta.color}, color-mix(in srgb, ${def.meta.color} 55%, #1a1145))`;
      card.style.animationDelay = `${(i % 6) * 0.25}s`;
      card.addEventListener('pointerdown', () => {
        this.callbacks.onPick(def);
      });
      grid.appendChild(card);
    });
  }
}
