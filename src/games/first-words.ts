import type { Game, GameContext } from './types';

interface Word {
  emoji: string;
  word: string;
}

const WORDS: Word[] = [
  { emoji: '🍎', word: 'Apple' },
  { emoji: '⚽', word: 'Ball' },
  { emoji: '🚗', word: 'Car' },
  { emoji: '🐱', word: 'Cat' },
  { emoji: '🐶', word: 'Dog' },
  { emoji: '🦆', word: 'Duck' },
  { emoji: '☀️', word: 'Sun' },
  { emoji: '⭐', word: 'Star' },
  { emoji: '🍌', word: 'Banana' },
  { emoji: '👟', word: 'Shoe' },
  { emoji: '📖', word: 'Book' },
  { emoji: '🥛', word: 'Milk' },
  { emoji: '🌳', word: 'Tree' },
  { emoji: '🏠', word: 'House' },
  { emoji: '🌙', word: 'Moon' },
  { emoji: '🐟', word: 'Fish' },
  { emoji: '🎈', word: 'Balloon' },
  { emoji: '🧸', word: 'Teddy' },
];

const CARD_COLORS = ['#ffe0b2', '#c8e6c9', '#bbdefb', '#f8bbd0', '#fff9c4', '#d1c4e9'];
const TAPS_PER_SET = 10;

/**
 * Big everyday things that say their name when tapped. Six at a time; after a
 * while a fresh set slides in. First vocabulary, zero pressure.
 */
export class FirstWords implements Game {
  private ctx!: GameContext;
  private grid!: HTMLElement;
  private cards: { el: HTMLElement; word: Word }[] = [];
  private taps = 0;
  private destroyed = false;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #00838f 0%, #0097a7 55%, #00acc1 100%)';

    this.grid = document.createElement('div');
    this.grid.style.cssText = `
      position:absolute; inset:0; display:grid; gap:3vmin;
      padding:max(4vmin, env(safe-area-inset-top)) 4vmin max(4vmin, env(safe-area-inset-bottom));
      grid-template-columns:repeat(auto-fit, minmax(min(13rem, 40vw), 1fr));
      align-content:center;
    `;
    ctx.host.appendChild(this.grid);
    this.dealSet();

    ctx.input.onKey((k) => {
      if (k.repeat) return;
      let hash = 0;
      for (const c of k.code) hash = (hash * 31 + c.charCodeAt(0)) % 997;
      const card = this.cards[hash % this.cards.length];
      if (card) this.say(card);
    });
  }

  resize(): void {
    // grid reflows itself
  }

  destroy(): void {
    this.destroyed = true;
    this.cards = [];
    this.ctx.host.style.background = '';
  }

  private dealSet(): void {
    this.grid.innerHTML = '';
    this.cards = [];
    this.taps = 0;
    const pool = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 6);
    pool.forEach((word, i) => {
      const el = document.createElement('button');
      el.setAttribute('aria-label', word.word);
      el.textContent = word.emoji;
      el.style.cssText = `
        aspect-ratio:1.2; border-radius:3vmin; font-size:clamp(3.5rem, 13vmin, 6.5rem);
        background:${CARD_COLORS[i % CARD_COLORS.length] ?? '#fff'};
        box-shadow:0 6px 18px rgb(0 0 0 / 0.3), inset 0 -4px 12px rgb(0 0 0 / 0.1);
        display:flex; align-items:center; justify-content:center;
        opacity:0; transform:scale(0.6); transition:opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      `;
      const card = { el, word };
      el.addEventListener('pointerdown', () => {
        this.say(card);
      });
      this.grid.appendChild(el);
      this.cards.push(card);
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      }, 60 * i);
    });
  }

  private say(card: { el: HTMLElement; word: Word }): void {
    if (this.destroyed) return;
    this.ctx.audio.randomNote(0.35);
    this.ctx.audio.speak(card.word.word);
    this.ctx.bump();
    card.el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.22) rotate(-4deg)' },
        { transform: 'scale(1)' },
      ],
      { duration: 420, easing: 'ease-in-out' },
    );
    const r = card.el.getBoundingClientRect();
    this.ctx.particles.burst({
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      count: 6,
      emoji: ['✨'],
      speed: [50, 170],
      size: [7, 11],
      ttl: [0.4, 0.8],
      gravity: 140,
    });
    if (++this.taps >= TAPS_PER_SET) {
      this.ctx.audio.chime();
      setTimeout(() => {
        if (!this.destroyed) this.dealSet();
      }, 600);
    }
  }
}
