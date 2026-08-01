import { pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface ColorDef {
  name: string;
  hex: string;
}

const COLORS: ColorDef[] = [
  { name: 'Red', hex: '#ef5350' },
  { name: 'Blue', hex: '#42a5f5' },
  { name: 'Yellow', hex: '#ffd54f' },
  { name: 'Green', hex: '#66bb6a' },
];

const DOTS_PER_COLOR = 3;

/**
 * "Find the blue ones!" — a field of floating color dots and a big pulsing
 * target swatch. Touching the target color makes every matching dot celebrate;
 * touching any other color just names it and jiggles. Learning without losing.
 */
export class ColorPop implements Game {
  private ctx!: GameContext;
  private field!: HTMLElement;
  private banner!: HTMLElement;
  private target: ColorDef = COLORS[0]!;
  private dots: { el: HTMLElement; color: ColorDef }[] = [];
  private roundOver = false;
  private destroyed = false;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #263238 0%, #37474f 60%, #455a64 100%)';

    this.banner = document.createElement('div');
    this.banner.style.cssText = `
      position:absolute; top:max(2vmin, env(safe-area-inset-top)); left:50%;
      transform:translateX(-50%); z-index:5; width:clamp(4.5rem, 15vmin, 7rem);
      aspect-ratio:1; border-radius:50%; pointer-events:none;
      box-shadow:0 6px 24px rgb(0 0 0 / 0.4), inset 0 -5px 14px rgb(0 0 0 / 0.25), inset 0 5px 14px rgb(255 255 255 / 0.4);
    `;
    this.field = document.createElement('div');
    this.field.style.cssText = 'position:absolute; inset:0;';
    ctx.host.append(this.field, this.banner);
    this.newRound();

    ctx.input.onKey((k) => {
      if (k.repeat) return;
      const dot = this.dots[Math.floor(Math.random() * this.dots.length)];
      if (dot) this.touch(dot);
    });
  }

  resize(): void {
    // dots are positioned in percentages
  }

  destroy(): void {
    this.destroyed = true;
    this.dots = [];
    this.ctx.host.style.background = '';
  }

  private newRound(): void {
    this.roundOver = false;
    this.field.innerHTML = '';
    this.dots = [];
    this.target = pick(COLORS);
    this.banner.style.background = `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${this.target.hex} 55%, #fff), ${this.target.hex})`;
    this.banner.animate(
      [{ transform: 'translateX(-50%) scale(0.4)' }, { transform: 'translateX(-50%) scale(1)' }],
      { duration: 400, easing: 'cubic-bezier(0.34,1.56,0.64,1)' },
    );
    this.ctx.audio.speak(`Find ${this.target.name}!`);

    const spots: [number, number][] = [];
    for (const color of COLORS) {
      for (let i = 0; i < DOTS_PER_COLOR; i++) {
        // scatter without heavy overlap: jittered grid slots
        const slot = spots.length;
        const col = slot % 4;
        const row = Math.floor(slot / 4);
        const x = 10 + col * 22 + range(-4, 4);
        const y = 24 + row * 24 + range(-5, 5);
        spots.push([x, y]);

        const el = document.createElement('button');
        el.setAttribute('aria-label', color.name);
        el.style.cssText = `
          position:absolute; left:${x}%; top:${y}%;
          width:clamp(4rem, 14vmin, 6.5rem); aspect-ratio:1; border-radius:50%;
          background:radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color.hex} 55%, #fff), ${color.hex});
          box-shadow:0 5px 16px rgb(0 0 0 / 0.35), inset 0 -4px 10px rgb(0 0 0 / 0.25), inset 0 4px 10px rgb(255 255 255 / 0.4);
          animation:dot-float ${range(2.6, 4).toFixed(2)}s ease-in-out ${range(0, 2).toFixed(2)}s infinite alternate;
        `;
        const dot = { el, color };
        el.addEventListener('pointerdown', () => {
          this.touch(dot);
        });
        this.field.appendChild(el);
        this.dots.push(dot);
      }
    }
  }

  private touch(dot: { el: HTMLElement; color: ColorDef }): void {
    if (this.destroyed || this.roundOver) return;
    this.ctx.bump();
    if (dot.color.name === this.target.name) {
      this.roundOver = true;
      this.ctx.audio.chime();
      this.ctx.audio.speak(`${this.target.name}! Hooray!`);
      for (const d of this.dots) {
        if (d.color.name !== this.target.name) {
          d.el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          d.el.style.opacity = '0.15';
          d.el.style.transform = 'scale(0.7)';
          continue;
        }
        d.el.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.35)' },
            { transform: 'scale(0)', opacity: 0 },
          ],
          { duration: 700, easing: 'ease-in', fill: 'forwards' },
        );
        const r = d.el.getBoundingClientRect();
        this.ctx.particles.burst({
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          count: 14,
          colors: [dot.color.hex, '#ffffff'],
          speed: [80, 280],
          size: [3, 7],
          ttl: [0.5, 1.1],
          gravity: 220,
        });
      }
      this.ctx.audio.sparkle();
      setTimeout(() => {
        if (!this.destroyed) this.newRound();
      }, 1100);
    } else {
      // not the target — still a friendly lesson, never a buzzer
      this.ctx.audio.pop(0.4);
      this.ctx.audio.speak(dot.color.name);
      dot.el.animate(
        [
          { transform: 'rotate(0deg) scale(1)' },
          { transform: 'rotate(-8deg) scale(1.12)' },
          { transform: 'rotate(8deg) scale(1.12)' },
          { transform: 'rotate(0deg) scale(1)' },
        ],
        { duration: 380, easing: 'ease-in-out' },
      );
    }
  }
}
