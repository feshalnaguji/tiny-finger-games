import { CanvasLayer } from '../engine/canvas';
import { PENTATONIC } from '../engine/audio';
import { chance, pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Drop {
  x: number;
  y: number;
  vy: number;
}

interface Puddle {
  x: number;
  w: number;
}

const RAINBOW_AT = 80;

/**
 * Tap the sky and rain falls from that spot with plip-plop notes; puddles grow
 * along the ground, and enough rain earns a rainbow. Weather your toddler
 * controls — the cozy kind.
 */
export class RainMaker implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private drops: Drop[] = [];
  private puddles: Puddle[] = [];
  private held = new Map<number, { x: number; next: number }>();
  private landed = 0;
  private rainbow = 0;
  private windT = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background =
      'linear-gradient(180deg, #78909c 0%, #90a4ae 40%, #a5d6a7 78%, #7cb342 100%)';
    this.layer = new CanvasLayer(ctx.host);

    ctx.input.onDown((p) => {
      this.burst(p.x);
      this.held.set(p.id, { x: p.x, next: 0.3 });
    });
    ctx.input.onMove((p) => {
      const h = this.held.get(p.id);
      if (h) h.x = p.x;
    });
    ctx.input.onUp((p) => this.held.delete(p.id));
    ctx.input.onKey(() => {
      const w = this.layer.width || 400;
      this.burst(w * (0.1 + Math.random() * 0.8));
    });
  }

  update(dt: number): void {
    const w = this.layer.width;
    const h = this.layer.height;
    const ground = h * 0.82;
    this.windT += dt;

    for (const held of this.held.values()) {
      held.next -= dt;
      if (held.next <= 0) {
        held.next = 0.3;
        this.burst(held.x, 4);
      }
    }

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i]!;
      d.y += d.vy * dt;
      d.x += Math.sin(this.windT) * 6 * dt;
      if (d.y >= ground) {
        this.drops.splice(i, 1);
        this.land(d.x, ground);
      }
    }

    if (this.rainbow > 0) this.rainbow = Math.max(0, this.rainbow - dt / 6);
    this.draw(w, h, ground);
  }

  resize(): void {
    // sky and ground scale with the screen
  }

  destroy(): void {
    this.layer.dispose();
    this.drops = [];
    this.puddles = [];
    this.held.clear();
    this.ctx.host.style.background = '';
  }

  private burst(x: number, count = 8): void {
    const capped = Math.min(count, 140 - this.drops.length);
    for (let i = 0; i < capped; i++) {
      this.drops.push({
        x: x + range(-45, 45),
        y: range(-30, 40),
        vy: range(220, 380),
      });
    }
    this.ctx.audio.note(pick(PENTATONIC) + 12, { wave: 'sine', dur: 0.15, vel: 0.2 });
    this.ctx.bump();
  }

  private land(x: number, ground: number): void {
    this.landed++;
    // plip only sometimes, or heavy rain becomes a wall of sound
    if (chance(0.3)) {
      this.ctx.audio.note(pick(PENTATONIC) + 24, { wave: 'sine', dur: 0.1, vel: 0.12 });
    }
    this.ctx.particles.burst({
      x,
      y: ground,
      count: 2,
      colors: ['#b3e5fc', '#e1f5fe'],
      speed: [20, 90],
      size: [1.5, 3],
      ttl: [0.2, 0.5],
      gravity: 260,
      angle: [Math.PI, Math.PI * 2],
    });

    // grow the nearest puddle (or start one)
    const near = this.puddles.find((p) => Math.abs(p.x - x) < 90);
    if (near) near.w = Math.min(near.w + 3, 220);
    else if (this.puddles.length < 6) this.puddles.push({ x, w: 24 });

    if (this.landed >= RAINBOW_AT && this.rainbow <= 0) {
      this.landed = 0;
      this.rainbow = 1;
      this.ctx.audio.chime();
      this.ctx.audio.sparkle();
      this.ctx.particles.burst({
        x: (this.layer.width || 800) / 2,
        y: (this.layer.height || 600) * 0.35,
        count: this.ctx.settings().calm ? 20 : 40,
        colors: ['#ef5350', '#ffa726', '#ffee58', '#66bb6a', '#42a5f5', '#ab47bc'],
        speed: [60, 240],
        size: [3, 6],
        ttl: [0.6, 1.2],
        gravity: 180,
      });
    }
  }

  private draw(w: number, h: number, ground: number): void {
    this.layer.clear();
    const c = this.layer.ctx;
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // rainbow first, behind the weather
    if (this.rainbow > 0) {
      c.globalAlpha = Math.min(1, this.rainbow * 2);
      const bands = ['#ef5350', '#ffa726', '#ffee58', '#66bb6a', '#42a5f5', '#ab47bc'];
      bands.forEach((color, i) => {
        c.strokeStyle = color;
        c.lineWidth = Math.min(w, h) * 0.018;
        c.beginPath();
        c.arc(w / 2, ground + 40, Math.min(w, h) * (0.52 - i * 0.024), Math.PI, Math.PI * 2);
        c.stroke();
      });
      c.globalAlpha = 1;
    }

    // drifting clouds
    c.font = `${Math.round(Math.min(w, h) * 0.11)}px serif`;
    const cx = ((this.windT * 10) % (w + 220)) - 110;
    c.fillText('☁️', cx, h * 0.12);
    c.fillText('🌥️', (cx + w * 0.45) % (w + 220), h * 0.08);
    c.fillText('☁️', (cx + w * 0.8) % (w + 220), h * 0.17);

    // raindrops
    c.strokeStyle = 'rgba(187, 222, 251, 0.85)';
    c.lineWidth = 2.5;
    for (const d of this.drops) {
      c.beginPath();
      c.moveTo(d.x, d.y);
      c.lineTo(d.x - 1.5, d.y + 12);
      c.stroke();
    }

    // puddles shimmer on the grass
    for (const p of this.puddles) {
      c.fillStyle = 'rgba(129, 212, 250, 0.55)';
      c.beginPath();
      c.ellipse(p.x, ground + 8, p.w / 2, Math.max(5, p.w * 0.09), 0, 0, Math.PI * 2);
      c.fill();
    }
  }
}
