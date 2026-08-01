import { MAJOR_SCALE } from '../engine/audio';
import type { Game, GameContext } from './types';

const BAR_COLORS = [
  '#ef5350',
  '#ff9800',
  '#ffd54f',
  '#9ccc65',
  '#4dd0e1',
  '#5c9ce6',
  '#9575cd',
  '#f06292',
];
const BAR_FRIENDS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', 'Do'];

/**
 * Eight full-height rainbow bars, one octave of C major. Tap plays a note,
 * dragging across plays a glissando, any keyboard key lands on the scale.
 * There are no wrong notes.
 */
export class RainbowPiano implements Game {
  private ctx!: GameContext;
  private bars: HTMLElement[] = [];
  private lastBar = new Map<number, number>();
  private width = 0;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    this.width = ctx.width;
    ctx.host.style.background = '#1a1145';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;position:absolute;inset:0;';
    for (let i = 0; i < 8; i++) {
      const bar = document.createElement('div');
      bar.style.cssText = `
        flex:1; display:flex; align-items:flex-end; justify-content:center;
        padding-bottom:6vmin; font-size:clamp(2rem,8vmin,4rem);
        background:linear-gradient(180deg, color-mix(in srgb, ${BAR_COLORS[i]} 80%, #fff) 0%, ${BAR_COLORS[i]} 100%);
        border-radius:2vmin 2vmin 0 0; margin:0 0.4vmin 0 0;
        transform-origin:bottom; transition:filter 0.15s ease, transform 0.12s ease;
      `;
      const friend = document.createElement('span');
      friend.textContent = BAR_FRIENDS[i] ?? '🐾';
      friend.style.transition = 'transform 0.15s ease';
      bar.appendChild(friend);
      row.appendChild(bar);
      this.bars.push(bar);
    }
    ctx.host.appendChild(row);

    ctx.input.onDown((p) => {
      const i = this.barAt(p.x);
      this.lastBar.set(p.id, i);
      this.play(i, true);
    });
    ctx.input.onMove((p) => {
      const prev = this.lastBar.get(p.id);
      if (prev === undefined) return;
      const i = this.barAt(p.x);
      if (i !== prev) {
        this.lastBar.set(p.id, i);
        this.play(i, false);
      }
    });
    ctx.input.onUp((p) => this.lastBar.delete(p.id));
    ctx.input.onKey((k) => {
      if (k.repeat) return;
      let hash = 0;
      for (const c of k.code) hash = (hash * 31 + c.charCodeAt(0)) % 997;
      this.play(hash % 8, false);
    });
  }

  resize(width: number): void {
    this.width = width;
  }

  destroy(): void {
    this.bars = [];
    this.lastBar.clear();
    this.ctx.host.style.background = '';
  }

  private barAt(x: number): number {
    return Math.max(0, Math.min(7, Math.floor((x / Math.max(this.width, 1)) * 8)));
  }

  private play(i: number, spoken: boolean): void {
    const midi = MAJOR_SCALE[i] ?? 60;
    this.ctx.audio.note(midi, { vel: 0.55 });
    this.ctx.bump();

    const bar = this.bars[i];
    if (bar) {
      bar.style.filter = 'brightness(1.5)';
      bar.style.transform = 'scaleY(0.96)';
      const friend = bar.firstElementChild as HTMLElement | null;
      if (friend) friend.style.transform = 'translateY(-3vmin) scale(1.25)';
      setTimeout(() => {
        bar.style.filter = '';
        bar.style.transform = '';
        if (friend) friend.style.transform = '';
      }, 180);
      const rect = bar.getBoundingClientRect();
      this.ctx.particles.burst({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.7,
        count: 5,
        colors: [BAR_COLORS[i] ?? '#fff', '#ffffff'],
        speed: [40, 160],
        size: [3, 6],
        ttl: [0.3, 0.6],
        gravity: 150,
      });
    }
    if (spoken && this.ctx.settings().speech) this.ctx.audio.speak(SOLFEGE[i] ?? '');
  }
}
