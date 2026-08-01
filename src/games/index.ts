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
  {
    meta: { id: 'rainbow-piano', title: 'Rainbow Piano', icon: '🎹', color: '#f06292' },
    load: () => import('./rainbow-piano').then((m) => new m.RainbowPiano()),
  },
  {
    meta: { id: 'drum-time', title: 'Drum Time', icon: '🥁', color: '#ef5350' },
    load: () => import('./drum-time').then((m) => new m.DrumTime()),
  },
  {
    meta: { id: 'animal-friends', title: 'Animal Friends', icon: '🐮', color: '#9ccc65' },
    load: () => import('./animal-friends').then((m) => new m.AnimalFriends()),
  },
  {
    meta: { id: 'space-smash', title: 'Space Smash', icon: '🚀', color: '#7e57c2' },
    load: () => import('./space-smash').then((m) => new m.SpaceSmash()),
  },
  {
    meta: { id: 'finger-paint', title: 'Finger Paint', icon: '🎨', color: '#ffb74d' },
    load: () => import('./finger-paint').then((m) => new m.FingerPaint()),
  },
  {
    meta: { id: 'fireworks', title: 'Fireworks', icon: '🎆', color: '#ff7043' },
    load: () => import('./fireworks').then((m) => new m.Fireworks()),
  },
  {
    meta: { id: 'peekaboo', title: 'Peekaboo', icon: '🚪', color: '#8d6e63' },
    load: () => import('./peekaboo').then((m) => new m.Peekaboo()),
  },
  {
    meta: { id: 'little-aquarium', title: 'Little Aquarium', icon: '🐠', color: '#26c6da' },
    load: () => import('./little-aquarium').then((m) => new m.LittleAquarium()),
  },
  {
    meta: { id: 'feed-the-monster', title: 'Feed the Monster', icon: '👹', color: '#ab47bc' },
    load: () => import('./feed-the-monster').then((m) => new m.FeedTheMonster()),
  },
  {
    meta: { id: 'shape-party', title: 'Shape Party', icon: '💠', color: '#26a69a' },
    load: () => import('./shape-party').then((m) => new m.ShapeParty()),
  },
  {
    meta: { id: 'star-catcher', title: 'Star Catcher', icon: '🌠', color: '#5c6bc0' },
    load: () => import('./star-catcher').then((m) => new m.StarCatcher()),
  },
];
