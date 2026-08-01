import { CanvasLayer } from '../engine/canvas';
import { pick, range } from '../engine/rng';
import type { Game, GameContext } from './types';

interface Fruit {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  emoji: string;
  phase: number;
  /** 0 = drifting at home, >0 = flying to the mouth (progress 0..1) */
  flying: number;
  fromX: number;
  fromY: number;
}

const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🥕', '🍪'];

/**
 * A big friendly monster whose eyes follow your finger. Tap fruit and it flies
 * into the open mouth — chomp, bulging cheeks, and the occasional tiny burp.
 * The monster is never full and never unhappy.
 */
export class FeedTheMonster implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private fruits: Fruit[] = [];
  private gaze = { x: 0, y: 0 };
  private mouthOpen = 0;
  private cheeks = 0;
  private eaten = 0;
  private burpT = 0;
  private bounce = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(160deg, #4a148c 0%, #6a1b9a 55%, #8e24aa 100%)';
    this.layer = new CanvasLayer(ctx.host);
    this.gaze = { x: (this.layer.width || 800) / 2, y: (this.layer.height || 600) / 2 };
    this.restock();

    ctx.input.onMove((p) => {
      this.gaze = { x: p.x, y: p.y };
    });
    ctx.input.onDown((p) => {
      this.gaze = { x: p.x, y: p.y };
      const fruit = this.fruitAt(p.x, p.y);
      if (fruit?.flying === 0) this.feed(fruit);
    });
    // any key flings a random fruit into the mouth
    ctx.input.onKey(() => {
      const resting = this.fruits.filter((f) => f.flying === 0);
      const fruit = resting[Math.floor(Math.random() * resting.length)];
      if (fruit) this.feed(fruit);
    });
  }

  private feed(fruit: Fruit): void {
    fruit.flying = 0.0001;
    fruit.fromX = fruit.x;
    fruit.fromY = fruit.y;
    this.ctx.audio.pop(0.35);
    this.ctx.bump();
  }

  update(dt: number): void {
    const w = this.layer.width;
    const h = this.layer.height;
    const mouth = this.mouthPos(w, h);

    this.mouthOpen = Math.max(0.15, this.mouthOpen - dt * 2);
    this.cheeks = Math.max(0, this.cheeks - dt * 0.7);
    this.bounce += dt;
    if (this.burpT > 0) this.burpT -= dt;

    for (const f of this.fruits) {
      if (f.flying > 0) {
        f.flying = Math.min(1, f.flying + dt * 2.4);
        const t = easeIn(f.flying);
        f.x = f.fromX + (mouth.x - f.fromX) * t;
        f.y = f.fromY + (mouth.y - f.fromY) * t;
        const d = Math.hypot(mouth.x - f.x, mouth.y - f.y);
        if (d < 160) this.mouthOpen = Math.min(1, this.mouthOpen + dt * 8);
        if (f.flying >= 1) this.swallow(f);
      } else {
        f.phase += dt;
        f.x = f.homeX + Math.sin(f.phase * 0.9) * 14;
        f.y = f.homeY + Math.cos(f.phase * 0.7) * 10;
      }
    }

    this.draw(w, h, mouth);
  }

  resize(): void {
    this.restock();
  }

  destroy(): void {
    this.layer.dispose();
    this.fruits = [];
    this.ctx.host.style.background = '';
  }

  private restock(): void {
    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    this.fruits = [];
    // ring of fruit around the edges, clear of the monster in the middle
    const spots: [number, number][] = [
      [0.12, 0.18],
      [0.5, 0.09],
      [0.88, 0.18],
      [0.08, 0.55],
      [0.92, 0.55],
      [0.15, 0.88],
      [0.5, 0.93],
      [0.85, 0.88],
    ];
    for (const [fx, fy] of spots) {
      this.fruits.push({
        x: fx * w,
        y: fy * h,
        homeX: fx * w,
        homeY: fy * h,
        emoji: pick(FRUITS),
        phase: range(0, Math.PI * 2),
        flying: 0,
        fromX: 0,
        fromY: 0,
      });
    }
  }

  private fruitAt(x: number, y: number): Fruit | null {
    for (const f of this.fruits) {
      if (Math.hypot(x - f.x, y - f.y) < 55) return f;
    }
    return null;
  }

  private mouthPos(w: number, h: number): { x: number; y: number } {
    return { x: w / 2, y: h / 2 + Math.min(w, h) * 0.1 };
  }

  private swallow(f: Fruit): void {
    this.ctx.audio.chomp();
    this.cheeks = 1;
    this.eaten++;
    this.ctx.particles.burst({
      x: f.x,
      y: f.y,
      count: 6,
      colors: ['#ffe082', '#ffffff'],
      speed: [40, 140],
      size: [2, 5],
      ttl: [0.3, 0.6],
      gravity: 200,
    });
    f.emoji = pick(FRUITS);
    f.flying = 0;
    f.x = f.homeX;
    f.y = f.homeY;
    f.phase = range(0, Math.PI * 2);
    if (this.eaten % 5 === 0) {
      this.burpT = 0.9;
      this.ctx.audio.pop(0.9);
      window.setTimeout(() => {
        this.ctx.audio.giggle();
      }, 350);
    }
  }

  private draw(w: number, h: number, mouth: { x: number; y: number }): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const s = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const bodyR = s * 0.24;
    const bob = Math.sin(this.bounce * 1.6) * s * 0.008;
    const burpLift = this.burpT > 0 ? Math.sin(this.burpT * 10) * s * 0.01 : 0;

    // body
    const grad = c.createRadialGradient(
      cx - bodyR * 0.3,
      cy - bodyR * 0.4 + bob,
      bodyR * 0.2,
      cx,
      cy + bob,
      bodyR * 1.15,
    );
    grad.addColorStop(0, '#8bc34a');
    grad.addColorStop(1, '#33691e');
    c.fillStyle = grad;
    c.beginPath();
    c.ellipse(
      cx,
      cy + bob + burpLift,
      bodyR * (1 + this.cheeks * 0.06),
      bodyR * (1.08 + this.cheeks * 0.1),
      0,
      0,
      Math.PI * 2,
    );
    c.fill();

    // cheeks
    if (this.cheeks > 0) {
      c.fillStyle = `rgba(255, 138, 101, ${0.5 * this.cheeks})`;
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(
          cx + side * bodyR * 0.72,
          cy + bob + bodyR * 0.15,
          bodyR * 0.22 * (1 + this.cheeks * 0.5),
          bodyR * 0.18,
          0,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    }

    // eyes track the pointer
    const eyeY = cy + bob - bodyR * 0.45;
    for (const side of [-1, 1]) {
      const ex = cx + side * bodyR * 0.42;
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.ellipse(ex, eyeY, bodyR * 0.2, bodyR * 0.24, 0, 0, Math.PI * 2);
      c.fill();
      const dx = this.gaze.x - ex;
      const dy = this.gaze.y - eyeY;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const happy = this.cheeks > 0.4;
      c.fillStyle = '#263238';
      c.beginPath();
      if (happy) {
        c.ellipse(ex, eyeY + bodyR * 0.02, bodyR * 0.1, bodyR * 0.04, 0, 0, Math.PI * 2);
      } else {
        c.arc(
          ex + (dx / d) * bodyR * 0.07,
          eyeY + (dy / d) * bodyR * 0.09,
          bodyR * 0.09,
          0,
          Math.PI * 2,
        );
      }
      c.fill();
    }

    // mouth — opens as food approaches
    const open = this.mouthOpen;
    c.fillStyle = '#4e2600';
    c.beginPath();
    c.ellipse(
      mouth.x,
      mouth.y + bob,
      bodyR * 0.42,
      bodyR * (0.06 + open * 0.34),
      0,
      0,
      Math.PI * 2,
    );
    c.fill();
    if (open > 0.4) {
      c.fillStyle = '#ff8a80';
      c.beginPath();
      c.ellipse(
        mouth.x,
        mouth.y + bob + bodyR * (0.06 + open * 0.2),
        bodyR * 0.22,
        bodyR * 0.1 * open,
        0,
        0,
        Math.PI * 2,
      );
      c.fill();
    }

    // little horns
    c.font = `${Math.round(bodyR * 0.35)}px serif`;
    c.textAlign = 'center';
    c.fillText('🤍', cx - bodyR * 0.55, cy + bob - bodyR * 1.05);
    c.fillText('🤍', cx + bodyR * 0.55, cy + bob - bodyR * 1.05);

    if (this.burpT > 0.5) {
      c.font = `${Math.round(s * 0.06)}px serif`;
      c.fillText('💨', cx + bodyR * 0.9, cy + bob - bodyR * 0.7);
    }

    // fruit on top
    c.textBaseline = 'middle';
    for (const f of this.fruits) {
      const scale = f.flying > 0 ? 1 - easeIn(f.flying) * 0.5 : 1;
      c.font = `${Math.round(s * 0.085 * scale)}px serif`;
      c.fillText(f.emoji, f.x, f.y);
    }
  }
}

function easeIn(t: number): number {
  return t * t;
}
