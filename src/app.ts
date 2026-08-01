import { AudioEngine } from './engine/audio';
import { CanvasLayer } from './engine/canvas';
import { dailyIndex } from './engine/daily';
import { GamepadInput } from './engine/gamepad';
import { MidiInput } from './engine/midi';
import { InputManager, type InputScope } from './engine/input';
import { ParticleSystem } from './engine/particles';
import { SettingsStore, type SettingsSnapshot } from './engine/settings';
import { Stats } from './engine/stats';
import { games } from './games';
import type { Game, GameContext, GameDefinition } from './games/types';
import { KidLock } from './lock/kidlock';
import { ParentGate } from './lock/parent-gate';
import { WakeLock } from './lock/wake-lock';
import { Hud } from './ui/hud';
import { Menu } from './ui/menu';
import { ParentPanel } from './ui/parent-panel';
import { ResumeOverlay } from './ui/resume-overlay';

/**
 * Shell state machine: splash → menu ⇄ game, with the kid-lock, parent gate,
 * and a single rAF loop driving the active game and the shared particle overlay.
 */
export class App {
  private audio = new AudioEngine();
  private settings = new SettingsStore();
  private stats = new Stats();
  private particles = new ParticleSystem();
  private kidlock = new KidLock();
  private gate = new ParentGate();
  private wakeLock = new WakeLock();
  private gamepad = new GamepadInput();
  private midi = new MidiInput();

  private input: InputManager;
  private appScope: InputScope;
  private menu: Menu;
  private hud = new Hud();
  private panel: ParentPanel;
  private resumeOverlay = new ResumeOverlay();
  private gameHost: HTMLElement;
  private overlay: CanvasLayer;
  private gateRing: HTMLElement;

  private activeGame: Game | null = null;
  private activeScope: InputScope | null = null;
  private activeCtx: GameContext | null = null;
  private paused = false;
  private lastT = 0;
  /** Game-of-the-day: extra confetti and a little opening celebration. */
  private dailyId = games[dailyIndex(games.length)]?.meta.id ?? null;
  private dailyActive = false;

  constructor(private root: HTMLElement) {
    // clear the pre-boot/no-JS content the moment the app takes over
    root.replaceChildren();
    this.input = new InputManager(root);
    this.appScope = this.input.createScope();
    this.menu = new Menu(
      games,
      {
        onBegin: () => {
          this.begin();
        },
        onPick: (def) => void this.openGame(def),
      },
      this.dailyId,
    );
    this.panel = new ParentPanel(this.settings, this.stats, games, {
      onResume: () => {
        this.closePanel();
      },
      onSwitchGame: (def) => {
        this.closePanel();
        void this.openGame(def);
      },
      onExit: () => {
        this.exitAndUnlock();
      },
      midiSupported: () => this.midi.supported,
      onConnectMidi: () => this.midi.enable(),
    });

    this.gameHost = document.createElement('div');
    this.gameHost.className = 'game-host';
    this.gameHost.style.display = 'none';

    const overlayHost = document.createElement('div');
    overlayHost.className = 'particle-overlay';
    this.overlay = new CanvasLayer(overlayHost);

    this.gateRing = document.createElement('div');
    this.gateRing.className = 'gate-ring';
    this.gateRing.style.display = 'none';

    root.append(
      this.gameHost,
      this.menu.el,
      overlayHost,
      this.hud.el,
      this.gateRing,
      this.panel.el,
      this.resumeOverlay.el,
    );
  }

  start(): void {
    this.applySettings(this.settings.snapshot);
    this.settings.onChange((s) => {
      this.applySettings(s);
    });
    this.wireGate();
    this.wireLifecycle();
    // gamepad buttons and MIDI notes act as key presses — every game understands keys
    this.gamepad.onPress = (code) => {
      this.input.emitKey({ code, key: '', repeat: false });
    };
    this.midi.onNote = (code) => {
      this.input.emitKey({ code, key: '', repeat: false });
    };
    this.lastT = performance.now();
    requestAnimationFrame((t) => {
      this.loop(t);
    });
  }

  /** First tap on the splash — the one user gesture that arms everything. */
  private begin(): void {
    this.audio.unlock();
    this.kidlock.engage();
    this.wakeLock.acquire();
    this.stats.startSession();
    this.audio.chime();
    // ?game=<id> deep link from the per-game landing pages
    const wanted = new URLSearchParams(location.search).get('game');
    const def = wanted ? games.find((g) => g.meta.id === wanted) : undefined;
    if (def) void this.openGame(def);
  }

  private async openGame(def: GameDefinition): Promise<void> {
    this.audio.chime();
    this.destroyGame();
    this.menu.hide();
    this.gameHost.style.display = '';
    this.gameHost.style.background = '';

    // if a fresh deploy invalidated this session's lazy chunks, the import fails —
    // restart cleanly to the new version instead of stranding the child on a blank screen
    const game = await def.load().catch(() => null);
    if (!game) {
      this.kidlock.release();
      location.reload();
      return;
    }
    const scope = this.input.createScope();
    const ctx: GameContext = {
      host: this.gameHost,
      audio: this.audio,
      input: scope,
      particles: this.particles,
      settings: () => this.settings.snapshot,
      bump: () => {
        this.stats.bump(def.meta.id);
        // a whisper of haptic feedback on devices that support it (not in calm mode)
        if (!this.settings.snapshot.calm && 'vibrate' in navigator) navigator.vibrate(8);
      },
      width: this.root.clientWidth,
      height: this.root.clientHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };
    this.activeGame = game;
    this.activeScope = scope;
    this.activeCtx = ctx;
    game.init(ctx);
    this.dailyActive = def.meta.id === this.dailyId;
    this.applyParticleIntensity();
    if (this.dailyActive) {
      this.audio.sparkle();
      this.particles.burst({
        x: ctx.width / 2,
        y: ctx.height / 3,
        count: 40,
        colors: ['#ffd54f', '#4dd0e1', '#f06292', '#aed581', '#ffffff'],
        speed: [80, 320],
        size: [3, 7],
        ttl: [0.6, 1.4],
        gravity: 240,
      });
    }
    this.hud.show();
    this.hud.onHome = () => {
      this.goHome();
    };
  }

  private goHome(): void {
    this.destroyGame();
    this.audio.chime();
    this.menu.show();
  }

  private destroyGame(): void {
    this.activeGame?.destroy();
    this.activeScope?.dispose();
    this.activeGame = null;
    this.activeScope = null;
    this.activeCtx = null;
    this.dailyActive = false;
    this.applyParticleIntensity();
    this.gameHost.innerHTML = '';
    this.gameHost.style.display = 'none';
    this.particles.clear();
    this.hud.hide();
  }

  // ---------- parent gate + panel ----------

  private wireGate(): void {
    const w = () => this.root.clientWidth;
    const h = () => this.root.clientHeight;
    this.appScope.onDown((p) => {
      this.gate.pointerDown(p.id, p.x, p.y, w(), h(), performance.now());
    });
    this.appScope.onMove((p) => {
      this.gate.pointerMove(p.id, p.x, p.y, w(), h());
    });
    this.appScope.onUp((p) => {
      this.gate.pointerUp(p.id);
    });
    this.appScope.onKey((k) => {
      if (!k.repeat) this.gate.key(k.key);
      // on the menu, keys have no game to reach — still reward the smash
      const panelOpen = this.panel.el.style.display !== 'none';
      if (!k.repeat && !this.activeGame && !panelOpen && this.menu.isShowingGrid) {
        this.menu.pulseRandom();
        this.audio.randomNote(0.4);
      }
    });
    this.gate.onOpen = () => {
      this.openPanel();
    };
  }

  private openPanel(): void {
    if (!this.kidlock.engaged) return;
    this.setPaused(true);
    this.gateRing.style.display = 'none';
    this.panel.show();
  }

  private closePanel(): void {
    this.panel.hide();
    this.setPaused(false);
  }

  /** Pausing also mutes the game's input scope — keys typed into the parent panel
   *  must never reach the game (state changes, speech). */
  private setPaused(paused: boolean): void {
    this.paused = paused;
    if (this.activeScope) this.activeScope.enabled = !paused;
    if (paused) this.audio.suspend();
    else this.audio.resume();
  }

  private exitAndUnlock(): void {
    this.kidlock.release();
    this.wakeLock.release();
    // reload lands back on the splash, fully unlocked and ready to re-arm
    location.reload();
  }

  // ---------- lifecycle ----------

  private wireLifecycle(): void {
    this.kidlock.onFullscreenLost = () => {
      const panelOpen = this.panel.el.style.display !== 'none';
      if (!panelOpen) this.resumeOverlay.show();
    };
    this.resumeOverlay.onTap = () => {
      this.resumeOverlay.hide();
      void this.kidlock.enterFullscreen();
    };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.setPaused(true);
      } else {
        this.wakeLock.reacquire();
        const panelOpen = this.panel.el.style.display !== 'none';
        if (!panelOpen) this.setPaused(false);
      }
    });
    const ro = new ResizeObserver(() => {
      const ctx = this.activeCtx;
      if (!ctx || !this.activeGame) return;
      ctx.width = this.root.clientWidth;
      ctx.height = this.root.clientHeight;
      ctx.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.activeGame.resize(ctx.width, ctx.height, ctx.dpr);
    });
    ro.observe(this.root);
  }

  private applySettings(s: Readonly<SettingsSnapshot>): void {
    this.audio.setMuted(!s.sound);
    this.audio.speechOn = s.speech;
    this.applyParticleIntensity();
    document.body.classList.toggle('calm', s.calm);
  }

  private applyParticleIntensity(): void {
    const base = this.settings.snapshot.calm ? 0.5 : 1;
    this.particles.intensity = base * (this.dailyActive ? 1.5 : 1);
  }

  // ---------- the loop ----------

  private loop(t: number): void {
    const dt = Math.min((t - this.lastT) / 1000, 0.05);
    this.lastT = t;

    if (!this.paused) this.gamepad.poll();

    if (!this.paused) {
      this.activeGame?.update?.(dt);
      this.particles.update(dt);
      this.overlay.clear();
      this.particles.render(this.overlay.ctx);
    }

    const progress = this.gate.tick(performance.now());
    if (progress !== null && this.kidlock.engaged) {
      this.gateRing.style.display = '';
      this.gateRing.style.setProperty('--gate', String(progress));
    } else {
      this.gateRing.style.display = 'none';
    }

    requestAnimationFrame((t2) => {
      this.loop(t2);
    });
  }
}
