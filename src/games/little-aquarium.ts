import { CanvasLayer } from '../engine/canvas';
import { chance, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  size: number;
  wigglePhase: number;
  excite: number;
  targetFood: Food | null;
}

interface Food {
  x: number;
  y: number;
  vy: number;
  eaten: boolean;
}

interface TankBubble {
  x: number;
  y: number;
  r: number;
  vy: number;
}

const FISH_EMOJI = ['🐠', '🐟', '🐡', '🦈', '🐙', '🦀'];

/**
 * A calm tank. Tap a fish and it wiggles happily; tap open water and food
 * sprinkles down for the fish to chase. Deliberately the gentlest game here.
 */
export class LittleAquarium implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private fish: Fish[] = [];
  private food: Food[] = [];
  private bubbles: TankBubble[] = [];
  private swayT = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #01579b 0%, #0277bd 55%, #00695c 100%)';
    this.layer = new CanvasLayer(ctx.host);

    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    for (let i = 0; i < 7; i++) {
      this.fish.push({
        x: range(0.1, 0.9) * w,
        y: range(0.15, 0.8) * h,
        vx: range(20, 55) * (chance(0.5) ? 1 : -1),
        vy: 0,
        emoji: FISH_EMOJI[i % FISH_EMOJI.length] ?? '🐠',
        size: range(38, 60),
        wigglePhase: range(0, Math.PI * 2),
        excite: 0,
        targetFood: null,
      });
    }

    ctx.input.onDown((p) => {
      this.ctx.bump();
      const fish = this.fishAt(p.x, p.y);
      if (fish) {
        fish.excite = 1.6;
        fish.vx = (chance(0.5) ? 1 : -1) * range(80, 140);
        this.ctx.audio.pop(0.3);
        this.bubbleStream(fish.x, fish.y);
      } else {
        for (let i = 0; i < 5; i++) {
          this.food.push({
            x: p.x + range(-30, 30),
            y: p.y + range(-20, 0),
            vy: range(28, 55),
            eaten: false,
          });
        }
        this.ctx.audio.pop(0.15);
      }
    });
    // any key sprinkles food from the surface — fish come running
    ctx.input.onKey(() => {
      const w = this.layer.width || 400;
      const x = w * (0.1 + Math.random() * 0.8);
      for (let i = 0; i < 3; i++) {
        this.food.push({
          x: x + range(-25, 25),
          y: range(10, 60),
          vy: range(28, 55),
          eaten: false,
        });
      }
      this.ctx.audio.pop(0.15);
      this.ctx.bump();
    });
  }

  update(dt: number): void {
    const w = this.layer.width;
    const h = this.layer.height;
    this.swayT += dt;

    if (chance(dt * 0.8)) {
      this.bubbles.push({ x: range(0.05, 0.95) * w, y: h + 8, r: range(3, 8), vy: range(30, 60) });
    }
    for (const b of this.bubbles) b.y -= b.vy * dt;
    this.bubbles = this.bubbles.filter((b) => b.y > -10);

    for (const f of this.food) f.y += f.vy * dt;
    this.food = this.food.filter((f) => !f.eaten && f.y < h + 10);
    if (this.food.length > 80) this.food.splice(0, this.food.length - 80);

    for (const fish of this.fish) {
      fish.wigglePhase += dt * (3 + fish.excite * 6);
      fish.excite = Math.max(0, fish.excite - dt);

      if (!fish.targetFood || fish.targetFood.eaten) {
        fish.targetFood = this.nearestFood(fish);
      }
      if (fish.targetFood) {
        const dx = fish.targetFood.x - fish.x;
        const dy = fish.targetFood.y - fish.y;
        const d = Math.hypot(dx, dy);
        if (d < 26) {
          fish.targetFood.eaten = true;
          fish.targetFood = null;
          fish.excite = 1;
          this.ctx.audio.chomp();
          this.ctx.bump();
        } else {
          fish.vx += (dx / d) * 140 * dt;
          fish.vy += (dy / d) * 140 * dt;
        }
      } else {
        fish.vy *= Math.pow(0.6, dt);
        fish.vy += Math.sin(fish.wigglePhase * 0.5) * 6 * dt;
      }

      const maxSpeed = 70 + fish.excite * 120;
      const speed = Math.hypot(fish.vx, fish.vy);
      if (speed > maxSpeed) {
        fish.vx = (fish.vx / speed) * maxSpeed;
        fish.vy = (fish.vy / speed) * maxSpeed;
      }
      fish.x += fish.vx * dt;
      fish.y += fish.vy * dt;

      const m = fish.size;
      if (fish.x < m * 0.5) fish.vx = Math.abs(fish.vx);
      if (fish.x > w - m * 0.5) fish.vx = -Math.abs(fish.vx);
      if (fish.y < m * 0.6) fish.vy = Math.abs(fish.vy);
      if (fish.y > h - m * 0.6) fish.vy = -Math.abs(fish.vy);
    }

    this.draw();
  }

  resize(): void {
    // fish bounce off the new walls naturally
  }

  destroy(): void {
    this.layer.dispose();
    this.fish = [];
    this.food = [];
    this.bubbles = [];
    this.ctx.host.style.background = '';
  }

  private fishAt(x: number, y: number): Fish | null {
    for (const f of this.fish) {
      if (Math.hypot(x - f.x, y - f.y) < f.size * 0.8) return f;
    }
    return null;
  }

  private nearestFood(fish: Fish): Food | null {
    let best: Food | null = null;
    let bestD = Infinity;
    for (const f of this.food) {
      if (f.eaten) continue;
      const d = Math.hypot(f.x - fish.x, f.y - fish.y);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    return bestD < 420 ? best : null;
  }

  private bubbleStream(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      this.bubbles.push({
        x: x + range(-12, 12),
        y: y - range(0, 20),
        r: range(2.5, 6),
        vy: range(50, 90),
      });
    }
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const h = this.layer.height;

    // swaying plants along the bottom
    c.font = '52px serif';
    c.textAlign = 'center';
    for (let i = 0; i < 5; i++) {
      const x = (i + 0.5) * (this.layer.width / 5);
      const sway = Math.sin(this.swayT * 0.8 + i) * 4;
      c.save();
      c.translate(x, h - 8);
      c.rotate(sway * 0.02);
      c.fillText(i % 2 ? '🌿' : '🪸', 0, 0);
      c.restore();
    }

    c.fillStyle = 'rgba(255,255,255,0.5)';
    for (const b of this.bubbles) {
      c.beginPath();
      c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      c.stroke();
    }
    c.strokeStyle = 'rgba(255,255,255,0.45)';

    c.fillStyle = '#ffcc80';
    for (const f of this.food) {
      c.beginPath();
      c.arc(f.x, f.y, 4, 0, Math.PI * 2);
      c.fill();
    }

    for (const fish of this.fish) {
      const wiggle = Math.sin(fish.wigglePhase) * 0.12;
      c.save();
      c.translate(fish.x, fish.y);
      // fish emoji face left by default — flip when swimming right
      c.scale(fish.vx > 0 ? -1 : 1, 1);
      c.rotate(wiggle);
      c.font = `${Math.round(fish.size * (1 + fish.excite * 0.15))}px serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(fish.emoji, 0, 0);
      c.restore();
    }
  }
}
