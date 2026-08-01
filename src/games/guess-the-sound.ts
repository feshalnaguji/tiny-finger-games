import type { AnimalKind } from '../engine/audio';
import { pick } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Contestant {
  kind: AnimalKind;
  emoji: string;
  name: string;
}

const ANIMALS: Contestant[] = [
  { kind: 'cat', emoji: '🐱', name: 'Cat' },
  { kind: 'dog', emoji: '🐶', name: 'Dog' },
  { kind: 'cow', emoji: '🐮', name: 'Cow' },
  { kind: 'duck', emoji: '🦆', name: 'Duck' },
  { kind: 'sheep', emoji: '🐑', name: 'Sheep' },
  { kind: 'frog', emoji: '🐸', name: 'Frog' },
  { kind: 'bird', emoji: '🐦', name: 'Bird' },
  { kind: 'lion', emoji: '🦁', name: 'Lion' },
];

const CARD_COLORS = ['#ffcc80', '#a5d6a7', '#90caf9', '#f48fb1'];

/**
 * A mystery call plays — who said it? Tap the right animal for a celebration;
 * tap another and it simply introduces itself with its own voice. Listening
 * practice with no way to lose, and a big 🔊 button to hear the call again.
 */
export class GuessTheSound implements Game {
  private ctx!: GameContext;
  private cards: { el: HTMLElement; animal: Contestant }[] = [];
  private target: Contestant = ANIMALS[0]!;
  private roundOver = false;
  private destroyed = false;
  private timers: number[] = [];
  private grid!: HTMLElement;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #4e342e 0%, #795548 55%, #a1887f 100%)';

    const replay = document.createElement('button');
    replay.setAttribute('aria-label', 'Hear the sound again');
    replay.textContent = '🔊';
    replay.style.cssText = `
      position:absolute; top:max(2vmin, env(safe-area-inset-top)); left:50%;
      transform:translateX(-50%); z-index:5;
      width:clamp(4.5rem, 15vmin, 7rem); aspect-ratio:1; border-radius:50%;
      font-size:clamp(2rem, 7vmin, 3.5rem);
      background:radial-gradient(circle at 35% 30%, #ffe082, #ffb300);
      box-shadow:0 6px 24px rgb(0 0 0 / 0.4), inset 0 -5px 14px rgb(0 0 0 / 0.25);
      display:flex; align-items:center; justify-content:center;
    `;
    replay.addEventListener('pointerdown', () => {
      if (this.destroyed) return;
      this.playCall();
      replay.animate(
        [
          { transform: 'translateX(-50%) scale(1)' },
          { transform: 'translateX(-50%) scale(1.15)' },
          { transform: 'translateX(-50%) scale(1)' },
        ],
        { duration: 300, easing: 'ease-in-out' },
      );
    });

    this.grid = document.createElement('div');
    this.grid.style.cssText = `
      position:absolute; inset:0; display:grid; gap:3vmin;
      padding:calc(max(2vmin, env(safe-area-inset-top)) + clamp(5rem, 17vmin, 8rem)) 4vmin max(4vmin, env(safe-area-inset-bottom));
      grid-template-columns:repeat(auto-fit, minmax(min(13rem, 40vw), 1fr));
      align-content:center;
    `;
    ctx.host.append(this.grid, replay);
    this.newRound();

    ctx.input.onKey((k) => {
      if (k.repeat) return;
      let hash = 0;
      for (const c of k.code) hash = (hash * 31 + c.charCodeAt(0)) % 997;
      const card = this.cards[hash % this.cards.length];
      if (card) this.guess(card);
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
    this.roundOver = false;
    this.grid.innerHTML = '';
    this.cards = [];
    const four = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 4);
    this.target = pick(four);
    four.forEach((animal, i) => {
      const el = document.createElement('button');
      el.setAttribute('aria-label', animal.name);
      el.textContent = animal.emoji;
      el.style.cssText = `
        aspect-ratio:1.15; border-radius:3vmin; font-size:clamp(3.5rem, 14vmin, 7rem);
        background:${CARD_COLORS[i] ?? '#ffcc80'};
        box-shadow:0 6px 18px rgb(0 0 0 / 0.3), inset 0 -4px 12px rgb(0 0 0 / 0.12);
        display:flex; align-items:center; justify-content:center;
        opacity:0; transform:scale(0.6); transition:opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      `;
      const card = { el, animal };
      el.addEventListener('pointerdown', () => {
        this.guess(card);
      });
      this.grid.appendChild(el);
      this.cards.push(card);
      this.timers.push(
        window.setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }, 60 * i),
      );
    });
    this.timers.push(
      window.setTimeout(() => {
        this.playCall();
      }, 700),
    );
  }

  private playCall(): void {
    this.ctx.audio.animal(this.target.kind);
    this.ctx.audio.speak('Who says that?');
  }

  private guess(card: { el: HTMLElement; animal: Contestant }): void {
    if (this.destroyed || this.roundOver) return;
    this.ctx.bump();
    if (card.animal.kind === this.target.kind) {
      this.roundOver = true;
      this.ctx.audio.animal(card.animal.kind);
      this.ctx.audio.chime();
      this.ctx.audio.speak(`${card.animal.name}! You found it!`);
      card.el.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.3) rotate(-6deg)' },
          { transform: 'scale(1.3) rotate(6deg)' },
          { transform: 'scale(1)' },
        ],
        { duration: 700, easing: 'ease-in-out' },
      );
      const r = card.el.getBoundingClientRect();
      this.ctx.particles.burst({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        count: this.ctx.settings().calm ? 12 : 24,
        emoji: ['⭐', '✨', '🎉'],
        speed: [80, 260],
        size: [8, 14],
        ttl: [0.5, 1.1],
        gravity: 200,
      });
      this.timers.push(
        window.setTimeout(() => {
          if (!this.destroyed) this.newRound();
        }, 1400),
      );
    } else {
      // a friendly introduction, never a buzzer — and a hint by elimination
      this.ctx.audio.animal(card.animal.kind);
      this.ctx.audio.speak(`That's the ${card.animal.name.toLowerCase()}`);
      card.el.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-7deg) scale(1.08)' },
          { transform: 'rotate(7deg) scale(1.08)' },
          { transform: 'rotate(0deg)' },
        ],
        { duration: 400, easing: 'ease-in-out' },
      );
    }
  }
}
