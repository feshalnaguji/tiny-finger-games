import { CanvasLayer } from '../engine/canvas';
import { chance, pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Dino {
  emoji: string;
  x: number;
  y: number;
  vx: number;
  size: number;
  stompPhase: number;
  rear: number;
  baby: boolean;
}

interface Egg {
  x: number;
  y: number;
  age: number;
  cracked: boolean;
}

const DINOS = ['🦖', '🦕'];
const MAX_DINOS = 9;

/**
 * Dinosaurs stomp across a prehistoric valley. Tap one and it rears up with a
 * mighty (but ear-safe) roar; tap the ground to lay an egg that cracks open
 * into a squeaky baby dino who joins the parade.
 */
export class DinoStomp implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private dinos: Dino[] = [];
  private eggs: Egg[] = [];

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background =
      'linear-gradient(180deg, #ffcc80 0%, #ffe0b2 38%, #aed581 55%, #558b2f 100%)';
    this.layer = new CanvasLayer(ctx.host);

    for (let i = 0; i < 3; i++) this.spawn(false, true);

    ctx.input.onDown((p) => {
      const dino = this.dinoAt(p.x, p.y);
      if (dino) this.roar(dino);
      else if (p.y > (this.layer.height || 600) * 0.5) this.layEgg(p.x, p.y);
      else this.spawn(false);
    });
    ctx.input.onKey((k) => {
      if (k.repeat) return;
      const dino = this.dinos[Math.floor(Math.random() * this.dinos.length)];
      if (dino && chance(0.5)) this.roar(dino);
      else this.spawn(false);
    });
  }

  update(dt: number): void {
    const w = this.layer.width;
    for (const d of this.dinos) {
      d.x += d.vx * dt;
      d.stompPhase += dt * (d.baby ? 9 : 5);
      d.rear = Math.max(0, d.rear - dt * 1.6);
      if (d.x < -100) d.x = w + 90;
      if (d.x > w + 100) d.x = -90;
      // occasional footstep thud for the big ones
      if (!d.baby && Math.sin(d.stompPhase) > 0.996) {
        this.ctx.audio.drum('kick');
      }
    }
    for (const egg of this.eggs) {
      egg.age += dt;
      if (!egg.cracked && egg.age > 1.2) {
        egg.cracked = true;
        this.hatch(egg);
      }
    }
    this.eggs = this.eggs.filter((e) => e.age < 1.7);
    this.draw(w);
  }

  resize(): void {
    // the valley stretches; dinos wrap around
  }

  destroy(): void {
    this.layer.dispose();
    this.dinos = [];
    this.eggs = [];
    this.ctx.host.style.background = '';
  }

  private spawn(baby: boolean, anywhere = false, at?: { x: number; y: number }): void {
    if (this.dinos.length >= MAX_DINOS) this.dinos.shift();
    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    const fromLeft = chance(0.5);
    const size = Math.min(w, h) * (baby ? range(0.05, 0.065) : range(0.11, 0.16));
    this.dinos.push({
      emoji: pick(DINOS),
      x: at ? at.x : anywhere ? range(0.15, 0.85) * w : fromLeft ? -80 : w + 80,
      y: at ? at.y : h * range(0.62, 0.85),
      vx: (fromLeft ? 1 : -1) * range(25, 60) * (baby ? 1.6 : 1),
      size,
      stompPhase: range(0, Math.PI * 2),
      rear: 0,
      baby,
    });
    if (!baby && !anywhere) {
      this.ctx.audio.drum('kick');
      this.ctx.bump();
    }
  }

  private dinoAt(x: number, y: number): Dino | null {
    for (const d of this.dinos) {
      if (Math.abs(x - d.x) < d.size * 0.9 && Math.abs(y - d.y) < d.size * 0.9) return d;
    }
    return null;
  }

  private roar(d: Dino): void {
    d.rear = 1;
    if (d.baby) {
      // squeaky little roar
      this.ctx.audio.note(84, { wave: 'sawtooth', dur: 0.18, vel: 0.25 });
      this.ctx.audio.note(89, { wave: 'sawtooth', dur: 0.14, vel: 0.2, delay: 0.16 });
    } else {
      this.ctx.audio.animal('lion');
      this.ctx.audio.drum('kick');
    }
    this.ctx.bump();
    this.ctx.particles.burst({
      x: d.x,
      y: d.y - d.size * 0.7,
      count: 6,
      emoji: d.baby ? ['💕'] : ['💢', '🍃'],
      speed: [50, 160],
      size: [7, 11],
      ttl: [0.4, 0.8],
      gravity: -40,
    });
  }

  private layEgg(x: number, y: number): void {
    if (this.eggs.length >= 4) return;
    this.eggs.push({ x, y, age: 0, cracked: false });
    this.ctx.audio.pop(0.6);
    this.ctx.bump();
  }

  private hatch(egg: Egg): void {
    this.ctx.audio.pop(0.3);
    this.ctx.audio.giggle();
    this.ctx.particles.burst({
      x: egg.x,
      y: egg.y,
      count: 8,
      colors: ['#fff9c4', '#ffffff', '#ffe082'],
      speed: [40, 160],
      size: [2, 5],
      ttl: [0.3, 0.7],
      gravity: 220,
    });
    this.spawn(true, false, { x: egg.x, y: egg.y });
  }

  private draw(w: number): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const h = this.layer.height;
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // prehistoric scenery
    c.font = `${Math.round(Math.min(w, h) * 0.12)}px serif`;
    c.fillText('🌋', w * 0.82, h * 0.32);
    c.font = `${Math.round(Math.min(w, h) * 0.09)}px serif`;
    c.fillText('🌴', w * 0.12, h * 0.42);
    c.fillText('🌴', w * 0.3, h * 0.38);
    c.fillText('☀️', w * 0.5, h * 0.1);

    for (const egg of this.eggs) {
      const wob = egg.age > 0.6 ? Math.sin(egg.age * 30) * 0.15 : 0;
      c.save();
      c.translate(egg.x, egg.y);
      c.rotate(wob);
      c.font = `${Math.round(Math.min(w, h) * 0.06)}px serif`;
      c.fillText(egg.cracked ? '🐣' : '🥚', 0, 0);
      c.restore();
    }

    for (const d of this.dinos) {
      const stompBob = Math.abs(Math.sin(d.stompPhase)) * d.size * 0.06;
      const rearRot = d.rear > 0 ? -0.35 * d.rear : 0;
      const rearScale = 1 + d.rear * 0.18;
      c.save();
      c.translate(d.x, d.y - stompBob);
      c.scale(d.vx > 0 ? -1 : 1, 1);
      c.rotate(rearRot);
      c.scale(rearScale, rearScale);
      c.font = `${Math.round(d.size)}px serif`;
      c.fillText(d.emoji, 0, 0);
      c.restore();
    }
  }
}
