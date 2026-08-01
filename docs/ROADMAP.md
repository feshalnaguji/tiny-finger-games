# Tiny Paws — Roadmap & Idea Backlog

Ideas live here so nothing gets lost. When one ships, move it to the "Shipped" list with the
version it landed in.

## Shipped

- ✅ 12 launch games, kid-lock, parent gate, PWA, CI → GitHub Pages (v1.0.0)
- ✅ Full keyboard playability in every game + menu key feedback (v1.1)
- ✅ Haptic ticks, CSP hardening, input muting while paused, deploy-window recovery (v1.1)
- ✅ **Daily surprise** — game of the day gets a ✨ badge, glowing card, opening confetti, and
  1.5× particle intensity while playing (v1.2)
- ✅ Three new games: Beep Beep Cars 🚗, Pop Pad 🍬, Garden Friends 🌼 (v1.2)

## Next candidates

- **Parent PIN option** — an alternative to the corner-hold gate for households where an older
  sibling has cracked the gesture; simple 4-digit pad in the parent panel, stored locally.
- **Spoken-words language picker** — SpeechSynthesis already ships dozens of voices; let parents
  pick the language for animal names, letters, and solfège ("La vaca dice muu").
- **Sound themes** — alternate synth voice sets selectable in the parent panel (music box,
  marimba, 8-bit) by swapping oscillator/envelope presets in `AudioEngine`.
- **Session wind-down timer** — parent sets 10/20/30 min; the site slowly dims and shifts to
  calm-mode visuals with a lullaby note-set instead of a hard cutoff.
- **Seasonal sprinkles** — date-driven touches reusing the daily-surprise hash: snow particles in
  December, blossoms in spring, pumpkins in October. Zero assets, all emoji.

## More ideas (unscoped)

- Gamepad/MIDI input via the Gamepad + Web MIDI APIs — baby-safe controllers and pianos.
- "First words" game — big objects that speak their name when tapped (uses existing speech).
- Gentle counting game — tap ducks into a pond, hear "one, two, three...".
- Colors game — the screen asks for "blue!" and everything blue celebrates when touched.
- Memory pairs (2×2, then 2×3) — flip cards with animal sounds; no failure, endless retries.
- Night-sky lullaby mode — a near-static starfield with very slow chimes for wind-down.
- Sticker book — drag emoji stickers onto a scene; persists locally per device.
- Parent stats page — per-game play time chart (all local, no telemetry ever).
- Configurable exit gesture (corner choice / hold duration) in the parent panel.
- Android TV / large-screen mode — D-pad navigation for the menu.

## Engineering notes

- Keep the invariants: no reading, no failure states, multi-touch, keyboard-playable, calm-mode
  aware, own lazy chunk, zero binary assets (icons excepted).
- New games register only in `src/games/index.ts`; everything else is automatic (menu, parent
  panel, stats, daily surprise).
- If particle emoji rendering ever shows up in profiles, pre-render glyphs to offscreen canvases.
