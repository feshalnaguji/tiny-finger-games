import { CanvasLayer } from '../engine/canvas';
import { chance, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Duck {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  bob: number;
  /** 0..1 hop-in animation */
  landing: number;
  fromX: number;
  fromY: number;
  wiggle: number;
}

const NUMBER_WORDS = [
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
];

/**
 * Tap anywhere and a duck hops into the pond — "One!", "Two!", "Three!"…
 * At ten the whole pond celebrates and starts fresh. Counting as pure
 * cause-and-effect; a giant numeral appears for number-shape recognition.
 */
export class CountingPond implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private ducks: Duck[] = [];
  private numeral: { value: number; age: number } | null = null;
  private celebrating = 0;
  private windT = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background =
      'linear-gradient(180deg, #a5d6a7 0%, #81c784 34%, #4db6ac 36%, #00897b 100%)';
    this.layer = new CanvasLayer(ctx.host);

    ctx.input.onDown((p) => {
      const duck = this.duckAt(p.x, p.y);
      if (duck) {
        duck.wiggle = 1;
        this.ctx.audio.animal('duck');
        this.ctx.bump();
      } else {
        this.addDuck();
      }
    });
    ctx.input.onKey((k) => {
      if (!k.repeat) this.addDuck();
    });
  }

  update(dt: number): void {
    this.windT += dt;
    if (this.celebrating > 0) {
      this.celebrating -= dt;
      if (this.celebrating <= 0) this.ducks = [];
    }
    if (this.numeral) {
      this.numeral.age += dt;
      if (this.numeral.age > 1.6) this.numeral = null;
    }
    for (const d of this.ducks) {
      if (d.landing < 1) {
        d.landing = Math.min(1, d.landing + dt * 1.8);
        const t = d.landing;
        d.x = d.fromX + (d.targetX - d.fromX) * t;
        // arc: rise then splash down
        d.y = d.fromY + (d.targetY - d.fromY) * t - Math.sin(t * Math.PI) * 120;
        if (d.landing >= 1) this.splash(d.x, d.y);
      } else {
        d.bob += dt * 2;
        d.x += Math.sin(d.bob * 0.6) * 8 * dt;
        d.wiggle = Math.max(0, d.wiggle - dt * 2);
      }
    }
    this.draw();
  }

  resize(): void {
    // pond stretches with the screen
  }

  destroy(): void {
    this.layer.dispose();
    this.ducks = [];
    this.ctx.host.style.background = '';
  }

  private addDuck(): void {
    if (this.celebrating > 0 || this.ducks.length >= 10) return;
    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    const n = this.ducks.length + 1;
    const fromLeft = chance(0.5);
    this.ducks.push({
      fromX: fromLeft ? -50 : w + 50,
      fromY: h * 0.3,
      x: fromLeft ? -50 : w + 50,
      y: h * 0.3,
      targetX: w * (0.12 + (0.76 * ((n - 1) % 5)) / 4 + range(-0.03, 0.03)),
      targetY: h * (n <= 5 ? 0.55 : 0.75) + range(-12, 12),
      bob: range(0, Math.PI * 2),
      landing: 0,
      wiggle: 0,
    });
    this.numeral = { value: n, age: 0 };
    this.ctx.audio.note(60 + n, { wave: 'triangle', vel: 0.4, dur: 0.3 });
    this.ctx.audio.animal('duck');
    this.ctx.audio.speak(NUMBER_WORDS[n - 1] ?? String(n));
    this.ctx.bump();

    if (n === 10) {
      this.celebrating = 2.2;
      window.setTimeout(() => {
        this.ctx.audio.sparkle();
        this.ctx.audio.chime();
        this.ctx.audio.speak('Ten ducks! Hooray!');
        this.ctx.particles.burst({
          x: (this.layer.width || 800) / 2,
          y: (this.layer.height || 600) / 2,
          count: this.ctx.settings().calm ? 30 : 60,
          colors: ['#ffd54f', '#4db6ac', '#fff9c4', '#ffffff'],
          speed: [100, 360],
          size: [3, 8],
          ttl: [0.6, 1.4],
          gravity: 240,
        });
      }, 900);
    }
  }

  private duckAt(x: number, y: number): Duck | null {
    for (const d of this.ducks) {
      if (d.landing >= 1 && Math.hypot(x - d.x, y - d.y) < 55) return d;
    }
    return null;
  }

  private splash(x: number, y: number): void {
    this.ctx.audio.pop(0.5);
    this.ctx.particles.burst({
      x,
      y: y + 10,
      count: 10,
      colors: ['#b2ebf2', '#e0f7fa', '#ffffff'],
      speed: [60, 220],
      size: [2, 5],
      ttl: [0.3, 0.7],
      gravity: 300,
      angle: [Math.PI, Math.PI * 2],
    });
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const w = this.layer.width;
    const h = this.layer.height;

    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // reeds on the bank
    c.font = `${Math.round(Math.min(w, h) * 0.07)}px serif`;
    for (let i = 0; i < 4; i++) {
      const x = (i + 0.5) * (w / 4);
      c.save();
      c.translate(x, h * 0.33);
      c.rotate(Math.sin(this.windT + i) * 0.05);
      c.fillText('🌾', 0, 0);
      c.restore();
    }

    // gentle ripple lines on the pond
    c.strokeStyle = 'rgba(255,255,255,0.18)';
    c.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const y = h * (0.5 + i * 0.15);
      c.beginPath();
      for (let x = 0; x <= w; x += 24) {
        const yy = y + Math.sin(x / 60 + this.windT * 1.2 + i) * 4;
        if (x === 0) c.moveTo(x, yy);
        else c.lineTo(x, yy);
      }
      c.stroke();
    }

    for (const d of this.ducks) {
      const bobY = d.landing >= 1 ? Math.sin(d.bob) * 5 : 0;
      const rot = d.wiggle > 0 ? Math.sin(d.wiggle * 20) * 0.25 * d.wiggle : Math.sin(d.bob) * 0.06;
      c.save();
      c.translate(d.x, d.y + bobY);
      c.rotate(rot);
      c.font = `${Math.round(Math.min(w, h) * 0.09)}px serif`;
      c.fillText('🦆', 0, 0);
      c.restore();
    }

    if (this.numeral) {
      const t = this.numeral.age;
      const grow = Math.min(1, t * 4);
      const fade = t > 1.1 ? Math.max(0, 1 - (t - 1.1) * 2) : 1;
      c.globalAlpha = fade;
      c.font = `900 ${Math.round(Math.min(w, h) * 0.28 * grow)}px system-ui`;
      c.fillStyle = '#fff9c4';
      c.strokeStyle = 'rgba(0, 77, 64, 0.55)';
      c.lineWidth = 8;
      c.strokeText(String(this.numeral.value), w / 2, h * 0.3);
      c.fillText(String(this.numeral.value), w / 2, h * 0.3);
      c.globalAlpha = 1;
    }
  }
}
