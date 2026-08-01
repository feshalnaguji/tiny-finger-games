import { CanvasLayer } from '../engine/canvas';
import { pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Shell {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  hue: number;
  shape: 'sphere' | 'ring' | 'heart' | 'willow';
}

const SHAPES = ['sphere', 'ring', 'heart', 'willow'] as const;

/**
 * Tap the sky and a firework flies to exactly that spot. Holding a finger down
 * launches a slow volley. Pure spectacle-on-demand.
 */
export class Fireworks implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private shells: Shell[] = [];
  private held = new Map<number, { x: number; y: number; next: number }>();
  private skyPhase = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    this.layer = new CanvasLayer(ctx.host);
    this.paintSky();

    ctx.input.onDown((p) => {
      this.launch(p.x, p.y);
      this.held.set(p.id, { x: p.x, y: p.y, next: 0.75 });
    });
    ctx.input.onMove((p) => {
      const h = this.held.get(p.id);
      if (h) {
        h.x = p.x;
        h.y = p.y;
      }
    });
    ctx.input.onUp((p) => this.held.delete(p.id));
  }

  update(dt: number): void {
    this.skyPhase += dt / 90;

    for (const h of this.held.values()) {
      h.next -= dt;
      if (h.next <= 0) {
        h.next = 0.75;
        this.launch(h.x, h.y);
      }
    }

    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i]!;
      s.y += s.vy * dt;
      if (s.y <= s.targetY) {
        this.shells.splice(i, 1);
        this.explode(s);
      }
    }
    this.draw();
  }

  resize(): void {
    this.paintSky();
  }

  destroy(): void {
    this.layer.dispose();
    this.shells = [];
    this.held.clear();
    this.ctx.host.style.background = '';
  }

  private paintSky(): void {
    this.ctx.host.style.background =
      'linear-gradient(180deg, #050514 0%, #10102e 55%, #1c1042 100%)';
  }

  private launch(x: number, y: number): void {
    const h = this.layer.height || 600;
    const targetY = Math.min(y, h * 0.85);
    this.shells.push({
      x,
      y: h + 10,
      targetY,
      vy: -Math.max(500, (h - targetY) * 1.4),
      hue: range(0, 360),
      shape: pick(SHAPES),
    });
    this.ctx.audio.whoosh('up');
    this.ctx.bump();
  }

  private explode(s: Shell): void {
    this.ctx.audio.boom();
    this.ctx.audio.sparkle();
    const colors = [
      `hsl(${s.hue} 95% 65%)`,
      `hsl(${(s.hue + 40) % 360} 95% 70%)`,
      '#ffffff',
      '#ffe082',
    ];
    const calm = this.ctx.settings().calm;
    const count = calm ? 40 : 90;

    if (s.shape === 'heart') {
      for (let i = 0; i < count; i++) {
        const t = range(0, Math.PI * 2);
        // classic parametric heart, scaled and flipped for canvas coordinates
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        const speed = range(8, 14);
        this.burstOne(s.x, s.y, hx * speed, hy * speed, colors, 1.4);
      }
    } else if (s.shape === 'ring') {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const speed = range(230, 260);
        this.burstOne(s.x, s.y, Math.cos(a) * speed, Math.sin(a) * speed, colors, 1.2);
      }
    } else if (s.shape === 'willow') {
      this.ctx.particles.burst({
        x: s.x,
        y: s.y,
        count,
        colors,
        speed: [40, 180],
        size: [2, 5],
        ttl: [1.6, 2.6],
        gravity: 160,
        drag: 0.97,
      });
    } else {
      this.ctx.particles.burst({
        x: s.x,
        y: s.y,
        count,
        colors,
        speed: [60, 330],
        size: [2, 6],
        ttl: [0.7, 1.5],
        gravity: 220,
      });
    }
  }

  private burstOne(
    x: number,
    y: number,
    vx: number,
    vy: number,
    colors: string[],
    ttl: number,
  ): void {
    const speed = Math.hypot(vx, vy);
    const angle = Math.atan2(vy, vx);
    this.ctx.particles.burst({
      x,
      y,
      count: 1,
      colors,
      speed: [speed, speed],
      angle: [angle, angle],
      size: [2.5, 4.5],
      ttl: [ttl * 0.8, ttl],
      gravity: 170,
    });
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    // a faint drifting moon for company
    const w = this.layer.width;
    const moonX = w * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(this.skyPhase)));
    c.globalAlpha = 0.9;
    c.font = '42px serif';
    c.textAlign = 'center';
    c.fillText('🌙', moonX, 70);
    c.globalAlpha = 1;

    for (const s of this.shells) {
      c.strokeStyle = `hsla(${s.hue}, 90%, 75%, 0.8)`;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(s.x, s.y);
      c.lineTo(s.x, s.y + 14);
      c.stroke();
      c.fillStyle = '#fff8e1';
      c.beginPath();
      c.arc(s.x, s.y, 3, 0, Math.PI * 2);
      c.fill();
    }
  }
}
