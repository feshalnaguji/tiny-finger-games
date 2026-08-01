import { AudioEngine } from './engine/audio';
import { CanvasLayer } from './engine/canvas';
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

  constructor(private root: HTMLElement) {
    this.input = new InputManager(root);
    this.appScope = this.input.createScope();
    this.menu = new Menu(games, {
      onBegin: () => {
        this.begin();
      },
      onPick: (def) => void this.openGame(def),
    });
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
  }

  private async openGame(def: GameDefinition): Promise<void> {
    this.audio.chime();
    this.destroyGame();
    this.menu.hide();
    this.gameHost.style.display = '';
    this.gameHost.style.background = '';

    const game = await def.load();
    const scope = this.input.createScope();
    const ctx: GameContext = {
      host: this.gameHost,
      audio: this.audio,
      input: scope,
      particles: this.particles,
      settings: () => this.settings.snapshot,
      bump: () => {
        this.stats.bump(def.meta.id);
      },
      width: this.root.clientWidth,
      height: this.root.clientHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };
    this.activeGame = game;
    this.activeScope = scope;
    this.activeCtx = ctx;
    game.init(ctx);
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
    });
    this.gate.onOpen = () => {
      this.openPanel();
    };
  }

  private openPanel(): void {
    if (!this.kidlock.engaged) return;
    this.paused = true;
    this.audio.suspend();
    this.gateRing.style.display = 'none';
    this.panel.show();
  }

  private closePanel(): void {
    this.panel.hide();
    this.paused = false;
    this.audio.resume();
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
        this.paused = true;
        this.audio.suspend();
      } else {
        this.wakeLock.reacquire();
        const panelOpen = this.panel.el.style.display !== 'none';
        if (!panelOpen) {
          this.paused = false;
          this.audio.resume();
        }
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
    this.particles.intensity = s.calm ? 0.5 : 1;
    document.body.classList.toggle('calm', s.calm);
  }

  // ---------- the loop ----------

  private loop(t: number): void {
    const dt = Math.min((t - this.lastT) / 1000, 0.05);
    this.lastT = t;

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
