import type { GameMeta } from './types.ts';

/**
 * The single source of truth for every game's identity. Deliberately DOM-free
 * (only `import type` above, erased at runtime) so the SEO page generator can
 * run this file under plain Node without a bundler.
 */
export const catalog = [
  { id: 'bubble-pop', title: 'Bubble Pop', icon: '🫧', color: '#4fc3f7' },
  { id: 'rainbow-piano', title: 'Rainbow Piano', icon: '🎹', color: '#f06292' },
  { id: 'drum-time', title: 'Drum Time', icon: '🥁', color: '#ef5350' },
  { id: 'animal-friends', title: 'Animal Friends', icon: '🐮', color: '#9ccc65' },
  { id: 'space-smash', title: 'Space Smash', icon: '🚀', color: '#7e57c2' },
  { id: 'finger-paint', title: 'Finger Paint', icon: '🎨', color: '#ffb74d' },
  { id: 'fireworks', title: 'Fireworks', icon: '🎆', color: '#ff7043' },
  { id: 'peekaboo', title: 'Peekaboo', icon: '🚪', color: '#8d6e63' },
  { id: 'little-aquarium', title: 'Little Aquarium', icon: '🐠', color: '#26c6da' },
  { id: 'feed-the-monster', title: 'Feed the Monster', icon: '👹', color: '#ab47bc' },
  { id: 'shape-party', title: 'Shape Party', icon: '💠', color: '#26a69a' },
  { id: 'star-catcher', title: 'Star Catcher', icon: '🌠', color: '#5c6bc0' },
  { id: 'beep-beep-cars', title: 'Beep Beep Cars', icon: '🚗', color: '#78909c' },
  { id: 'pop-pad', title: 'Pop Pad', icon: '🍬', color: '#ec407a' },
  { id: 'garden-friends', title: 'Garden Friends', icon: '🌼', color: '#9ccc65' },
  { id: 'first-words', title: 'First Words', icon: '🍎', color: '#26a69a' },
  { id: 'color-pop', title: 'Color Pop', icon: '🌈', color: '#ab47bc' },
  { id: 'sleepy-stars', title: 'Sleepy Stars', icon: '🌙', color: '#3949ab' },
  { id: 'counting-pond', title: 'Counting Pond', icon: '🦆', color: '#00897b' },
  { id: 'guess-the-sound', title: 'Guess the Sound', icon: '🔊', color: '#f9a825' },
  { id: 'rain-maker', title: 'Rain Maker', icon: '🌧️', color: '#4a90d9' },
  { id: 'little-trains', title: 'Little Trains', icon: '🚂', color: '#ef6c00' },
  { id: 'dino-stomp', title: 'Dino Stomp', icon: '🦖', color: '#689f38' },
  { id: 'match-pairs', title: 'Match Pairs', icon: '🎴', color: '#d81b60' },
] as const satisfies readonly GameMeta[];

export type GameId = (typeof catalog)[number]['id'];
