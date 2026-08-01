export interface PointerInfo {
  id: number;
  x: number;
  y: number;
}

export interface KeyInfo {
  code: string;
  key: string;
  repeat: boolean;
}

type PointerFn = (p: PointerInfo) => void;
type KeyFn = (k: KeyInfo) => void;

/**
 * Unified pointer + keyboard input. Games subscribe through a scope that the app
 * disposes wholesale on game destroy, so games can never leak listeners.
 */
export class InputManager {
  private scopes = new Set<InputScope>();
  private aborter = new AbortController();

  constructor(root: HTMLElement) {
    const opts = { signal: this.aborter.signal };
    root.addEventListener(
      'pointerdown',
      (e) => {
        this.emitPointer('down', e);
      },
      opts,
    );
    root.addEventListener(
      'pointermove',
      (e) => {
        this.emitPointer('move', e);
      },
      opts,
    );
    root.addEventListener(
      'pointerup',
      (e) => {
        this.emitPointer('up', e);
      },
      opts,
    );
    root.addEventListener(
      'pointercancel',
      (e) => {
        this.emitPointer('up', e);
      },
      opts,
    );
    window.addEventListener(
      'keydown',
      (e) => {
        this.emitKey({ code: e.code, key: e.key, repeat: e.repeat });
      },
      opts,
    );
  }

  createScope(): InputScope {
    const scope = new InputScope(() => this.scopes.delete(scope));
    this.scopes.add(scope);
    return scope;
  }

  emitKey(k: KeyInfo): void {
    for (const s of this.scopes) s.dispatchKey(k);
  }

  dispose(): void {
    this.aborter.abort();
    this.scopes.clear();
  }

  private emitPointer(kind: 'down' | 'move' | 'up', e: PointerEvent): void {
    const p: PointerInfo = { id: e.pointerId, x: e.clientX, y: e.clientY };
    for (const s of this.scopes) s.dispatchPointer(kind, p);
  }
}

export class InputScope {
  /** The app disables the active game's scope while paused (parent panel, tab hidden). */
  enabled = true;

  private downFns: PointerFn[] = [];
  private moveFns: PointerFn[] = [];
  private upFns: PointerFn[] = [];
  private keyFns: KeyFn[] = [];

  constructor(private readonly detach: () => void) {}

  onDown(fn: PointerFn): void {
    this.downFns.push(fn);
  }

  onMove(fn: PointerFn): void {
    this.moveFns.push(fn);
  }

  onUp(fn: PointerFn): void {
    this.upFns.push(fn);
  }

  onKey(fn: KeyFn): void {
    this.keyFns.push(fn);
  }

  dispatchPointer(kind: 'down' | 'move' | 'up', p: PointerInfo): void {
    if (!this.enabled) return;
    const fns = kind === 'down' ? this.downFns : kind === 'move' ? this.moveFns : this.upFns;
    for (const fn of fns) fn(p);
  }

  dispatchKey(k: KeyInfo): void {
    if (!this.enabled) return;
    for (const fn of this.keyFns) fn(k);
  }

  dispose(): void {
    this.downFns = [];
    this.moveFns = [];
    this.upFns = [];
    this.keyFns = [];
    this.detach();
  }
}
