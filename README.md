# Tiny Paws 🐾

**A safe, fullscreen play site for toddlers (ages 1+): eighteen mini-games behind a kid-lock, so
little fingers can smash away without ever leaving the app.**

🎮 **Play it:** https://feshalnaguji.github.io/tiny-finger-games/

Inspired by keyboard-smash toys like tinyfingers.net — then pushed further in every direction:
a whole arcade instead of one toy, a real kid-lock instead of hope, and everything synthesized
in the browser (no downloads, no ads, no accounts, no tracking, works offline).

## The 18 games

|     | Game             | What happens                                                                   |
| --- | ---------------- | ------------------------------------------------------------------------------ |
| 🫧  | Bubble Pop       | Bubbles drift up; tap or sweep to pop them (pitch matches size)                |
| 🎹  | Rainbow Piano    | 8 rainbow bars, one octave of C major — drag for glissandos, keys work too     |
| 🥁  | Drum Time        | Five giant pads: kick, snare, hat, woodblock, shaker — fully multi-touch       |
| 🐮  | Animal Friends   | Tap an animal, hear its call and name; positions never move (spatial memory)   |
| 🚀  | Space Smash      | Any key or tap spawns rockets, planets, aliens, or giant spoken letters        |
| 🎨  | Finger Paint     | Every finger is a rainbow brush that plays notes; strokes fade by themselves   |
| 🎆  | Fireworks        | Tap the sky, a shell flies to that exact spot: spheres, rings, hearts, willows |
| 🚪  | Peekaboo         | Four doors, somebody new behind each — object permanence as a game             |
| 🐠  | Little Aquarium  | The calm one: tap fish to delight them, tap water to sprinkle food             |
| 👹  | Feed the Monster | Eyes follow your finger; fruit flies into its mouth; occasional tiny burps     |
| ⭐  | Shape Party      | Match the dashed outline; wrong shapes just jiggle happily — never a buzzer    |
| 🌠  | Star Catcher     | Your finger becomes a comet; swept stars play a rising melody                  |
| 🚗  | Beep Beep Cars   | Tap to send vehicles driving across a sunny road; tap them back for honks      |
| 🍬  | Pop Pad          | A pop-it fidget board with pitch-mapped pops; pop them all for confetti        |
| 🌼  | Garden Friends   | Plant flowers with a tap; bees and a butterfly fly over to visit them          |
| 🍎  | First Words      | Big everyday things that say their name when tapped — first vocabulary         |
| 🌈  | Color Pop        | "Find the blue ones!" — touch the target color and it celebrates; no failing   |
| 🌙  | Sleepy Stars     | The wind-down screen: a still night sky where touched stars ring soft chimes   |

✨ **Daily surprise:** every day one game wears a glowing badge on the menu — opening it starts
with confetti and it plays with extra sparkle all day.

Design rules for every game: **no reading, no failure states, no timers, no scores.** Every input
gets a response within one frame. Full multi-touch. Touch targets over 2 cm. **Every game is also
fully keyboard-playable** — smashing any key pops a bubble, launches a firework, opens a door,
feeds the monster — so the youngest keyboard-smashers get the whole arcade, and even the menu
sings back when keys are pressed.

**Gamepads work out of the box** — any button on any connected controller acts like a key press
in every game. **MIDI keyboards** connect from the parent panel (🎹 button); real piano keys play
the matching bars in Rainbow Piano and act as key presses everywhere else.

## The kid-lock 🔒

One tap on ▶️ arms everything:

- **Fullscreen** + **Keyboard Lock API** (Chromium desktop captures Esc, Tab, F11, Alt+arrows)
- Back button / edge-swipe absorbed by a history trap
- Pinch-zoom, double-tap zoom, context menus, text selection, pull-to-refresh — all blocked
- Close/refresh guarded by a confirmation prompt
- Screen kept awake via the Wake Lock API
- If fullscreen is ever lost, a friendly overlay re-enters it on the next tap

**Getting out is for grown-ups only:**

- **Hold both top corners for 2½ seconds** (a toddler physically can't), or
- type **`parent`** on a keyboard, or
- on desktop, hold **Esc** for 2 seconds (a browser rule that can't be disabled — by design)

That opens the parent panel: sound / spoken-words / calm-mode toggles, game switcher, play stats,
and the actual exit (double-confirmed).

In-game, the 🏠 button needs a deliberate **1-second hold** to return to the menu — accidental
taps do nothing, so kids can switch games but never escape.

> **iPhone/iPad note:** Safari has no fullscreen or keyboard-lock APIs. Add Tiny Paws to the Home
> Screen (it's a PWA — runs standalone, works offline) and use **Guided Access** (triple-click the
> side button) for the strongest lock.

## Tech

- **Vanilla TypeScript + Vite** — no framework, ~10 KB core, each game its own lazy chunk
- **Every sound is synthesized** with the Web Audio API (notes, pops, drums, cartoon animal
  calls) — zero audio files; a master compressor keeps 30 simultaneous pops from ever blasting
- Visuals are canvas + emoji + CSS — the whole site precaches at ~120 KB
- **PWA**: installable, offline after first visit
- Strict TypeScript, typescript-eslint strict, Prettier, Vitest (settings store, parent-gate
  state machine, note math), GitHub Actions CI → GitHub Pages

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # production build to dist/
```

Deploys automatically to GitHub Pages on every push to `main` (CI runs typecheck, lint, format
check, tests, and build first).

### Device QA checklist

- [ ] Android Chrome: fullscreen, back-swipe absorbed, multi-touch drums
- [ ] iPad Safari: PWA install, standalone mode, two-corner gate
- [ ] iPhone Safari: PWA install + Guided Access flow
- [ ] Desktop Chrome/Edge: keyboard lock (Esc captured), typed `parent` gate
- [ ] Desktop Firefox: fallback traps (no keyboard-lock API)

## License

MIT © Feshal Naguji
