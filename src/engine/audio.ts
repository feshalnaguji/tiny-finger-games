import { pick, range } from './rng';

/** C-major pentatonic across two octaves — random melodies always sound pleasant. */
export const PENTATONIC = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81] as const;

/** One octave of C major, for the piano. */
export const MAJOR_SCALE = [60, 62, 64, 65, 67, 69, 71, 72] as const;

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export type DrumKind = 'kick' | 'snare' | 'hat' | 'wood' | 'shaker';
export type AnimalKind = 'cat' | 'dog' | 'cow' | 'duck' | 'sheep' | 'frog' | 'bird' | 'lion';

interface ToneOptions {
  freq: number;
  freqTo?: number;
  wave?: OscillatorType;
  dur?: number;
  vel?: number;
  attack?: number;
  vibratoHz?: number;
  vibratoDepth?: number;
  delay?: number;
}

interface NoiseOptions {
  dur?: number;
  vel?: number;
  filter?: BiquadFilterType;
  freq?: number;
  freqTo?: number;
  q?: number;
  delay?: number;
}

/**
 * Every sound in Tiny Paws is synthesized here — no audio files.
 * Chain: voices → master gain → compressor → destination. The compressor is the
 * toddler-proofing: thirty simultaneous pops cannot clip or blast.
 */
export class AudioEngine {
  speechOn = true;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private muted = false;

  /** Must be called from a user gesture before any sound can play. */
  unlock(): void {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') void ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.05);
    }
  }

  /** Tab hidden → stop the clock entirely. */
  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend();
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  }

  // ---------- musical voices ----------

  note(
    midi: number,
    opts: {
      wave?: OscillatorType;
      dur?: number;
      vel?: number;
      delay?: number;
      attack?: number;
    } = {},
  ): void {
    this.tone({
      freq: midiToFreq(midi),
      wave: opts.wave ?? 'triangle',
      dur: opts.dur ?? 0.45,
      vel: opts.vel ?? 0.5,
      delay: opts.delay ?? 0,
      attack: opts.attack ?? 0.005,
    });
  }

  randomNote(vel = 0.5): void {
    this.note(pick(PENTATONIC), { vel });
  }

  pop(size = 0.5): void {
    const from = 950 - 550 * size;
    this.tone({ freq: from, freqTo: from * 0.35, wave: 'sine', dur: 0.13, vel: 0.55 });
    this.noise({ dur: 0.03, vel: 0.25, filter: 'highpass', freq: 2000 });
  }

  chime(): void {
    this.tone({ freq: midiToFreq(72), wave: 'sine', dur: 0.5, vel: 0.4 });
    this.tone({ freq: midiToFreq(76), wave: 'sine', dur: 0.6, vel: 0.35, delay: 0.07 });
  }

  sparkle(): void {
    const n = 5;
    for (let i = 0; i < n; i++) {
      this.tone({
        freq: midiToFreq(pick(PENTATONIC) + 12),
        wave: 'sine',
        dur: 0.15,
        vel: 0.25,
        delay: i * 0.05,
      });
    }
  }

  /** Ascending arpeggio step — Star Catcher feeds a rising index for a melody. */
  arpeggio(step: number, vel = 0.4): void {
    const midi = PENTATONIC[step % PENTATONIC.length] as number;
    this.note(midi + 12 * Math.floor(step / PENTATONIC.length), { wave: 'sine', vel, dur: 0.3 });
  }

  // ---------- effect voices ----------

  boom(): void {
    this.tone({ freq: 120, freqTo: 45, wave: 'sine', dur: 0.7, vel: 0.8 });
    this.noise({ dur: 0.5, vel: 0.5, filter: 'lowpass', freq: 400, freqTo: 80 });
  }

  whoosh(dir: 'up' | 'down' = 'up'): void {
    const [from, to] = dir === 'up' ? [300, 2200] : [2200, 300];
    this.noise({ dur: 0.5, vel: 0.35, filter: 'bandpass', freq: from, freqTo: to, q: 2 });
  }

  chomp(): void {
    this.tone({ freq: 180, freqTo: 90, wave: 'square', dur: 0.07, vel: 0.35 });
    this.noise({ dur: 0.09, vel: 0.3, filter: 'lowpass', freq: 900, delay: 0.03 });
  }

  giggle(): void {
    for (let i = 0; i < 4; i++) {
      this.tone({
        freq: range(500, 700) + i * 80,
        wave: 'sine',
        dur: 0.08,
        vel: 0.3,
        delay: i * 0.09,
      });
    }
  }

  drum(kind: DrumKind): void {
    switch (kind) {
      case 'kick':
        this.tone({ freq: 150, freqTo: 48, wave: 'sine', dur: 0.35, vel: 0.9 });
        break;
      case 'snare':
        this.tone({ freq: 185, wave: 'triangle', dur: 0.12, vel: 0.4 });
        this.noise({ dur: 0.15, vel: 0.5, filter: 'highpass', freq: 1200 });
        break;
      case 'hat':
        this.noise({ dur: 0.06, vel: 0.35, filter: 'highpass', freq: 6000 });
        break;
      case 'wood':
        this.tone({ freq: 620, freqTo: 590, wave: 'sine', dur: 0.09, vel: 0.6 });
        break;
      case 'shaker':
        this.noise({ dur: 0.18, vel: 0.3, filter: 'bandpass', freq: 4500, q: 1.5 });
        break;
    }
  }

  animal(kind: AnimalKind): void {
    switch (kind) {
      case 'cat':
        this.tone({
          freq: 780,
          freqTo: 420,
          wave: 'sine',
          dur: 0.35,
          vel: 0.4,
          vibratoHz: 9,
          vibratoDepth: 25,
          attack: 0.08,
        });
        this.tone({
          freq: 700,
          freqTo: 380,
          wave: 'sine',
          dur: 0.3,
          vel: 0.35,
          delay: 0.4,
          vibratoHz: 9,
          vibratoDepth: 25,
          attack: 0.08,
        });
        break;
      case 'dog':
        this.tone({ freq: 260, freqTo: 150, wave: 'square', dur: 0.1, vel: 0.35, attack: 0.01 });
        this.tone({
          freq: 240,
          freqTo: 140,
          wave: 'square',
          dur: 0.1,
          vel: 0.35,
          delay: 0.18,
          attack: 0.01,
        });
        break;
      case 'cow':
        this.tone({
          freq: 140,
          freqTo: 92,
          wave: 'sawtooth',
          dur: 0.9,
          vel: 0.45,
          vibratoHz: 5,
          vibratoDepth: 8,
          attack: 0.15,
        });
        break;
      case 'duck':
        this.tone({
          freq: 340,
          freqTo: 300,
          wave: 'square',
          dur: 0.14,
          vel: 0.3,
          vibratoHz: 28,
          vibratoDepth: 60,
        });
        this.tone({
          freq: 330,
          freqTo: 290,
          wave: 'square',
          dur: 0.14,
          vel: 0.3,
          delay: 0.2,
          vibratoHz: 28,
          vibratoDepth: 60,
        });
        break;
      case 'sheep':
        this.tone({
          freq: 230,
          freqTo: 190,
          wave: 'sawtooth',
          dur: 0.6,
          vel: 0.35,
          vibratoHz: 9,
          vibratoDepth: 30,
          attack: 0.05,
        });
        break;
      case 'frog':
        this.tone({ freq: 130, freqTo: 95, wave: 'square', dur: 0.09, vel: 0.4 });
        this.tone({ freq: 130, freqTo: 95, wave: 'square', dur: 0.09, vel: 0.4, delay: 0.14 });
        break;
      case 'bird':
        for (let i = 0; i < 3; i++) {
          this.tone({
            freq: 1300,
            freqTo: 2300,
            wave: 'sine',
            dur: 0.09,
            vel: 0.28,
            delay: i * 0.12,
          });
        }
        break;
      case 'lion':
        this.tone({
          freq: 110,
          freqTo: 70,
          wave: 'sawtooth',
          dur: 0.9,
          vel: 0.45,
          vibratoHz: 14,
          vibratoDepth: 12,
          attack: 0.12,
        });
        this.noise({ dur: 0.8, vel: 0.3, filter: 'lowpass', freq: 500, freqTo: 200 });
        break;
    }
  }

  speak(text: string): void {
    if (!this.speechOn || this.muted) return;
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.2;
    speechSynthesis.speak(u);
  }

  // ---------- synthesis primitives ----------

  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 20;
      compressor.ratio.value = 8;
      compressor.connect(this.ctx.destination);
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(compressor);
    }
    return this.ctx;
  }

  private tone(o: ToneOptions): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || ctx.state !== 'running') return;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const dur = o.dur ?? 0.3;
    const vel = o.vel ?? 0.5;
    const attack = o.attack ?? 0.005;

    const osc = ctx.createOscillator();
    osc.type = o.wave ?? 'sine';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.freqTo !== undefined)
      osc.frequency.exponentialRampToValueAtTime(Math.max(o.freqTo, 1), t0 + dur);

    if (o.vibratoHz !== undefined) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = o.vibratoHz;
      lfoGain.gain.value = o.vibratoDepth ?? 10;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(t0);
      lfo.stop(t0 + dur);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vel, t0 + attack);
    env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

    osc.connect(env).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(o: NoiseOptions): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || ctx.state !== 'running') return;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const dur = o.dur ?? 0.2;
    const vel = o.vel ?? 0.4;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = o.filter ?? 'lowpass';
    filter.frequency.setValueAtTime(o.freq ?? 1000, t0);
    if (o.freqTo !== undefined)
      filter.frequency.exponentialRampToValueAtTime(Math.max(o.freqTo, 1), t0 + dur);
    filter.Q.value = o.q ?? 1;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vel, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

    src.connect(filter).connect(env).connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuf) {
      this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  }
}
