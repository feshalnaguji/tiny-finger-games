/**
 * A DPR-scaled canvas that fills its host and tracks resizes. Games draw in CSS
 * pixel coordinates; the device-pixel transform is handled here.
 */
export class CanvasLayer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  dpr = 1;
  onResize: ((w: number, h: number, dpr: number) => void) | null = null;

  private observer: ResizeObserver;

  constructor(private host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.appendChild(this.canvas);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2d canvas unsupported');
    this.ctx = ctx;
    this.observer = new ResizeObserver(() => {
      this.sync();
    });
    this.observer.observe(host);
    this.sync();
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  dispose(): void {
    this.observer.disconnect();
    this.canvas.remove();
  }

  private sync(): void {
    const rect = this.host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (rect.width === this.width && rect.height === this.height && dpr === this.dpr) return;
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.onResize?.(this.width, this.height, dpr);
  }
}
