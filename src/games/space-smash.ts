import { CanvasLayer } from '../engine/canvas';
import { chance, pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Thing {
  kind: 'rocket' | 'planet' | 'alien' | 'letter';
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  text: string;
  hue: number;
  spin: number;
}

const PLANETS = ['🪐', '🌍', '🌕', '☄️'];
const LETTER_COLORS = ['#ffd54f', '#4dd0e1', '#f06292', '#9ccc65', '#ff8a65'];

/**
 * The keyboard-smash homage: every key press or tap spawns a space event —
 * rockets, planets, aliens, giant spoken letters — over a growing starfield.
 */
export class SpaceSmash implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private stars: Star[] = [];
  private things: Thing[] = [];

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #06030f 0%, #17093a 70%, #2a1a5e 100%)';
    this.layer = new CanvasLayer(ctx.host);

    for (let i = 0; i < 40; i++) this.spawnStar(true);

    ctx.input.onDown((p) => {
      this.smash(p.x, p.y, null);
    });
    ctx.input.onKey((k) => {
      const letter = /^[a-zA-Z0-9]$/.test(k.key) ? k.key.toUpperCase() : null;
      this.smash(
        range(0.15, 0.85) * this.layer.width,
        range(0.15, 0.7) * this.layer.height,
        letter,
      );
    });
  }

  update(dt: number): void {
    const { width: w, height: h } = this.layer;
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > h + 2) {
        s.y = -2;
        s.x = range(0, w);
      }
    }
    for (const t of this.things) {
      t.age += dt;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      if (t.kind === 'planet') t.vy *= Math.pow(0.9, dt * 60);
    }
    this.things = this.things.filter(
      (t) => t.age < t.ttl && t.x > -120 && t.x < w + 120 && t.y > -120 && t.y < h + 120,
    );
    this.draw();
  }

  resize(): void {
    // starfield restocks itself as stars wrap
  }

  destroy(): void {
    this.layer.dispose();
    this.stars = [];
    this.things = [];
    this.ctx.host.style.background = '';
  }

  private smash(x: number, y: number, letter: string | null): void {
    this.ctx.bump();
    this.spawnStar(false);
    if (this.things.length > 100) this.things.shift();

    if (letter) {
      this.things.push({
        kind: 'letter',
        x,
        y,
        vx: 0,
        vy: -25,
        age: 0,
        ttl: 1.6,
        text: letter,
        hue: range(0, 360),
        spin: range(-0.4, 0.4),
      });
      this.ctx.audio.randomNote(0.5);
      this.ctx.audio.speak(letter);
      return;
    }

    const roll = Math.random();
    if (roll < 0.3) {
      // rocket streaks across from the tapped point
      const dir = chance(0.5) ? 1 : -1;
      this.things.push({
        kind: 'rocket',
        x,
        y,
        vx: dir * range(260, 420),
        vy: range(-80, -20),
        age: 0,
        ttl: 3,
        text: '🚀',
        hue: 0,
        spin: 0,
      });
      this.ctx.audio.whoosh('up');
    } else if (roll < 0.55) {
      this.things.push({
        kind: 'planet',
        x,
        y,
        vx: 0,
        vy: -140,
        age: 0,
        ttl: 4,
        text: pick(PLANETS),
        hue: 0,
        spin: range(-0.6, 0.6),
      });
      this.ctx.audio.randomNote(0.6);
    } else if (roll < 0.75) {
      this.things.push({
        kind: 'alien',
        x,
        y,
        vx: range(-40, 40),
        vy: range(-60, -20),
        age: 0,
        ttl: 2.2,
        text: '👽',
        hue: 0,
        spin: range(-1, 1),
      });
      this.ctx.audio.pop(0.7);
    } else {
      this.ctx.audio.sparkle();
      this.ctx.particles.burst({
        x,
        y,
        count: 22,
        colors: ['#ffd54f', '#4dd0e1', '#f06292', '#ffffff'],
        speed: [80, 340],
        size: [2, 6],
        ttl: [0.5, 1.1],
        gravity: 60,
      });
    }
  }

  private spawnStar(anywhere: boolean): void {
    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    this.stars.push({
      x: range(0, w),
      y: anywhere ? range(0, h) : -2,
      size: range(0.6, 2.2),
      speed: range(4, 18),
    });
    if (this.stars.length > 220) this.stars.shift();
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;

    c.fillStyle = '#ffffff';
    for (const s of this.stars) {
      c.globalAlpha = Math.min(1, s.size / 2);
      c.beginPath();
      c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (const t of this.things) {
      const fade = Math.min(1, (t.ttl - t.age) / 0.4);
      const grow = Math.min(1, t.age / 0.12);
      c.save();
      c.translate(t.x, t.y);
      c.rotate(t.kind === 'rocket' ? Math.atan2(t.vy, t.vx) + Math.PI / 4 : t.spin * t.age);
      c.globalAlpha = fade;
      if (t.kind === 'letter') {
        c.font = `900 ${Math.round(90 * grow)}px system-ui`;
        c.fillStyle = pickColor(t.hue);
        c.fillText(t.text, 0, 0);
      } else {
        c.font = `${Math.round(64 * grow)}px serif`;
        c.fillText(t.text, 0, 0);
      }
      c.restore();
    }
    c.globalAlpha = 1;
  }
}

function pickColor(hue: number): string {
  return LETTER_COLORS[Math.floor(hue / 72) % LETTER_COLORS.length] ?? '#ffd54f';
}
