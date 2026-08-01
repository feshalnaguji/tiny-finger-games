import type { DrumKind } from '../engine/audio';
import type { Game, GameContext } from './types';

interface PadSpec {
  kind: DrumKind;
  emoji: string;
  color: string;
  /** center position as fraction of viewport */
  cx: number;
  cy: number;
  /** diameter as fraction of min(vw, vh) */
  size: number;
}

const PADS: PadSpec[] = [
  { kind: 'kick', emoji: '🥁', color: '#ef5350', cx: 0.5, cy: 0.72, size: 0.42 },
  { kind: 'snare', emoji: '🪘', color: '#ffb74d', cx: 0.18, cy: 0.45, size: 0.3 },
  { kind: 'wood', emoji: '🪵', color: '#a1887f', cx: 0.82, cy: 0.45, size: 0.3 },
  { kind: 'hat', emoji: '🛎️', color: '#4dd0e1', cx: 0.3, cy: 0.16, size: 0.24 },
  { kind: 'shaker', emoji: '🪇', color: '#ba68c8', cx: 0.7, cy: 0.16, size: 0.24 },
];

/** Five giant indestructible drum pads. Fully polyphonic — two hands, two kids. */
export class DrumTime implements Game {
  private ctx!: GameContext;

  init(ctx: GameContext): void {
    this.ctx = ctx;
    ctx.host.style.background = 'radial-gradient(circle at 50% 30%, #37474f, #102027 75%)';

    for (const spec of PADS) {
      const pad = document.createElement('button');
      pad.setAttribute('aria-label', `${spec.kind} drum`);
      pad.textContent = spec.emoji;
      pad.style.cssText = `
        position:absolute; left:${spec.cx * 100}%; top:${spec.cy * 100}%;
        width:${spec.size * 100}vmin; height:${spec.size * 100}vmin;
        transform:translate(-50%,-50%);
        border-radius:50%; font-size:${spec.size * 45}vmin;
        background:radial-gradient(circle at 35% 30%, color-mix(in srgb, ${spec.color} 60%, #fff), ${spec.color});
        box-shadow:0 8px 24px rgb(0 0 0 / 0.45), inset 0 -6px 18px rgb(0 0 0 / 0.3);
        display:flex; align-items:center; justify-content:center;
        transition:transform 0.09s ease;
      `;
      pad.addEventListener('pointerdown', (e) => {
        this.hit(spec, pad, e.clientX, e.clientY);
      });
      ctx.host.appendChild(pad);
    }

    ctx.input.onKey((k) => {
      if (k.repeat) return;
      let hash = 0;
      for (const c of k.code) hash = (hash * 31 + c.charCodeAt(0)) % 997;
      const spec = PADS[hash % PADS.length];
      const pad = this.ctx.host.children[hash % PADS.length] as HTMLElement | undefined;
      if (spec && pad) {
        const r = pad.getBoundingClientRect();
        this.hit(spec, pad, r.left + r.width / 2, r.top + r.height / 2);
      }
    });
  }

  resize(): void {
    // pads are positioned in viewport fractions — nothing to do
  }

  destroy(): void {
    this.ctx.host.style.background = '';
  }

  private hit(spec: PadSpec, pad: HTMLElement, x: number, y: number): void {
    this.ctx.audio.drum(spec.kind);
    this.ctx.bump();
    pad.style.transform = 'translate(-50%,-50%) scale(0.88)';
    setTimeout(() => {
      pad.style.transform = 'translate(-50%,-50%)';
    }, 90);
    this.ctx.particles.burst({
      x,
      y,
      count: 7,
      colors: [spec.color, '#ffffff', '#ffe082'],
      speed: [80, 260],
      size: [3, 7],
      ttl: [0.25, 0.55],
      gravity: 320,
    });
  }
}
