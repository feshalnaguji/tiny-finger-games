import { range, pick } from './rng';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  size: number;
  color: string;
  emoji: string | null;
  gravity: number;
  drag: number;
}

export interface BurstOptions {
  x: number;
  y: number;
  count: number;
  colors?: readonly string[];
  emoji?: readonly string[];
  /** [min, max] initial speed in px/s */
  speed?: readonly [number, number];
  /** [min, max] particle size in px */
  size?: readonly [number, number];
  /** [min, max] lifetime in seconds */
  ttl?: readonly [number, number];
  /** [from, to] emission angle in radians; default full circle */
  angle?: readonly [number, number];
  gravity?: number;
  drag?: number;
}

const MAX_PARTICLES = 700;

/**
 * One pooled particle system renders onto the app's overlay canvas, above every
 * game, so DOM games get confetti for free. `intensity` scales counts for calm mode.
 */
export class ParticleSystem {
  intensity = 1;

  private particles: Particle[] = [];

  burst(o: BurstOptions): void {
    const count = Math.max(1, Math.round(o.count * this.intensity));
    const [sMin, sMax] = o.speed ?? [60, 260];
    const [szMin, szMax] = o.size ?? [4, 10];
    const [tMin, tMax] = o.ttl ?? [0.5, 1.1];
    const [aFrom, aTo] = o.angle ?? [0, Math.PI * 2];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const angle = range(aFrom, aTo);
      const speed = range(sMin, sMax);
      this.particles.push({
        x: o.x,
        y: o.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        ttl: range(tMin, tMax),
        size: range(szMin, szMax),
        color: o.colors ? pick(o.colors) : '#ffffff',
        emoji: o.emoji ? pick(o.emoji) : null,
        gravity: o.gravity ?? 300,
        drag: o.drag ?? 0.9,
      });
    }
  }

  update(dt: number): void {
    const drag = (p: Particle) => Math.pow(p.drag, dt * 60);
    let write = 0;
    for (const p of this.particles) {
      p.age += dt;
      if (p.age >= p.ttl) continue;
      const d = drag(p);
      p.vx *= d;
      p.vy = p.vy * d + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      this.particles[write++] = p;
    }
    this.particles.length = write;
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.age / p.ttl;
      ctx.globalAlpha = alpha;
      if (p.emoji) {
        ctx.font = `${Math.round(p.size * 2.4)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.particles.length = 0;
  }

  get count(): number {
    return this.particles.length;
  }
}
