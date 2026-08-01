import type { GameDefinition } from './types';

/**
 * The full arcade. Menu cards render from meta instantly; game code lazy-loads
 * on first tap so each game is its own chunk.
 */
export const games: GameDefinition[] = [
  {
    meta: { id: 'bubble-pop', title: 'Bubble Pop', icon: '🫧', color: '#4fc3f7' },
    load: () => import('./bubble-pop').then((m) => new m.BubblePop()),
  },
];
