import { CanvasLayer } from '../engine/canvas';
import { chance, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface FallingStar {
  x: number;
  y: number;
  vy: number;
  size: number;
  twinkle: number;
  /** set when swept up by a comet finger */
  caught: boolean;
}

interface Trail {
  x: number;
  y: number;
  age: number;
}

/**
 * Drag a finger and it becomes a glowing comet; stars it sweeps near are
 * collected with a rising melody. Stars that reach the ground aren't lost —
 * they burst into gentle glitter. Nothing can be missed, only enjoyed.
 */
export class StarCatcher implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private stars: FallingStar[] = [];
  private trails = new Map<number, Trail[]>();
  private melodyStep = 0;
  private shootingStar: { x: number; y: number; vx: number; vy: number } | null = null;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #0d0b2a 0%, #1a1348 60%, #2d1b69 100%)';
    this.layer = new CanvasLayer(ctx.host);

    ctx.input.onDown((p) => {
      this.trails.set(p.id, [{ x: p.x, y: p.y, age: 0 }]);
      this.sweep(p.x, p.y);
    });
    ctx.input.onMove((p) => {
      const trail = this.trails.get(p.id);
      if (!trail) return;
      trail.push({ x: p.x, y: p.y, age: 0 });
      if (trail.length > 24) trail.shift();
      this.sweep(p.x, p.y);
    });
    ctx.input.onUp((p) => {
      // let the released trail linger and fade instead of vanishing
      const trail = this.trails.get(p.id);
      this.trails.delete(p.id);
      if (trail) this.trails.set(-p.id - 1000, trail);
    });
  }

  update(dt: number): void {
    const w = this.layer.width;
    const h = this.layer.height;
    const calm = this.ctx.settings().calm;

    if (this.stars.length < (calm ? 6 : 10) && chance(dt * 1.4)) {
      this.stars.push({
        x: range(0.05, 0.95) * w,
        y: -20,
        vy: range(28, 70) * (calm ? 0.6 : 1),
        size: range(14, 26),
        twinkle: range(0, Math.PI * 2),
        caught: false,
      });
    }

    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i]!;
      s.y += s.vy * dt;
      s.twinkle += dt * 5;
      if (s.y > h - 8) {
        this.stars.splice(i, 1);
        this.ctx.audio.pop(0.2);
        this.ctx.particles.burst({
          x: s.x,
          y: h - 12,
          count: 10,
          colors: ['#fff59d', '#ffe082', '#ffffff'],
          speed: [30, 120],
          size: [1.5, 4],
          ttl: [0.4, 0.9],
          gravity: -40,
          angle: [Math.PI, Math.PI * 2],
        });
      }
    }

    for (const trail of this.trails.values()) {
      for (const t of trail) t.age += dt;
    }
    for (const [id, trail] of this.trails) {
      if (id < 0 && trail.every((t) => t.age > 0.6)) this.trails.delete(id);
    }

    // an occasional slow shooting star, just for wonder
    if (!this.shootingStar && chance(dt * 0.06)) {
      const fromLeft = chance(0.5);
      this.shootingStar = {
        x: fromLeft ? -30 : w + 30,
        y: range(0.05, 0.3) * h,
        vx: (fromLeft ? 1 : -1) * range(120, 180),
        vy: range(20, 50),
      };
    }
    if (this.shootingStar) {
      this.shootingStar.x += this.shootingStar.vx * dt;
      this.shootingStar.y += this.shootingStar.vy * dt;
      if (this.shootingStar.x < -60 || this.shootingStar.x > w + 60) this.shootingStar = null;
    }

    this.draw();
  }

  resize(): void {
    // stars keep falling wherever the sky now ends
  }

  destroy(): void {
    this.layer.dispose();
    this.stars = [];
    this.trails.clear();
    this.ctx.host.style.background = '';
  }

  private sweep(x: number, y: number): void {
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i]!;
      if (Math.hypot(x - s.x, y - s.y) < s.size + 46) {
        this.stars.splice(i, 1);
        this.ctx.audio.arpeggio(this.melodyStep++, 0.45);
        if (this.melodyStep > 14) this.melodyStep = 0;
        this.ctx.bump();
        this.ctx.particles.burst({
          x: s.x,
          y: s.y,
          count: 12,
          colors: ['#fff59d', '#ffd54f', '#ffffff', '#b39ddb'],
          speed: [50, 220],
          size: [2, 5],
          ttl: [0.4, 0.9],
          gravity: 100,
        });
      }
    }
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;

    if (this.shootingStar) {
      const s = this.shootingStar;
      const grad = c.createLinearGradient(s.x - s.vx * 0.4, s.y - s.vy * 0.4, s.x, s.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.8)');
      c.strokeStyle = grad;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(s.x - s.vx * 0.4, s.y - s.vy * 0.4);
      c.lineTo(s.x, s.y);
      c.stroke();
      c.font = '22px serif';
      c.textAlign = 'center';
      c.fillText('🌠', s.x, s.y);
    }

    // comet trails
    c.lineCap = 'round';
    for (const trail of this.trails.values()) {
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1]!;
        const b = trail[i]!;
        const alpha = Math.max(0, 1 - b.age / 0.6);
        if (alpha <= 0) continue;
        c.strokeStyle = `rgba(179, 157, 219, ${alpha * 0.8})`;
        c.lineWidth = 10 * alpha + 2;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }
      const head = trail[trail.length - 1];
      if (head && head.age < 0.3) {
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.beginPath();
        c.arc(head.x, head.y, 9, 0, Math.PI * 2);
        c.fill();
      }
    }

    // stars
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (const s of this.stars) {
      const pulse = 1 + Math.sin(s.twinkle) * 0.12;
      c.font = `${Math.round(s.size * 2 * pulse)}px serif`;
      c.fillText('⭐', s.x, s.y);
    }
  }
}
