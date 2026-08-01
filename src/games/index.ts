import { catalog, type GameId } from './catalog';
import type { Game, GameDefinition } from './types';

/**
 * Loader per game id — `Record<GameId, ...>` makes a missing loader a compile
 * error whenever a game is added to the catalog. Each import is its own chunk.
 */
const loaders: Record<GameId, () => Promise<Game>> = {
  'bubble-pop': () => import('./bubble-pop').then((m) => new m.BubblePop()),
  'rainbow-piano': () => import('./rainbow-piano').then((m) => new m.RainbowPiano()),
  'drum-time': () => import('./drum-time').then((m) => new m.DrumTime()),
  'animal-friends': () => import('./animal-friends').then((m) => new m.AnimalFriends()),
  'space-smash': () => import('./space-smash').then((m) => new m.SpaceSmash()),
  'finger-paint': () => import('./finger-paint').then((m) => new m.FingerPaint()),
  fireworks: () => import('./fireworks').then((m) => new m.Fireworks()),
  peekaboo: () => import('./peekaboo').then((m) => new m.Peekaboo()),
  'little-aquarium': () => import('./little-aquarium').then((m) => new m.LittleAquarium()),
  'feed-the-monster': () => import('./feed-the-monster').then((m) => new m.FeedTheMonster()),
  'shape-party': () => import('./shape-party').then((m) => new m.ShapeParty()),
  'star-catcher': () => import('./star-catcher').then((m) => new m.StarCatcher()),
  'beep-beep-cars': () => import('./beep-beep-cars').then((m) => new m.BeepBeepCars()),
  'pop-pad': () => import('./pop-pad').then((m) => new m.PopPad()),
  'garden-friends': () => import('./garden-friends').then((m) => new m.GardenFriends()),
  'first-words': () => import('./first-words').then((m) => new m.FirstWords()),
  'color-pop': () => import('./color-pop').then((m) => new m.ColorPop()),
  'sleepy-stars': () => import('./sleepy-stars').then((m) => new m.SleepyStars()),
  'counting-pond': () => import('./counting-pond').then((m) => new m.CountingPond()),
  'guess-the-sound': () => import('./guess-the-sound').then((m) => new m.GuessTheSound()),
};

export const games: GameDefinition[] = catalog.map((meta) => ({
  meta,
  load: loaders[meta.id],
}));
