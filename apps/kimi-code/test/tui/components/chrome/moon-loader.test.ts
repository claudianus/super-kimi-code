import type { TUI } from '@earendil-works/pi-tui';
import { describe, expect, it, vi } from 'vitest';

import { MoonLoader } from '#/tui/components/chrome/moon-loader';

function strip(text: string): string {
  return text.replaceAll(/\u001B\[[0-9;]*m/g, '');
}

describe('MoonLoader', () => {
  it('shows elapsed time next to a labeled spinner', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T00:00:00Z'));
    const loader = new MoonLoader({ requestRender: vi.fn() } as unknown as TUI, 'braille', undefined, 'working...');

    expect(strip(loader.renderInline())).toContain('working... 0s');

    vi.advanceTimersByTime(1_100);
    expect(strip(loader.renderInline())).toContain('working... 1s');

    loader.stop();
    vi.useRealTimers();
  });

  it('shows elapsed time when the spinner has no label', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T00:00:00Z'));
    const loader = new MoonLoader({ requestRender: vi.fn() } as unknown as TUI);

    expect(strip(loader.renderInline())).toContain('0s');

    vi.advanceTimersByTime(61_000);
    loader.setAvailableWidth(80);
    expect(strip(loader.renderInline())).toContain('1m01s');

    loader.stop();
    vi.useRealTimers();
  });
});
