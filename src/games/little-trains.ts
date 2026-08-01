import { CanvasLayer } from '../engine/canvas';
import { range } from '../engine/rng';
import type { Game, GameContext } from './types';

const MAX_WAGONS = 8;
const SPACING = 78;

/**
 * An engine chugs around the loop; every tap couples on another wagon with a
 * clack. Fill the train to eight and it departs in a shower of confetti — then
 * a fresh engine rolls in. Tap the engine itself for a toot-toot.
 */
export class LittleTrains implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private engineX = 0;
  private wagons = 0;
  private chugT = 0;
  private smoke: { x: number; y: number; age: number }[] = [];
  private departing = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background =
      'linear-gradient(180deg, #b3e5fc 0%, #e1f5fe 45%, #aed581 60%, #7cb342 100%)';
    this.layer = new CanvasLayer(ctx.host);
    this.engineX = (this.layer.width || 800) * 0.3;

    ctx.input.onDown((p) => {
      const y = this.trackY();
      const onEngine =
        Math.abs(p.x - this.engineX) < 55 && Math.abs(p.y - y) < 70 && this.departing <= 0;
      if (onEngine) this.toot();
      else this.couple();
    });
    ctx.input.onKey((k) => {
      if (!k.repeat) this.couple();
    });
  }

  update(dt: number): void {
    const w = this.layer.width;
    const speed = this.departing > 0 ? 420 : 70 + this.wagons * 6;
    this.engineX += speed * dt;
    const trainLen = (this.wagons + 1) * SPACING;
    if (this.engineX - trainLen > w + 60) {
      if (this.departing > 0) {
        // the full train has left — a new engine rolls in
        this.departing = 0;
        this.wagons = 0;
      }
      this.engineX = -20;
    }

    this.chugT += dt;
    const chugEvery = this.departing > 0 ? 0.16 : 0.38;
    if (this.chugT >= chugEvery) {
      this.chugT = 0;
      this.ctx.audio.drum('shaker');
      this.smoke.push({ x: this.engineX + 10, y: this.trackY() - 55, age: 0 });
    }
    for (const s of this.smoke) {
      s.age += dt;
      s.y -= 30 * dt;
      s.x -= 12 * dt;
    }
    this.smoke = this.smoke.filter((s) => s.age < 1.4);

    this.draw(w);
  }

  resize(): void {
    // the loop just gets longer
  }

  destroy(): void {
    this.layer.dispose();
    this.smoke = [];
    this.ctx.host.style.background = '';
  }

  private trackY(): number {
    return (this.layer.height || 600) * 0.68;
  }

  private toot(): void {
    this.ctx.audio.note(79, { wave: 'sine', dur: 0.22, vel: 0.4 });
    this.ctx.audio.note(79, { wave: 'sine', dur: 0.34, vel: 0.4, delay: 0.28 });
    this.ctx.bump();
    for (let i = 0; i < 3; i++) {
      this.smoke.push({
        x: this.engineX + 10 + range(-6, 6),
        y: this.trackY() - 55 - i * 12,
        age: i * 0.1,
      });
    }
  }

  private couple(): void {
    if (this.departing > 0 || this.wagons >= MAX_WAGONS) return;
    this.wagons++;
    // coupling clack + a rising note per wagon
    this.ctx.audio.drum('wood');
    this.ctx.audio.note(55 + this.wagons * 2, { wave: 'triangle', dur: 0.25, vel: 0.35 });
    this.ctx.bump();
    this.ctx.particles.burst({
      x: this.engineX - this.wagons * SPACING,
      y: this.trackY(),
      count: 5,
      colors: ['#ffcc80', '#ffffff'],
      speed: [40, 140],
      size: [2, 5],
      ttl: [0.3, 0.6],
      gravity: 240,
    });

    if (this.wagons === MAX_WAGONS) {
      this.ctx.audio.chime();
      this.ctx.audio.sparkle();
      this.toot();
      this.departing = 1;
      this.ctx.particles.burst({
        x: this.engineX,
        y: this.trackY() - 40,
        count: this.ctx.settings().calm ? 25 : 45,
        colors: ['#ff7043', '#ffd54f', '#4dd0e1', '#ffffff'],
        speed: [80, 300],
        size: [3, 7],
        ttl: [0.6, 1.2],
        gravity: 220,
      });
    }
  }

  private draw(w: number): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const y = this.trackY();
    const h = this.layer.height;
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // scenery
    c.font = `${Math.round(Math.min(w, h) * 0.08)}px serif`;
    c.fillText('☀️', w * 0.88, h * 0.1);
    c.fillText('🌳', w * 0.15, y - 60);
    c.fillText('🌳', w * 0.72, y - 64);
    c.fillText('🏡', w * 0.45, y - 62);

    // track: two rails + sleepers
    c.strokeStyle = '#6d4c41';
    c.lineWidth = 4;
    for (const off of [16, 30]) {
      c.beginPath();
      c.moveTo(0, y + off);
      c.lineTo(w, y + off);
      c.stroke();
    }
    c.lineWidth = 6;
    for (let x = 10; x < w; x += 34) {
      c.beginPath();
      c.moveTo(x, y + 10);
      c.lineTo(x, y + 36);
      c.stroke();
    }

    // steam
    for (const s of this.smoke) {
      c.globalAlpha = Math.max(0, 1 - s.age / 1.4) * 0.8;
      c.font = `${Math.round(18 + s.age * 22)}px serif`;
      c.fillText('💨', s.x, s.y);
    }
    c.globalAlpha = 1;

    // the train: engine + wagons trailing behind (emoji face left → flip to face right)
    const size = Math.round(Math.min(w, h) * 0.1);
    c.font = `${size}px serif`;
    const bounce = this.departing > 0 ? Math.sin(this.engineX * 0.15) * 3 : 0;
    for (let i = this.wagons; i >= 1; i--) {
      c.save();
      c.translate(this.engineX - i * SPACING, y - size * 0.34 + bounce);
      c.scale(-1, 1);
      c.fillText('🚃', 0, 0);
      c.restore();
    }
    c.save();
    c.translate(this.engineX, y - size * 0.34 + bounce);
    c.scale(-1, 1);
    c.fillText('🚂', 0, 0);
    c.restore();
  }
}
