# Tiny Paws — Roadmap & Idea Backlog

Ideas live here so nothing gets lost. When one ships, move it to the "Shipped" list with the
version it landed in.

## Shipped

- ✅ 12 launch games, kid-lock, parent gate, PWA, CI → GitHub Pages (v1.0.0)
- ✅ Full keyboard playability in every game + menu key feedback (v1.1)
- ✅ Haptic ticks, CSP hardening, input muting while paused, deploy-window recovery (v1.1)
- ✅ Daily surprise — game of the day with badge, glow, confetti, extra sparkle (v1.2)
- ✅ Beep Beep Cars 🚗, Pop Pad 🍬, Garden Friends 🌼 (v1.2)
- ✅ **Gamepad support** — any button on any controller acts as a key press everywhere (v1.3)
- ✅ **MIDI keyboards** — parent-panel opt-in; real pitches map to Rainbow Piano bars (v1.3)
- ✅ **First Words 🍎** — tap objects, hear their names (v1.3)
- ✅ **Color Pop 🌈** — find-the-color with celebration, zero failure (v1.3)
- ✅ **Sleepy Stars 🌙** — lullaby wind-down starfield with long soft chimes (v1.3)
- ✅ **Counting Pond 🦆** — count to ten with splashes, quacks, and giant numerals (v2.0)
- ✅ **Guess the Sound 🔊** — mystery-call listening game; wrong guesses teach (v2.0)
- ✅ **Launch SEO** — per-game landing pages, games hub, about + privacy pages, sitemap,
  OG share images, JSON-LD, crawlable pre-boot content, `?game=` deep links (v2.0)
- ✅ **Rain Maker 🌧️** — musical rain, growing puddles, earned rainbows (v2.1)
- ✅ **Little Trains 🚂** — couple wagons to eight, confetti departure, toot-toot (v2.1)
- ✅ **Dino Stomp 🦖** — roaring dinos and hatching baby-dino eggs (v2.1)
- ✅ **Match Pairs 🎴** — four-card first memory game with animal calls (v2.1)
- ✅ Audio polish: reworked duck/cat/dog/lion voices, softer car engine, loudness balance (v2.1)
- ✅ Menu rows center at every width; launch ops checklist in docs/LAUNCH.md (v2.1)

> **v2.1 lineup review (2026-08-02):** all 24 games confirmed — no replacements. Every game
> owns a distinct interaction-type × education-area slot and an indexed SEO landing page;
> weakest entries (Star Catcher, Pop Pad) still hold unique mechanics. Additions beat
> replacements; the two below add capabilities no current game has.

## Next candidates

- **Sticker Book 🖼️** — drag emoji stickers onto scenes (meadow, sea, space), saved in
  localStorage per device. Adds the first _persistent creation_ — "show daddy what you made" is
  the top repeat-visit driver in toddler apps. Needs a drag interaction (new for us) and a
  parent-panel "clear creations" control.
- **I Spy 🔍** — "find the butterfly!" spoken prompt over a busy emoji scene; found things
  celebrate, missed taps name what was touched (mirrors Color Pop's no-fail teaching). Fills
  the missing seek-and-find genre; strong "I spy games for toddlers" query.

- **Parent PIN option** — an alternative to the corner-hold gate for households where an older
  sibling has cracked the gesture; simple 4-digit pad in the parent panel, stored locally.
- **Spoken-words language picker** — SpeechSynthesis ships dozens of voices; let parents pick
  the language for words, colors, animals, and solfège ("La vaca dice muu").
- **Sound themes** — alternate synth voice sets (music box, marimba, 8-bit) as presets in
  `AudioEngine`, chosen in the parent panel.
- **Session wind-down timer** — parent sets 10/20/30 min; the site slowly dims, calm mode
  engages, and the menu gently suggests Sleepy Stars instead of a hard cutoff.
- **Seasonal sprinkles** — date-driven touches reusing the daily hash: snow in December,
  blossoms in spring, pumpkins in October. Zero assets, all emoji.

## More ideas (unscoped)

- **Snow globe** — shake (device motion!) or tap to swirl snow around a cozy scene.
- **Sticker book** — drag emoji stickers onto scenes; persists locally per device.
- **Match Pairs level-up** — grow to 6 cards (3 pairs) after repeated wins; keep 4 as default.
- **Mirror dance** — a friendly blob mirrors your finger movements with trails and music.
- **Parent stats page** — per-game play-time chart, all local, no telemetry ever.
- **Configurable exit gesture** — corner choice / hold duration in the parent panel.
- **Android TV / big-screen mode** — D-pad menu navigation (gamepad support already lands
  half of this).
- **Device-motion play** — tilt to roll a ball through a soft playground (needs the iOS
  motion-permission prompt handled in the parent panel, like MIDI).
- **Two-player split screen** — mirrored halves so siblings stop fighting over the middle.

## Engineering notes

- Keep the invariants: no reading, no failure states, multi-touch, keyboard/gamepad-playable,
  calm-mode aware, own lazy chunk, zero binary assets (icons excepted).
- New games register only in `src/games/index.ts`; menu, panel, stats, daily surprise, gamepad
  and MIDI input are all automatic.
- Inputs that need a browser permission prompt (MIDI, device motion, camera-never) must be
  opt-in buttons in the parent panel — never at startup, never interrupting a child.
- If particle emoji rendering ever shows in profiles, pre-render glyphs to offscreen canvases.
