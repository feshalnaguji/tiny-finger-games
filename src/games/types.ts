import type { AudioEngine } from '../engine/audio';
import type { InputScope } from '../engine/input';
import type { ParticleSystem } from '../engine/particles';
import type { SettingsSnapshot } from '../engine/settings';

export interface GameMeta {
  id: string;
  /** Shown only in the parent panel and aria-labels — kids navigate by icon. */
  title: string;
  icon: string;
  color: string;
}

export interface GameContext {
  /** Empty container filling the viewport; the game owns its contents. */
  host: HTMLElement;
  audio: AudioEngine;
  /** Input subscriptions here are disposed automatically when the game is destroyed. */
  input: InputScope;
  /** Shared overlay particle system, rendered above the game. */
  particles: ParticleSystem;
  /** Live settings — read at use time, never cache. */
  settings: () => Readonly<SettingsSnapshot>;
  /** Count one joyful interaction (for parent-panel stats). */
  bump: () => void;
  width: number;
  height: number;
  dpr: number;
}

export interface Game {
  init(ctx: GameContext): void;
  /** Driven by the app's single rAF loop; dt in seconds, capped at 0.05. */
  update?(dt: number): void;
  resize(width: number, height: number, dpr: number): void;
  /** Must leave the host empty and stop everything it started. */
  destroy(): void;
}

export interface GameDefinition {
  meta: GameMeta;
  load: () => Promise<Game>;
}
