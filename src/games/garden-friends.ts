import { CanvasLayer } from '../engine/canvas';
import { chance, pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Flower {
  x: number;
  y: number;
  emoji: string;
  size: number;
  /** growth progress 0..1 with a springy overshoot */
  grow: number;
  sway: number;
}

interface Bee {
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  target: Flower | null;
  circle: number;
}

const FLOWERS = ['🌸', '🌷', '🌻', '🌼', '🌺', '🪻'];
const MAX_FLOWERS = 22;

/**
 * Tap the meadow and a flower springs up with a rising note; bees and a
 * butterfly fly over to visit the newest blooms. Gentle gardening, no weeds.
 */
export class GardenFriends implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private flowers: Flower[] = [];
  private bees: Bee[] = [];
  private windT = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #90caf9 0%, #c5e1a5 40%, #7cb342 100%)';
    this.layer = new CanvasLayer(ctx.host);

    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    this.bees.push(
      { x: w * 0.3, y: h * 0.25, vx: 40, vy: 10, emoji: '🐝', target: null, circle: 0 },
      { x: w * 0.7, y: h * 0.2, vx: -35, vy: 15, emoji: '🦋', target: null, circle: Math.PI },
    );

    ctx.input.onDown((p) => {
      this.plant(p.x, p.y);
    });
    ctx.input.onKey(() => {
      const w2 = this.layer.width || 400;
      const h2 = this.layer.height || 400;
      this.plant(w2 * (0.08 + Math.random() * 0.84), h2 * (0.45 + Math.random() * 0.45));
    });
  }

  update(dt: number): void {
    this.windT += dt;
    const w = this.layer.width;
    const h = this.layer.height;

    for (const f of this.flowers) {
      f.grow = Math.min(1, f.grow + dt * 2.2);
      f.sway += dt * (1.5 + f.size * 0.01);
    }

    for (const bee of this.bees) {
      if (!bee.target || !this.flowers.includes(bee.target)) {
        bee.target = this.flowers[this.flowers.length - 1] ?? null;
      }
      if (bee.target && bee.target.grow >= 1) {
        // orbit the newest bloom
        bee.circle += dt * 2.4;
        const ox = Math.cos(bee.circle) * bee.target.size * 1.1;
        const oy = Math.sin(bee.circle) * bee.target.size * 0.5 - bee.target.size * 1.15;
        const tx = bee.target.x + ox;
        const ty = bee.target.y + oy;
        bee.vx += (tx - bee.x) * 3 * dt;
        bee.vy += (ty - bee.y) * 3 * dt;
        if (chance(dt * 0.5)) this.ctx.audio.sparkle();
      } else {
        bee.vx += range(-40, 40) * dt;
        bee.vy += range(-40, 40) * dt;
      }
      const speed = Math.hypot(bee.vx, bee.vy);
      const max = 160;
      if (speed > max) {
        bee.vx = (bee.vx / speed) * max;
        bee.vy = (bee.vy / speed) * max;
      }
      bee.x += bee.vx * dt;
      bee.y += bee.vy * dt;
      bee.x = Math.max(20, Math.min(w - 20, bee.x));
      bee.y = Math.max(20, Math.min(h * 0.85, bee.y));
    }

    this.draw();
  }

  resize(): void {
    // meadow stretches; flowers stay where they were planted
  }

  destroy(): void {
    this.layer.dispose();
    this.flowers = [];
    this.bees = [];
    this.ctx.host.style.background = '';
  }

  private plant(x: number, y: number): void {
    const h = this.layer.height || 600;
    // flowers grow from the meadow, not the sky
    const gy = Math.max(y, h * 0.42);
    if (this.flowers.length >= MAX_FLOWERS) {
      const old = this.flowers.shift();
      if (old) {
        this.ctx.particles.burst({
          x: old.x,
          y: old.y,
          count: 8,
          emoji: ['🌸', '🍃'],
          speed: [30, 110],
          size: [6, 10],
          ttl: [0.5, 1],
          gravity: 60,
        });
      }
    }
    this.flowers.push({
      x,
      y: gy,
      emoji: pick(FLOWERS),
      size: Math.min(this.layer.width || 800, h) * range(0.05, 0.08),
      grow: 0,
      sway: range(0, Math.PI * 2),
    });
    // a rising "sprout" note — higher plantings chirp higher
    const midi = 60 + Math.round((1 - gy / Math.max(h, 1)) * 12);
    this.ctx.audio.note(midi, { wave: 'triangle', dur: 0.3, vel: 0.4 });
    this.ctx.audio.note(midi + 7, { wave: 'sine', dur: 0.35, vel: 0.3, delay: 0.12 });
    this.ctx.bump();
    this.ctx.particles.burst({
      x,
      y: gy,
      count: 5,
      colors: ['#aed581', '#dcedc8', '#ffffff'],
      speed: [30, 120],
      size: [2, 5],
      ttl: [0.3, 0.7],
      gravity: 160,
    });
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const w = this.layer.width;
    const h = this.layer.height;

    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // sun + drifting cloud
    c.font = `${Math.round(Math.min(w, h) * 0.09)}px serif`;
    c.fillText('🌤️', w * 0.12, h * 0.12);
    const cloudX = ((this.windT * 9) % (w + 160)) - 80;
    c.font = `${Math.round(Math.min(w, h) * 0.06)}px serif`;
    c.fillText('☁️', cloudX, h * 0.1);

    // flowers, oldest behind newest, springy grow + gentle sway
    for (const f of this.flowers) {
      const spring = f.grow < 1 ? 1.25 * f.grow : 1;
      const wobble = Math.sin(f.sway + this.windT * 0.8) * 0.06;
      c.save();
      c.translate(f.x, f.y);
      c.rotate(wobble);
      c.scale(spring, spring);
      c.font = `${Math.round(f.size * 2)}px serif`;
      c.fillText(f.emoji, 0, 0);
      c.restore();
    }

    for (const bee of this.bees) {
      c.save();
      c.translate(bee.x, bee.y);
      c.scale(bee.vx > 0 ? -1 : 1, 1);
      c.rotate(Math.sin(this.windT * 6) * 0.1);
      c.font = `${Math.round(Math.min(w, h) * 0.055)}px serif`;
      c.fillText(bee.emoji, 0, 0);
      c.restore();
    }
  }
}
