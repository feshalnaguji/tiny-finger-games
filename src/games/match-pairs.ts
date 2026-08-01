import type { AnimalKind } from '../engine/audio';
import type { Game, GameContext } from './types';

interface PairAnimal {
  kind: AnimalKind;
  emoji: string;
  name: string;
}

const POOL: PairAnimal[] = [
  { kind: 'cat', emoji: '🐱', name: 'cats' },
  { kind: 'dog', emoji: '🐶', name: 'dogs' },
  { kind: 'cow', emoji: '🐮', name: 'cows' },
  { kind: 'duck', emoji: '🦆', name: 'ducks' },
  { kind: 'frog', emoji: '🐸', name: 'frogs' },
  { kind: 'bird', emoji: '🐦', name: 'birds' },
];

interface Card {
  el: HTMLElement;
  face: HTMLElement;
  animal: PairAnimal;
  up: boolean;
  matched: boolean;
}

/**
 * The gentlest possible memory game: four cards, two pairs. Flips reveal
 * animals with their calls; finding both of a kind earns a celebration, and
 * non-matches just flip calmly back. Memory practice with zero sting.
 */
export class MatchPairs implements Game {
  private ctx!: GameContext;
  private grid!: HTMLElement;
  private cards: Card[] = [];
  private first: Card | null = null;
  private busy = false;
  private matches = 0;
  private destroyed = false;
  private timers: number[] = [];

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #880e4f 0%, #ad1457 55%, #d81b60 100%)';
    this.grid = document.createElement('div');
    this.grid.style.cssText = `
      position:absolute; inset:0; display:grid; gap:4vmin;
      padding:max(5vmin, env(safe-area-inset-top)) 6vmin max(5vmin, env(safe-area-inset-bottom));
      grid-template-columns:repeat(2, minmax(0, 22rem)); justify-content:center; align-content:center;
    `;
    ctx.host.appendChild(this.grid);
    this.newRound();

    ctx.input.onKey((k) => {
      if (k.repeat) return;
      const down = this.cards.filter((c) => !c.up && !c.matched);
      const card = down[Math.floor(Math.random() * down.length)];
      if (card) this.flip(card);
    });
  }

  resize(): void {
    // grid reflows itself
  }

  destroy(): void {
    this.destroyed = true;
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    this.cards = [];
    this.ctx.host.style.background = '';
  }

  private newRound(): void {
    this.grid.innerHTML = '';
    this.cards = [];
    this.first = null;
    this.busy = false;
    this.matches = 0;
    const two = [...POOL].sort(() => Math.random() - 0.5).slice(0, 2);
    const deck = [...two, ...two].sort(() => Math.random() - 0.5);
    deck.forEach((animal, i) => {
      const el = document.createElement('button');
      el.setAttribute('aria-label', 'mystery card');
      el.style.cssText = `
        aspect-ratio:0.86; border-radius:3vmin;
        background:linear-gradient(160deg, #f8bbd0, #f48fb1);
        box-shadow:0 6px 18px rgb(0 0 0 / 0.35), inset 0 -4px 12px rgb(0 0 0 / 0.12);
        display:flex; align-items:center; justify-content:center;
        font-size:clamp(3rem, 13vmin, 6.5rem);
        transition:transform 0.22s ease, background 0.22s ease;
        opacity:0; transform:scale(0.6);
      `;
      const face = document.createElement('span');
      face.textContent = '🐾';
      face.style.transition = 'transform 0.22s ease';
      el.appendChild(face);
      const card: Card = { el, face, animal, up: false, matched: false };
      el.addEventListener('pointerdown', () => {
        this.flip(card);
      });
      this.grid.appendChild(el);
      this.cards.push(card);
      this.timers.push(
        window.setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }, 80 * i),
      );
    });
  }

  private setFace(card: Card, up: boolean): void {
    // a squash-flip: shrink horizontally, swap the face, pop back
    card.el.style.transform = 'scaleX(0.1)';
    this.timers.push(
      window.setTimeout(() => {
        card.face.textContent = up ? card.animal.emoji : '🐾';
        card.el.style.background = up
          ? 'linear-gradient(160deg, #fff9c4, #ffe082)'
          : 'linear-gradient(160deg, #f8bbd0, #f48fb1)';
        card.el.style.transform = 'scale(1)';
      }, 110),
    );
    card.up = up;
  }

  private flip(card: Card): void {
    if (this.destroyed || this.busy || card.up || card.matched) return;
    this.ctx.bump();
    this.setFace(card, true);
    this.ctx.audio.pop(0.35);
    this.timers.push(
      window.setTimeout(() => {
        this.ctx.audio.animal(card.animal.kind);
      }, 180),
    );

    if (!this.first) {
      this.first = card;
      return;
    }
    const a = this.first;
    this.first = null;

    if (a.animal.kind === card.animal.kind) {
      a.matched = card.matched = true;
      this.matches++;
      this.timers.push(
        window.setTimeout(() => {
          if (this.destroyed) return;
          this.ctx.audio.chime();
          this.ctx.audio.speak(`Two ${card.animal.name}! A pair!`);
          for (const m of [a, card]) {
            m.el.animate(
              [
                { transform: 'scale(1) rotate(0deg)' },
                { transform: 'scale(1.15) rotate(-5deg)' },
                { transform: 'scale(1.15) rotate(5deg)' },
                { transform: 'scale(1)' },
              ],
              { duration: 550, easing: 'ease-in-out' },
            );
            const r = m.el.getBoundingClientRect();
            this.ctx.particles.burst({
              x: r.left + r.width / 2,
              y: r.top + r.height / 2,
              count: this.ctx.settings().calm ? 8 : 16,
              emoji: ['⭐', '💛'],
              speed: [60, 200],
              size: [8, 13],
              ttl: [0.4, 0.9],
              gravity: 180,
            });
          }
          if (this.matches === 2) {
            this.ctx.audio.sparkle();
            this.timers.push(
              window.setTimeout(() => {
                if (!this.destroyed) this.newRound();
              }, 1300),
            );
          }
        }, 500),
      );
    } else {
      // no match — a calm look, a tiny giggle, and both flip quietly back
      this.busy = true;
      this.timers.push(
        window.setTimeout(() => {
          if (this.destroyed) return;
          this.ctx.audio.giggle();
          this.setFace(a, false);
          this.setFace(card, false);
          this.busy = false;
        }, 1300),
      );
    }
  }
}
