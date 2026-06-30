import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { handlePlanCommand, handleThemeCommand } from '#/tui/commands/config';
import type { SlashCommandHost } from '#/tui/commands/dispatch';

function makeHost(options: { planMode?: boolean; planPath?: string | undefined } = {}) {
  const session = {
    clearPlan: vi.fn(async () => {}),
    getPlan: vi.fn(async () => (
      options.planPath === undefined ? null : { path: options.planPath }
    )),
    setPlanMode: vi.fn(async () => {}),
  };
  const host = {
    session,
    state: {
      appState: {
        planMode: options.planMode ?? false,
      },
    },
    setAppState: vi.fn((patch: Record<string, unknown>) => Object.assign(host.state.appState, patch)),
    showError: vi.fn(),
    showNotice: vi.fn(),
  } as unknown as SlashCommandHost;
  return { host, session };
}

function makeThemeHost() {
  const appState = {
    theme: 'auto',
    editorCommand: null,
    notifications: { enabled: true, condition: 'unfocused' },
    upgrade: { autoInstall: true },
  };
  const host = {
    state: {
      appState,
    },
    applyTheme: vi.fn(async (theme: string) => {
      appState.theme = theme;
    }),
    refreshTerminalThemeTracking: vi.fn(),
    showError: vi.fn(),
    showStatus: vi.fn(),
    track: vi.fn(),
  };
  return host as unknown as SlashCommandHost & typeof host;
}

async function withTempHome<T>(run: () => Promise<T>): Promise<T> {
  const originalHome = process.env['KIMI_CODE_HOME'];
  const home = await mkdtemp(join(tmpdir(), 'kimi-command-theme-'));
  process.env['KIMI_CODE_HOME'] = home;
  try {
    return await run();
  } finally {
    await rm(home, { recursive: true, force: true });
    if (originalHome === undefined) {
      delete process.env['KIMI_CODE_HOME'];
    } else {
      process.env['KIMI_CODE_HOME'] = originalHome;
    }
  }
}

describe('handlePlanCommand', () => {
  it('uses Ultrawork steering wording when enabling planning', async () => {
    const { host, session } = makeHost({ planPath: '/tmp/plans/test-plan.md' });

    await handlePlanCommand(host, 'on');

    expect(session.setPlanMode).toHaveBeenCalledWith(true, false);
    expect(host.showNotice).toHaveBeenCalledWith(
      'Ultrawork plan steering: ON',
      'Plan will be created here: /tmp/plans/test-plan.md',
    );
  });

  it('uses Ultrawork steering wording when disabling planning', async () => {
    const { host, session } = makeHost({ planMode: true });

    await handlePlanCommand(host, 'off');

    expect(session.setPlanMode).toHaveBeenCalledWith(false, false);
    expect(host.showNotice).toHaveBeenCalledWith('Ultrawork plan steering: OFF');
  });

  it('uses UltraPlan wording for the explicit ultra steering option', async () => {
    const { host, session } = makeHost();

    await handlePlanCommand(host, 'ultra');

    expect(session.setPlanMode).toHaveBeenCalledWith(true, true);
    expect(host.showNotice).toHaveBeenCalledWith('UltraPlan steering: ON', undefined);
  });
});

describe('handleThemeCommand', () => {
  it('applies bundled Super Kimi themes by name', async () => {
    await withTempHome(async () => {
      const host = makeThemeHost();

      await handleThemeCommand(host, 'super-kimi-neon-noir');

      expect(host.applyTheme).toHaveBeenCalledWith('super-kimi-neon-noir', undefined);
      expect(host.state.appState.theme).toBe('super-kimi-neon-noir');
      expect(host.track).toHaveBeenCalledWith('theme_switch', {
        theme: 'super-kimi-neon-noir',
      });
      expect(host.showStatus).toHaveBeenCalledWith('Theme set to "super-kimi-neon-noir".');
      expect(host.showError).not.toHaveBeenCalled();
    });
  });

  it('reports an error for unknown themes', async () => {
    await withTempHome(async () => {
      const host = makeThemeHost();

      await handleThemeCommand(host, 'does-not-exist');

      expect(host.showError).toHaveBeenCalledWith('Unknown theme: does-not-exist');
      expect(host.applyTheme).not.toHaveBeenCalled();
      expect(host.state.appState.theme).toBe('auto');
    });
  });
});
