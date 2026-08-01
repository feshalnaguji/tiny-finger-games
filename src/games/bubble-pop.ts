import { CanvasLayer } from '../engine/canvas';
import { range, rangeInt } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  hue: number;
  wobblePhase: number;
  wobbleSpeed: number;
}

const MIN_BUBBLES = 6;
const MAX_BUBBLES = 12;

/** Bubbles drift up; tap or sweep a finger through them to pop. No way to lose. */
export class BubblePop implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private bubbles: Bubble[] = [];
  private held = new Set<number>();

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #0a3d62 0%, #1e6091 60%, #2a9d8f 100%)';
    this.layer = new CanvasLayer(ctx.host);

    ctx.input.onDown((p) => {
      this.held.add(p.id);
      this.tryPop(p.x, p.y);
    });
    ctx.input.onMove((p) => {
      if (this.held.has(p.id)) this.tryPop(p.x, p.y);
    });
    ctx.input.onUp((p) => this.held.delete(p.id));
    // keyboard smashing pops bubbles too — every game is playable by tiny keyboardists
    ctx.input.onKey(() => {
      const i = Math.floor(Math.random() * this.bubbles.length);
      const b = this.bubbles[i];
      if (b) this.popAt(i, b);
    });

    for (let i = 0; i < MIN_BUBBLES; i++) this.spawn(range(0, this.layer.height));
  }

  update(dt: number): void {
    const calm = this.ctx.settings().calm;
    const speedScale = calm ? 0.6 : 1;
    for (const b of this.bubbles) {
      b.y -= b.vy * dt * speedScale;
      b.wobblePhase += b.wobbleSpeed * dt;
      b.x += Math.sin(b.wobblePhase) * 20 * dt;
    }
    // bubbles that reach the top pop themselves — a quiet reward for watching
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i]!;
      if (b.y + b.r < -10) {
        this.bubbles.splice(i, 1);
        this.splash(b, 6);
      }
    }
    const target = rangeInt(MIN_BUBBLES, MAX_BUBBLES);
    while (this.bubbles.length < target) this.spawn();
    this.draw();
  }

  resize(): void {
    // CanvasLayer tracks its host; bubbles just keep floating
  }

  destroy(): void {
    this.layer.dispose();
    this.bubbles = [];
    this.held.clear();
  }

  private spawn(y?: number): void {
    const h = this.layer.height || 600;
    const w = this.layer.width || 400;
    const r = range(28, Math.max(46, Math.min(w, h) * 0.09));
    this.bubbles.push({
      x: range(r, w - r),
      y: y ?? h + r + range(0, 80),
      r,
      vy: range(35, 90),
      hue: range(0, 360),
      wobblePhase: range(0, Math.PI * 2),
      wobbleSpeed: range(1, 3),
    });
  }

  private tryPop(x: number, y: number): void {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i]!;
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy <= (b.r + 14) * (b.r + 14)) {
        this.popAt(i, b);
      }
    }
  }

  private popAt(i: number, b: Bubble): void {
    this.bubbles.splice(i, 1);
    this.ctx.audio.pop(Math.min(1, b.r / 70));
    this.splash(b, 14);
    this.ctx.bump();
  }

  private splash(b: Bubble, count: number): void {
    this.ctx.particles.burst({
      x: b.x,
      y: b.y,
      count,
      colors: [`hsl(${b.hue} 80% 75%)`, '#ffffff', '#bde0fe'],
      speed: [50, 220],
      size: [2, 6],
      ttl: [0.3, 0.7],
      gravity: 260,
    });
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    for (const b of this.bubbles) {
      const grad = c.createRadialGradient(
        b.x - b.r * 0.35,
        b.y - b.r * 0.35,
        b.r * 0.1,
        b.x,
        b.y,
        b.r,
      );
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.3, `hsla(${b.hue}, 80%, 75%, 0.35)`);
      grad.addColorStop(1, `hsla(${b.hue}, 80%, 60%, 0.15)`);
      c.fillStyle = grad;
      c.beginPath();
      c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = `hsla(${b.hue}, 85%, 85%, 0.8)`;
      c.lineWidth = 2;
      c.stroke();
      // the little shine
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.beginPath();
      c.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.18, b.r * 0.1, -0.6, 0, Math.PI * 2);
      c.fill();
    }
  }
}
