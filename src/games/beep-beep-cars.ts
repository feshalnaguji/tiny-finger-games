import { CanvasLayer } from '../engine/canvas';
import { chance, pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Vehicle {
  emoji: string;
  x: number;
  y: number;
  vx: number;
  size: number;
  bounce: number;
  lane: number;
}

const VEHICLES = ['🚗', '🚕', '🚙', '🚌', '🚒', '🚜', '🚓', '🚑'];
const LANES = 3;
const MAX_VEHICLES = 12;

/**
 * A sunny road. Tap anywhere (or smash any key) and a vehicle drives across
 * with a happy honk; tap a moving vehicle and it honks back and bounces.
 */
export class BeepBeepCars implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private vehicles: Vehicle[] = [];
  private sunPhase = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background =
      'linear-gradient(180deg, #81d4fa 0%, #b3e5fc 45%, #aed581 46%, #7cb342 100%)';
    this.layer = new CanvasLayer(ctx.host);

    ctx.input.onDown((p) => {
      const v = this.vehicleAt(p.x, p.y);
      if (v) this.honk(v);
      else this.spawn();
    });
    ctx.input.onKey(() => {
      this.spawn();
    });

    for (let i = 0; i < 3; i++) this.spawn(true);
  }

  update(dt: number): void {
    const w = this.layer.width;
    this.sunPhase += dt;
    for (const v of this.vehicles) {
      v.x += v.vx * dt;
      v.bounce = Math.max(0, v.bounce - dt * 3);
    }
    this.vehicles = this.vehicles.filter((v) => v.x > -140 && v.x < w + 140);
    this.draw();
  }

  resize(): void {
    // lanes are computed from the live height every frame
  }

  destroy(): void {
    this.layer.dispose();
    this.vehicles = [];
    this.ctx.host.style.background = '';
  }

  private laneY(lane: number): number {
    const h = this.layer.height || 600;
    const roadTop = h * 0.48;
    return roadTop + ((lane + 0.5) * (h - roadTop - h * 0.06)) / LANES;
  }

  private spawn(anywhere = false): void {
    if (this.vehicles.length >= MAX_VEHICLES) this.vehicles.shift();
    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    const fromLeft = chance(0.5);
    const lane = Math.floor(range(0, LANES));
    const size = Math.min(w, h) * range(0.09, 0.13);
    this.vehicles.push({
      emoji: pick(VEHICLES),
      x: anywhere ? range(0.1, 0.9) * w : fromLeft ? -80 : w + 80,
      y: this.laneY(lane),
      vx: (fromLeft ? 1 : -1) * range(90, 220),
      size,
      bounce: 0,
      lane,
    });
    // little engine putt-putt-putt: three soft triangle chugs, not a buzz
    for (let i = 0; i < 3; i++) {
      this.ctx.audio.note(43 + lane * 2, {
        wave: 'triangle',
        dur: 0.08,
        vel: 0.28 - i * 0.05,
        delay: i * 0.11,
      });
    }
    this.ctx.bump();
  }

  private honk(v: Vehicle): void {
    v.bounce = 1;
    // classic two-tone honk
    this.ctx.audio.note(69, { wave: 'square', dur: 0.14, vel: 0.4 });
    this.ctx.audio.note(64, { wave: 'square', dur: 0.2, vel: 0.4, delay: 0.15 });
    this.ctx.bump();
    this.ctx.particles.burst({
      x: v.x,
      y: v.y - v.size * 0.5,
      count: 6,
      emoji: ['🎵', '💨'],
      speed: [40, 140],
      size: [7, 11],
      ttl: [0.4, 0.8],
      gravity: -60,
    });
  }

  private vehicleAt(x: number, y: number): Vehicle | null {
    for (const v of this.vehicles) {
      if (Math.abs(x - v.x) < v.size * 0.9 && Math.abs(y - v.y) < v.size * 0.7) return v;
    }
    return null;
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const w = this.layer.width;
    const h = this.layer.height;
    const roadTop = h * 0.48;

    // sun with slow rays
    c.save();
    c.translate(w * 0.85, h * 0.12);
    c.rotate(this.sunPhase * 0.15);
    c.font = `${Math.round(Math.min(w, h) * 0.09)}px serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('☀️', 0, 0);
    c.restore();

    // a couple of drifting clouds
    c.font = `${Math.round(Math.min(w, h) * 0.07)}px serif`;
    const cloudX = ((this.sunPhase * 12) % (w + 200)) - 100;
    c.fillText('☁️', cloudX, h * 0.14);
    c.fillText('☁️', (cloudX + w * 0.5) % (w + 200), h * 0.22);

    // road surface + dashed lane lines
    c.fillStyle = '#546e7a';
    c.fillRect(0, roadTop, w, h - roadTop - h * 0.04);
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 4;
    c.setLineDash([26, 22]);
    for (let l = 1; l < LANES; l++) {
      const y = roadTop + (l * (h - roadTop - h * 0.06)) / LANES;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.setLineDash([]);

    // vehicles (emoji face left→ flip when driving right)
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (const v of this.vehicles) {
      const squash = 1 + Math.sin(v.bounce * 12) * 0.15 * v.bounce;
      c.save();
      c.translate(v.x, v.y - Math.abs(Math.sin(v.bounce * 12)) * 14 * v.bounce);
      c.scale(v.vx > 0 ? -1 : 1, squash);
      c.font = `${Math.round(v.size)}px serif`;
      c.fillText(v.emoji, 0, 0);
      c.restore();
    }
  }
}
