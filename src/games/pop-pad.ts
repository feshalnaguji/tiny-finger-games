import type { Game, GameContext } from './types';

const COLS = 5;
const ROWS = 4;
const ROW_COLORS = ['#ef5350', '#ffa726', '#66bb6a', '#42a5f5'];

/**
 * A pop-it fidget board: a grid of squishy buttons that pop in and out with
 * satisfying pitch-mapped pops. Pop every one and the board celebrates and
 * resets. The purest sensory toy in the arcade.
 */
export class PopPad implements Game {
  private ctx!: GameContext;
  private cells: { el: HTMLElement; popped: boolean; row: number }[] = [];
  private destroyed = false;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #37256b 0%, #4527a0 60%, #5e35b1 100%)';

    const grid = document.createElement('div');
    grid.style.cssText = `
      position:absolute; inset:0; display:grid; gap:2.2vmin;
      grid-template-columns:repeat(${COLS}, 1fr); grid-template-rows:repeat(${ROWS}, 1fr);
      padding:max(4vmin, env(safe-area-inset-top)) 4vmin max(4vmin, env(safe-area-inset-bottom));
      align-items:stretch;
    `;
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        const color = ROW_COLORS[r] ?? '#ef5350';
        const el = document.createElement('button');
        el.setAttribute('aria-label', 'pop bubble');
        el.style.cssText = `
          border-radius:50%; align-self:center; justify-self:center;
          width:min(16vmin, 100%); aspect-ratio:1;
          background:radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 55%, #fff), ${color});
          box-shadow:0 5px 14px rgb(0 0 0 / 0.35), inset 0 -4px 10px rgb(0 0 0 / 0.25), inset 0 4px 10px rgb(255 255 255 / 0.4);
          transition:transform 0.08s ease, box-shadow 0.08s ease, filter 0.08s ease;
        `;
        const cell = { el, popped: false, row: r };
        el.addEventListener('pointerdown', () => {
          this.toggle(cell);
        });
        grid.appendChild(el);
        this.cells.push(cell);
      }
    }
    ctx.host.appendChild(grid);

    // keys pop a random un-popped cell (or un-pop a random one once all are down)
    ctx.input.onKey(() => {
      const pool = this.cells.filter((c) => !c.popped);
      const target = pool.length
        ? pool[Math.floor(Math.random() * pool.length)]
        : this.cells[Math.floor(Math.random() * this.cells.length)];
      if (target) this.toggle(target);
    });
  }

  resize(): void {
    // css grid handles it
  }

  destroy(): void {
    this.destroyed = true;
    this.cells = [];
    this.ctx.host.style.background = '';
  }

  private toggle(cell: { el: HTMLElement; popped: boolean; row: number }): void {
    if (this.destroyed) return;
    cell.popped = !cell.popped;
    // pitch by row: lower rows pop deeper, like a real pop-it
    this.ctx.audio.pop(0.25 + cell.row * 0.2);
    this.ctx.bump();

    if (cell.popped) {
      cell.el.style.transform = 'scale(0.82)';
      cell.el.style.filter = 'brightness(0.7) saturate(0.8)';
      cell.el.style.boxShadow =
        'inset 0 5px 12px rgb(0 0 0 / 0.5), inset 0 -2px 6px rgb(255 255 255 / 0.15)';
    } else {
      cell.el.style.transform = '';
      cell.el.style.filter = '';
      cell.el.style.boxShadow =
        '0 5px 14px rgb(0 0 0 / 0.35), inset 0 -4px 10px rgb(0 0 0 / 0.25), inset 0 4px 10px rgb(255 255 255 / 0.4)';
    }

    if (this.cells.every((c) => c.popped)) this.celebrate();
  }

  private celebrate(): void {
    this.ctx.audio.sparkle();
    this.ctx.audio.chime();
    const rect = this.ctx.host.getBoundingClientRect();
    this.ctx.particles.burst({
      x: rect.width / 2,
      y: rect.height / 2,
      count: this.ctx.settings().calm ? 25 : 55,
      colors: [...ROW_COLORS, '#ffffff', '#ffd54f'],
      speed: [120, 380],
      size: [3, 8],
      ttl: [0.6, 1.4],
      gravity: 260,
    });
    // flip everything back up with a little stagger, ready to pop again
    this.cells.forEach((cell, i) => {
      setTimeout(
        () => {
          if (cell.popped) this.toggle(cell);
        },
        500 + i * 45,
      );
    });
  }
}
