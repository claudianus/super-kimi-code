export interface AnimationSchedulerOptions {
  readonly fps: number;
  readonly requestRender: () => void;
  readonly enabled: boolean;
}

export class AnimationScheduler {
  private timer: ReturnType<typeof setInterval> | undefined;
  private fps: number;
  private enabled: boolean;
  private readonly requestRender: () => void;

  constructor(options: AnimationSchedulerOptions) {
    this.fps = clampFps(options.fps);
    this.enabled = options.enabled;
    this.requestRender = options.requestRender;
    this.syncTimer();
  }

  update(options: { readonly fps?: number; readonly enabled?: boolean }): void {
    const nextFps = options.fps === undefined ? this.fps : clampFps(options.fps);
    const nextEnabled = options.enabled ?? this.enabled;
    if (nextFps === this.fps && nextEnabled === this.enabled) return;
    this.fps = nextFps;
    this.enabled = nextEnabled;
    this.syncTimer();
  }

  dispose(): void {
    if (this.timer === undefined) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private syncTimer(): void {
    this.dispose();
    if (!this.enabled) return;
    const intervalMs = Math.max(33, Math.round(1000 / this.fps));
    this.timer = setInterval(() => {
      this.requestRender();
    }, intervalMs);
  }
}

function clampFps(fps: number): number {
  if (!Number.isFinite(fps)) return 12;
  return Math.min(30, Math.max(1, Math.trunc(fps)));
}
