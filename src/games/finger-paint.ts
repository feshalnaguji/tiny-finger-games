import { CanvasLayer } from '../engine/canvas';
import { PENTATONIC } from '../engine/audio';
import type { Game, GameContext } from './types';

interface Point {
  x: number;
  y: number;
  t: number;
  hue: number;
}

const FADE_S = 45;
const MAX_POINTS = 4000;

/**
 * Every finger is a rainbow brush with a sparkle trail; drawing plays gentle
 * notes pitched by height. Strokes slowly fade so there is nothing to manage.
 */
export class FingerPaint implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private strokes: Point[][] = [];
  private active = new Map<number, Point[]>();
  private hue = 0;
  private lastNote = 0;
  private now = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #141126 0%, #1d1735 100%)';
    this.layer = new CanvasLayer(ctx.host);

    ctx.input.onDown((p) => {
      const stroke: Point[] = [{ x: p.x, y: p.y, t: this.now, hue: this.hue }];
      this.active.set(p.id, stroke);
      this.strokes.push(stroke);
      this.playNote(p.y);
      this.ctx.bump();
    });
    ctx.input.onMove((p) => {
      const stroke = this.active.get(p.id);
      if (!stroke) return;
      const last = stroke[stroke.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 3) return;
      stroke.push({ x: p.x, y: p.y, t: this.now, hue: this.hue });
      if (this.now - this.lastNote > 0.16) this.playNote(p.y);
      if (Math.random() < 0.3) {
        this.ctx.particles.burst({
          x: p.x,
          y: p.y,
          count: 1,
          colors: [`hsl(${this.hue} 90% 75%)`, '#ffffff'],
          speed: [10, 60],
          size: [1.5, 3.5],
          ttl: [0.3, 0.7],
          gravity: 40,
        });
      }
    });
    ctx.input.onUp((p) => this.active.delete(p.id));
    // key presses splat paint dabs — keyboard babies get to paint too
    ctx.input.onKey(() => {
      const w = this.layer.width || 400;
      const h = this.layer.height || 400;
      const x = w * (0.1 + Math.random() * 0.8);
      const y = h * (0.1 + Math.random() * 0.8);
      const dab: Point[] = [];
      for (let a = 0; a < Math.PI * 2.2; a += 0.9) {
        dab.push({ x: x + Math.cos(a) * 8, y: y + Math.sin(a) * 8, t: this.now, hue: this.hue });
      }
      this.strokes.push(dab);
      this.playNote(y);
      this.ctx.bump();
      this.ctx.particles.burst({
        x,
        y,
        count: 6,
        colors: [`hsl(${this.hue} 90% 75%)`, '#ffffff'],
        speed: [30, 120],
        size: [2, 4],
        ttl: [0.3, 0.7],
        gravity: 60,
      });
    });
  }

  update(dt: number): void {
    this.now += dt;
    this.hue = (this.hue + dt * 60) % 360;

    // prune faded points and enforce the global cap
    const cutoff = this.now - FADE_S;
    for (const stroke of this.strokes) {
      while (stroke.length && stroke[0]!.t < cutoff) stroke.shift();
    }
    this.strokes = this.strokes.filter((s) => s.length > 0);
    let total = this.strokes.reduce((n, s) => n + s.length, 0);
    while (total > MAX_POINTS && this.strokes.length) {
      const oldest = this.strokes[0]!;
      oldest.shift();
      if (!oldest.length) this.strokes.shift();
      total--;
    }

    this.draw();
  }

  resize(): void {
    // strokes live in screen coordinates; a resize just shifts the art
  }

  destroy(): void {
    this.layer.dispose();
    this.strokes = [];
    this.active.clear();
    this.ctx.host.style.background = '';
  }

  private playNote(y: number): void {
    this.lastNote = this.now;
    const h = Math.max(this.layer.height, 1);
    const idx = Math.max(
      0,
      Math.min(PENTATONIC.length - 1, Math.floor((1 - y / h) * PENTATONIC.length)),
    );
    this.ctx.audio.note(PENTATONIC[idx] ?? 60, { wave: 'sine', vel: 0.3, dur: 0.35 });
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const width = Math.max(10, Math.min(this.layer.width, this.layer.height) * 0.028);

    for (const stroke of this.strokes) {
      for (let i = 1; i < stroke.length; i++) {
        const a = stroke[i - 1]!;
        const b = stroke[i]!;
        const age = this.now - b.t;
        const alpha = Math.max(0, 1 - age / FADE_S);
        c.strokeStyle = `hsla(${b.hue}, 90%, 65%, ${alpha})`;
        c.lineWidth = width * (0.7 + 0.3 * alpha);
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }
    }
  }
}
