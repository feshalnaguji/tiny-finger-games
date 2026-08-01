import type { SettingsStore, SettingsSnapshot } from '../engine/settings';
import type { Stats } from '../engine/stats';
import type { GameDefinition } from '../games/types';

interface PanelCallbacks {
  onResume: () => void;
  onSwitchGame: (def: GameDefinition) => void;
  onExit: () => void;
  midiSupported: () => boolean;
  onConnectMidi: () => Promise<boolean>;
}

/** Adult-styled overlay reachable only through the parent gate. */
export class ParentPanel {
  readonly el: HTMLElement;
  private exitArmed = false;

  constructor(
    private settings: SettingsStore,
    private stats: Stats,
    private games: GameDefinition[],
    private callbacks: PanelCallbacks,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'parent-panel';
    this.hide();
  }

  show(): void {
    this.render();
    this.el.style.display = '';
  }

  hide(): void {
    this.exitArmed = false;
    this.el.style.display = 'none';
  }

  private render(): void {
    const s = this.settings.snapshot;
    this.el.innerHTML = `
      <div class="parent-panel__card">
        <h2>👨‍👩‍👧 Parent panel</h2>
        <button class="parent-panel__resume" data-act="resume">▶ Back to playing</button>

        <div class="parent-panel__toggles">
          ${this.toggle('sound', '🔊 Sound', s)}
          ${this.toggle('speech', '🗣️ Spoken words', s)}
          ${this.toggle('calm', '🌙 Calm mode (less motion)', s)}
        </div>

        <h3>Switch game</h3>
        <div class="parent-panel__games">
          ${this.games
            .map(
              (g) =>
                `<button class="parent-panel__game" data-game="${g.meta.id}">${g.meta.icon} ${g.meta.title}</button>`,
            )
            .join('')}
        </div>

        <h3>Play stats</h3>
        <p class="parent-panel__stats">
          ${this.stats.funLabel()}<br />
          🐾 ${this.stats.totalTaps.toLocaleString()} total boops across ${this.stats.sessions.toLocaleString()} visits
        </p>

        ${
          this.callbacks.midiSupported()
            ? `<h3>Extras</h3>
               <button class="parent-panel__game" data-act="midi">🎹 Connect a piano keyboard (MIDI)</button>
               <p class="parent-panel__info">Gamepads work automatically — any button plays.</p>`
            : `<h3>Extras</h3>
               <p class="parent-panel__info">Gamepads work automatically — any button plays.</p>`
        }

        <h3>How the lock works</h3>
        <p class="parent-panel__info">
          Your child can play and switch games, but can't leave. To open this panel:
          <b>hold both top corners for 2½ seconds</b>, or type <b>parent</b> on a keyboard.
          On desktop, holding <b>Esc</b> for 2 seconds also exits fullscreen (browser rule).
          On iPhone/iPad, add Tiny Paws to the Home Screen and use Guided Access
          (triple-click the side button) for the strongest lock.
        </p>

        <button class="parent-panel__exit" data-act="exit">🔓 Exit &amp; unlock</button>
        <a class="parent-panel__link" href="https://github.com/feshalnaguji/tiny-finger-games"
           target="_blank" rel="noreferrer">Tiny Paws on GitHub</a>
      </div>
    `;

    this.el.querySelector('[data-act="resume"]')?.addEventListener('click', () => {
      this.callbacks.onResume();
    });

    for (const btn of this.el.querySelectorAll<HTMLButtonElement>('[data-setting]')) {
      btn.addEventListener('click', () => {
        const key = btn.dataset.setting as keyof SettingsSnapshot;
        this.settings.set(key, !this.settings.snapshot[key]);
        this.render();
      });
    }

    for (const btn of this.el.querySelectorAll<HTMLButtonElement>('[data-game]')) {
      btn.addEventListener('click', () => {
        const def = this.games.find((g) => g.meta.id === btn.dataset.game);
        if (def) this.callbacks.onSwitchGame(def);
      });
    }

    const midiBtn = this.el.querySelector<HTMLButtonElement>('[data-act="midi"]');
    midiBtn?.addEventListener('click', () => {
      midiBtn.disabled = true;
      midiBtn.textContent = '🎹 Connecting…';
      void this.callbacks.onConnectMidi().then((ok) => {
        midiBtn.textContent = ok
          ? '🎹 MIDI on — plug in and play!'
          : '🎹 Not allowed or unavailable';
      });
    });

    const exit = this.el.querySelector<HTMLButtonElement>('[data-act="exit"]');
    exit?.addEventListener('click', () => {
      if (!this.exitArmed) {
        this.exitArmed = true;
        exit.textContent = '⚠️ Tap again to really exit';
        return;
      }
      this.callbacks.onExit();
    });
  }

  private toggle(
    key: keyof SettingsSnapshot,
    label: string,
    s: Readonly<SettingsSnapshot>,
  ): string {
    const on = s[key];
    return `<button class="parent-panel__toggle ${on ? 'is-on' : ''}" data-setting="${key}">
      <span>${label}</span><span class="parent-panel__pill">${on ? 'ON' : 'OFF'}</span>
    </button>`;
  }
}
