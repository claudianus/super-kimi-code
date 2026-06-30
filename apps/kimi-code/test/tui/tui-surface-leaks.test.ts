import { describe, expect, it } from 'vitest';

import { defaultUserSurfaceLeakFailures } from '../../../../scripts/tui-surface-leaks.mjs';

describe('TUI surface leak checks', () => {
  it('allows Ultrawork brand copy while still blocking manual slash commands', () => {
    const brandCopy = 'Describe task; Ultrawork links UltraPlan, Goal, UltraSwarm, Verify.';

    expect(defaultUserSurfaceLeakFailures('help', brandCopy)).toEqual([]);
    expect(defaultUserSurfaceLeakFailures('status', brandCopy)).toEqual([]);
    expect(defaultUserSurfaceLeakFailures('status', 'auto ultrawork-ready')).toEqual([]);

    expect(defaultUserSurfaceLeakFailures('help', 'Run /ultrawork to start.')).toContain(
      'default help capture exposes Ultrawork manual command',
    );
    expect(defaultUserSurfaceLeakFailures('autocomplete', '/ultraswarm')).toContain(
      'default autocomplete capture exposes Ultraswarm manual command',
    );
  });
});
