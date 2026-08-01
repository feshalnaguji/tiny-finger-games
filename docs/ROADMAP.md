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

## Next candidates

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

- **Guess the sound** — an animal call plays, the matching animal celebrates when found.
- **Counting pond** — tap ducks into a pond and hear "one, two, three…" (speech exists).
- **Rain maker** — tap the sky for rain with plip-plop notes; puddles grow; rainbows appear.
- **Little trains** — connect wagons by tapping; the train chugs a rhythm as it rolls.
- **Snow globe** — shake (device motion!) or tap to swirl snow around a cozy scene.
- **Memory pairs** (2×2 → 2×3) — flip cards with animal sounds; endless gentle retries.
- **Sticker book** — drag emoji stickers onto scenes; persists locally per device.
- **Dino roar-off** — tap dinosaurs, they roar back louder (compressor keeps it safe).
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
