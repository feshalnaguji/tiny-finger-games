import { pick } from '../engine/rng';
import type { AnimalKind } from '../engine/audio';
import type { Game, GameContext } from './types';

interface Hider {
  emoji: string;
  animal: AnimalKind | null;
}

const HIDERS: Hider[] = [
  { emoji: '🐱', animal: 'cat' },
  { emoji: '🐶', animal: 'dog' },
  { emoji: '🐮', animal: 'cow' },
  { emoji: '🦆', animal: 'duck' },
  { emoji: '🐸', animal: 'frog' },
  { emoji: '🦁', animal: 'lion' },
  { emoji: '🤡', animal: null },
  { emoji: '👶', animal: null },
  { emoji: '🧸', animal: null },
];

const DOOR_COLORS = ['#e57373', '#ffb74d', '#4db6ac', '#7986cb', '#f06292', '#aed581'];

/**
 * Four big doors; behind each, somebody new. Peekaboo is peak delight at age
 * one — object permanence as a game, with zero ways to get it wrong.
 */
export class Peekaboo implements Game {
  private ctx!: GameContext;
  private timers: number[] = [];
  private openFns: (() => void)[] = [];

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #4e342e 0%, #6d4c41 60%, #8d6e63 100%)';

    const grid = document.createElement('div');
    grid.style.cssText = `
      position:absolute; inset:0; display:grid; gap:4vmin;
      padding:max(4vmin, env(safe-area-inset-top)) 4vmin max(4vmin, env(safe-area-inset-bottom));
      grid-template-columns:repeat(auto-fit, minmax(min(14rem, 42vw), 1fr));
      align-content:center;
    `;
    for (let i = 0; i < 4; i++) this.buildDoor(grid, i);
    ctx.host.appendChild(grid);

    // keys map to doors, so keyboard smashing plays peekaboo too
    ctx.input.onKey((k) => {
      if (k.repeat) return;
      let hash = 0;
      for (const c of k.code) hash = (hash * 31 + c.charCodeAt(0)) % 997;
      this.openFns[hash % this.openFns.length]?.();
    });
  }

  resize(): void {
    // grid reflows itself
  }

  destroy(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    this.openFns = [];
    this.ctx.host.style.background = '';
  }

  private buildDoor(grid: HTMLElement, i: number): void {
    const frame = document.createElement('button');
    frame.setAttribute('aria-label', 'Peekaboo door');
    frame.style.cssText = `
      aspect-ratio:0.8; border-radius:3vmin; position:relative; overflow:hidden;
      background:#3e2723; box-shadow:0 6px 20px rgb(0 0 0 / 0.4);
      display:flex; align-items:center; justify-content:center;
    `;
    const friend = document.createElement('span');
    friend.style.cssText = `
      font-size:clamp(3.5rem, 15vmin, 7rem);
      transform:scale(0.3); opacity:0; transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
    `;
    const door = document.createElement('span');
    door.textContent = '🚪';
    door.style.cssText = `
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      font-size:clamp(4rem, 18vmin, 9rem);
      background:${DOOR_COLORS[i % DOOR_COLORS.length] ?? '#e57373'};
      transition:transform 0.3s ease-in, opacity 0.3s ease-in;
    `;
    frame.append(friend, door);
    grid.appendChild(frame);

    let busy = false;
    const open = () => {
      if (busy) return;
      busy = true;
      this.ctx.bump();

      const hider = pick(HIDERS);
      friend.textContent = hider.emoji;
      door.style.transform = 'translateX(85%) rotateY(50deg)';
      door.style.opacity = '0.15';
      friend.style.transform = 'scale(1)';
      friend.style.opacity = '1';

      this.ctx.audio.whoosh('down');
      if (hider.animal) this.ctx.audio.animal(hider.animal);
      this.ctx.audio.speak('Peekaboo!');

      const rect = frame.getBoundingClientRect();
      this.ctx.particles.burst({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        count: 8,
        emoji: ['✨', '⭐'],
        speed: [60, 200],
        size: [8, 13],
        ttl: [0.4, 0.9],
        gravity: 150,
      });

      this.timers.push(
        window.setTimeout(() => {
          this.ctx.audio.giggle();
        }, 900),
        window.setTimeout(() => {
          door.style.transform = '';
          door.style.opacity = '1';
          friend.style.transform = 'scale(0.3)';
          friend.style.opacity = '0';
          door.style.background = pick(DOOR_COLORS);
          busy = false;
        }, 2100),
      );
    };
    frame.addEventListener('pointerdown', open);
    this.openFns.push(open);
  }
}
