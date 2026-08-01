import { CanvasLayer } from '../engine/canvas';
import { chance, pick, range } from '../engine/rng';
import { PENTATONIC } from '../engine/audio';
import type { Game, GameContext } from './types';

interface NightStar {
  x: number;
  y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  glow: number;
}

/**
 * The wind-down screen: a nearly still night sky. Stars twinkle very slowly;
 * touching one makes it glow and ring a single soft, long chime. Every little
 * while the sky hums a note by itself. Designed to lower the temperature of
 * the evening, not raise it.
 */
export class SleepyStars implements Game {
  private ctx!: GameContext;
  private layer!: CanvasLayer;
  private stars: NightStar[] = [];
  private ambientT = 0;
  private moonT = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'linear-gradient(180deg, #05040f 0%, #0b0a24 55%, #141138 100%)';
    this.layer = new CanvasLayer(ctx.host);

    const w = this.layer.width || 800;
    const h = this.layer.height || 600;
    for (let i = 0; i < 26; i++) {
      this.stars.push({
        x: range(0.04, 0.96) * w,
        y: range(0.05, 0.85) * h,
        size: range(8, 20),
        twinklePhase: range(0, Math.PI * 2),
        twinkleSpeed: range(0.3, 0.8),
        glow: 0,
      });
    }

    ctx.input.onDown((p) => {
      const star = this.starAt(p.x, p.y);
      if (star) this.ring(star);
    });
    ctx.input.onKey((k) => {
      if (k.repeat) return;
      const star = pick(this.stars);
      this.ring(star);
    });
  }

  update(dt: number): void {
    this.moonT += dt;
    this.ambientT += dt;
    for (const s of this.stars) {
      s.twinklePhase += s.twinkleSpeed * dt;
      s.glow = Math.max(0, s.glow - dt * 0.45);
    }
    // the sky hums to itself now and then — one soft low note
    if (this.ambientT > 12 && chance(dt / 4)) {
      this.ambientT = 0;
      const midi = (PENTATONIC[Math.floor(range(0, 5))] ?? 60) - 12;
      this.ctx.audio.note(midi, { wave: 'sine', dur: 3, vel: 0.12, attack: 0.6 });
    }
    this.draw();
  }

  resize(): void {
    // the sky simply extends
  }

  destroy(): void {
    this.layer.dispose();
    this.stars = [];
    this.ctx.host.style.background = '';
  }

  private starAt(x: number, y: number): NightStar | null {
    for (const s of this.stars) {
      if (Math.hypot(x - s.x, y - s.y) < s.size + 34) return s;
    }
    return null;
  }

  private ring(star: NightStar): void {
    star.glow = 1;
    // one long, soft bell — low pentatonic, slow attack, long tail
    const midi = pick(PENTATONIC);
    this.ctx.audio.note(midi, { wave: 'sine', dur: 2.5, vel: 0.22, attack: 0.15 });
    this.ctx.audio.note(midi + 12, { wave: 'sine', dur: 2, vel: 0.08, attack: 0.3, delay: 0.1 });
    this.ctx.bump();
  }

  private draw(): void {
    this.layer.clear();
    const c = this.layer.ctx;
    const w = this.layer.width;
    const h = this.layer.height;

    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // the moon inches across the whole sky over ~10 minutes
    const moonX = w * 0.12 + ((this.moonT / 600) % 1) * w * 0.76;
    c.font = `${Math.round(Math.min(w, h) * 0.1)}px serif`;
    c.globalAlpha = 0.95;
    c.fillText('🌙', moonX, h * 0.14);

    // sleeping hills silhouette
    c.globalAlpha = 1;
    c.fillStyle = '#0a0820';
    c.beginPath();
    c.moveTo(0, h);
    c.quadraticCurveTo(w * 0.25, h * 0.88, w * 0.5, h * 0.94);
    c.quadraticCurveTo(w * 0.75, h * 0.99, w, h * 0.9);
    c.lineTo(w, h);
    c.closePath();
    c.fill();

    for (const s of this.stars) {
      const breathe = 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      const glowBoost = 1 + s.glow * 0.8;
      if (s.glow > 0) {
        const halo = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.2 * s.glow);
        halo.addColorStop(0, `rgba(255, 244, 180, ${0.35 * s.glow})`);
        halo.addColorStop(1, 'rgba(255, 244, 180, 0)');
        c.fillStyle = halo;
        c.beginPath();
        c.arc(s.x, s.y, s.size * 3.2, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = breathe;
      c.font = `${Math.round(s.size * 2 * glowBoost)}px serif`;
      c.fillText('⭐', s.x, s.y);
    }
    c.globalAlpha = 1;
  }
}
