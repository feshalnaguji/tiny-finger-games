import { CanvasLayer } from '../engine/canvas';
import { pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart';

interface Floater {
  kind: ShapeKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  spin: number;
  angle: number;
  /** >0 while gliding into the outline (progress 0..1) */
  snapping: number;
  fromX: number;
  fromY: number;
  jiggle: number;
}

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart'];

/**
 * One big dashed outline; floating shapes drift around it. Tap the match and it
 * snaps in with a chime and confetti. Tap anything else and it just jiggles
 * happily — never a buzzer. A smash toy at 1, a matching game at 3.
 */
export class ShapeParty implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private target: ShapeKind = 'circle';
  private floaters: Floater[] = [];
  private celebration = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #00695c 0%, #00897b 55%, #26a69a 100%)';
    this.layer = new CanvasLayer(ctx.host);
    this.newRound();

    ctx.input.onDown((p) => {
      const f = this.floaterAt(p.x, p.y);
      if (!f || f.snapping > 0) return;
      this.ctx.bump();
      if (f.kind === this.target) {
        f.snapping = 0.0001;
        f.fromX = f.x;
        f.fromY = f.y;
        this.ctx.audio.chime();
      } else {
        f.jiggle = 1;
        this.ctx.audio.pop(0.4);
      }
    });
  }

  update(dt: number): void {
    const w = this.layer.width;
    const h = this.layer.height;
    const center = { x: w / 2, y: h / 2 };
    if (this.celebration > 0) this.celebration -= dt;

    for (const f of this.floaters) {
      if (f.snapping > 0) {
        f.snapping = Math.min(1, f.snapping + dt * 2.2);
        const t = 1 - Math.pow(1 - f.snapping, 3);
        f.x = f.fromX + (center.x - f.fromX) * t;
        f.y = f.fromY + (center.y - f.fromY) * t;
        f.angle *= 1 - t;
        if (f.snapping >= 1) this.complete();
        continue;
      }
      f.jiggle = Math.max(0, f.jiggle - dt * 2.5);
      f.angle += f.spin * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      const m = f.size;
      if (f.x < m) f.vx = Math.abs(f.vx);
      if (f.x > w - m) f.vx = -Math.abs(f.vx);
      if (f.y < m) f.vy = Math.abs(f.vy);
      if (f.y > h - m) f.vy = -Math.abs(f.vy);
      // gentle repulsion from the center so floaters don't cover the outline
      const dx = f.x - center.x;
      const dy = f.y - center.y;
      const d = Math.hypot(dx, dy);
      const clear = Math.min(w, h) * 0.28;
      if (d < clear && d > 1) {
        f.vx += (dx / d) * 60 * dt;
        f.vy += (dy / d) * 60 * dt;
      }
    }

    this.draw();
  }

  resize(): void {
    // floaters bounce off the new walls naturally
  }

  destroy(): void {
    this.layer.dispose();
    this.floaters = [];
    this.ctx.host.style.background = '';
  }

  private newRound(): void {
    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    this.target = pick(KINDS);
    this.floaters = [];
    const kinds: ShapeKind[] = [
      this.target,
      this.target,
      ...KINDS.filter((k) => k !== this.target),
    ];
    for (const kind of kinds) {
      const edge = Math.floor(range(0, 4));
      const size = Math.min(w, h) * range(0.07, 0.1);
      this.floaters.push({
        kind,
        x: edge % 2 === 0 ? range(size, w - size) : edge === 1 ? size * 1.2 : w - size * 1.2,
        y: edge % 2 === 1 ? range(size, h - size) : edge === 0 ? size * 1.2 : h - size * 1.2,
        vx: range(-60, 60),
        vy: range(-60, 60),
        size,
        hue: range(0, 360),
        spin: range(-0.8, 0.8),
        angle: range(0, Math.PI * 2),
        snapping: 0,
        fromX: 0,
        fromY: 0,
        jiggle: 0,
      });
    }
  }

  private complete(): void {
    const w = this.layer.width;
    const h = this.layer.height;
    this.celebration = 1.2;
    this.ctx.audio.sparkle();
    this.ctx.particles.burst({
      x: w / 2,
      y: h / 2,
      count: this.ctx.settings().calm ? 25 : 50,
      colors: ['#ffd54f', '#4dd0e1', '#f06292', '#aed581', '#ffffff'],
      speed: [100, 380],
      size: [3, 8],
      ttl: [0.6, 1.3],
      gravity: 260,
    });
    window.setTimeout(() => {
      this.newRound();
    }, 900);
  }

  private floaterAt(x: number, y: number): Floater | null {
    for (const f of this.floaters) {
      if (Math.hypot(x - f.x, y - f.y) < f.size * 1.35) return f;
    }
    return null;
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const w = this.layer.width;
    const h = this.layer.height;
    const outlineSize = Math.min(w, h) * 0.16;

    // dashed target outline
    c.save();
    c.translate(w / 2, h / 2);
    c.setLineDash([12, 10]);
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 5;
    this.tracePath(c, this.target, outlineSize);
    c.stroke();
    c.restore();

    for (const f of this.floaters) {
      const jiggleRot = f.jiggle > 0 ? Math.sin(f.jiggle * 25) * 0.25 * f.jiggle : 0;
      const scale = 1 + (f.jiggle > 0 ? Math.sin(f.jiggle * 20) * 0.12 * f.jiggle : 0);
      c.save();
      c.translate(f.x, f.y);
      c.rotate(f.angle + jiggleRot);
      c.scale(scale, scale);
      c.fillStyle = `hsl(${f.hue} 80% 65%)`;
      c.strokeStyle = `hsl(${f.hue} 85% 85%)`;
      c.lineWidth = 3;
      this.tracePath(c, f.kind, f.size);
      c.fill();
      c.stroke();
      c.restore();
    }
  }

  private tracePath(c: CanvasRenderingContext2D, kind: ShapeKind, s: number): void {
    c.beginPath();
    switch (kind) {
      case 'circle':
        c.arc(0, 0, s, 0, Math.PI * 2);
        break;
      case 'square':
        c.rect(-s * 0.88, -s * 0.88, s * 1.76, s * 1.76);
        break;
      case 'triangle':
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
          const x = Math.cos(a) * s * 1.1;
          const y = Math.sin(a) * s * 1.1;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.closePath();
        break;
      case 'star':
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const r = i % 2 === 0 ? s * 1.15 : s * 0.5;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.closePath();
        break;
      case 'heart': {
        const k = s * 1.1;
        c.moveTo(0, k * 0.35);
        c.bezierCurveTo(-k * 1.1, -k * 0.45, -k * 0.5, -k * 1.05, 0, -k * 0.4);
        c.bezierCurveTo(k * 0.5, -k * 1.05, k * 1.1, -k * 0.45, 0, k * 0.35);
        c.closePath();
        break;
      }
    }
  }
}
