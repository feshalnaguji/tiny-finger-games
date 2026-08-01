import type { AnimalKind } from '../engine/audio';
import { pick } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Friend {
  kind: AnimalKind;
  emoji: string;
  name: string;
  says: string;
}

const FRIENDS: Friend[] = [
  { kind: 'cat', emoji: '🐱', name: 'Cat', says: 'meow' },
  { kind: 'dog', emoji: '🐶', name: 'Dog', says: 'woof' },
  { kind: 'cow', emoji: '🐮', name: 'Cow', says: 'moo' },
  { kind: 'duck', emoji: '🦆', name: 'Duck', says: 'quack' },
  { kind: 'sheep', emoji: '🐑', name: 'Sheep', says: 'baa' },
  { kind: 'frog', emoji: '🐸', name: 'Frog', says: 'ribbit' },
  { kind: 'bird', emoji: '🐦', name: 'Bird', says: 'tweet' },
  { kind: 'lion', emoji: '🦁', name: 'Lion', says: 'roar' },
];

const CARD_COLORS = [
  '#ef9a9a',
  '#ffcc80',
  '#fff59d',
  '#a5d6a7',
  '#80deea',
  '#90caf9',
  '#ce93d8',
  '#f48fb1',
];

/**
 * Huge animal cards that call back when tapped. Positions never change
 * (toddlers navigate by spatial memory); colors refresh to stay lively.
 */
export class AnimalFriends implements Game {
  private ctx!: GameContext;
  private cards: HTMLElement[] = [];
  private idleTimer = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #33691e 0%, #558b2f 60%, #7cb342 100%)';

    const grid = document.createElement('div');
    grid.style.cssText = `
      position:absolute; inset:0; display:grid; gap:2.5vmin;
      padding:max(3vmin, env(safe-area-inset-top)) 3vmin max(3vmin, env(safe-area-inset-bottom));
      grid-template-columns:repeat(auto-fit, minmax(min(11rem, 40vw), 1fr));
      align-content:center;
    `;
    FRIENDS.forEach((friend, i) => {
      const card = document.createElement('button');
      card.setAttribute('aria-label', friend.name);
      card.textContent = friend.emoji;
      card.style.cssText = `
        aspect-ratio:1.15; border-radius:3vmin; font-size:clamp(3.5rem, 14vmin, 7rem);
        background:${CARD_COLORS[i] ?? '#fff'};
        box-shadow:0 6px 18px rgb(0 0 0 / 0.3), inset 0 -4px 12px rgb(0 0 0 / 0.12);
        display:flex; align-items:center; justify-content:center;
        transition:transform 0.12s ease;
      `;
      card.addEventListener('pointerdown', (e) => {
        this.greet(friend, card, e.clientX, e.clientY);
      });
      grid.appendChild(card);
      this.cards.push(card);
    });
    ctx.host.appendChild(grid);

    // each key maps to one animal, so keyboard smashing tours the whole farm
    ctx.input.onKey((k) => {
      if (k.repeat) return;
      let hash = 0;
      for (const c of k.code) hash = (hash * 31 + c.charCodeAt(0)) % 997;
      const i = hash % FRIENDS.length;
      const friend = FRIENDS[i];
      const card = this.cards[i];
      if (friend && card) {
        const r = card.getBoundingClientRect();
        this.greet(friend, card, r.left + r.width / 2, r.top + r.height / 2);
      }
    });

    this.scheduleIdleWiggle();
  }

  resize(): void {
    // grid reflows itself
  }

  destroy(): void {
    clearTimeout(this.idleTimer);
    this.cards = [];
    this.ctx.host.style.background = '';
  }

  private greet(friend: Friend, card: HTMLElement, x: number, y: number): void {
    this.ctx.audio.animal(friend.kind);
    this.ctx.audio.speak(`${friend.name} says ${friend.says}!`);
    this.ctx.bump();
    this.wiggle(card, 1.18);
    card.style.background = pick(CARD_COLORS);
    this.ctx.particles.burst({
      x,
      y,
      count: 8,
      emoji: ['✨', '💛'],
      speed: [60, 200],
      size: [8, 14],
      ttl: [0.4, 0.9],
      gravity: 180,
    });
  }

  private wiggle(card: HTMLElement, scale: number): void {
    card.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: `rotate(-6deg) scale(${scale})` },
        { transform: `rotate(6deg) scale(${scale})` },
        { transform: 'rotate(0deg) scale(1)' },
      ],
      { duration: 450, easing: 'ease-in-out' },
    );
  }

  private scheduleIdleWiggle(): void {
    this.idleTimer = window.setTimeout(() => {
      if (!this.ctx.settings().calm) {
        const card = pick(this.cards);
        this.wiggle(card, 1.08);
      }
      this.scheduleIdleWiggle();
    }, 4500);
  }
}
