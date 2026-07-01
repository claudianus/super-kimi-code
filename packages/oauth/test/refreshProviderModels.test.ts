import { afterEach, describe, expect, it, vi } from 'vitest';

import { refreshProviderModels, type ManagedKimiConfigShape } from '../src';

type FetchMock = (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) => Promise<Response>;

function fetchInputUrl(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function makeRefreshHost(initial: ManagedKimiConfigShape): {
  current: () => ManagedKimiConfigShape;
  removeProvider: ReturnType<typeof vi.fn<(providerId: string) => Promise<ManagedKimiConfigShape>>>;
  setConfig: ReturnType<
    typeof vi.fn<(patch: ManagedKimiConfigShape) => Promise<ManagedKimiConfigShape>>
  >;
} {
  let persisted = structuredClone(initial);
  const removeProvider = vi.fn(async (providerId: string) => {
    const providers = { ...persisted.providers };
    delete providers[providerId];
    const models = { ...persisted.models };
    for (const [alias, model] of Object.entries(models)) {
      if (model.provider === providerId) delete models[alias];
    }
    persisted = { ...persisted, providers, models };
    return structuredClone(persisted);
  });
  const setConfig = vi.fn(async (patch: ManagedKimiConfigShape) => {
    persisted = { ...persisted, ...patch };
    return structuredClone(persisted);
  });
  return {
    current: () => structuredClone(persisted),
    removeProvider,
    setConfig,
  };
}

describe('refreshProviderModels', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scopes custom-registry refreshes to one provider without adding siblings', async () => {
    const registryUrl = 'https://registry.example.test/v1/models/api.json';
    const apiKey = 'sk-test-token';
    const source = { kind: 'apiJson' as const, url: registryUrl, apiKey };
    const host = makeRefreshHost({
      providers: {
        a: {
          type: 'openai',
          baseUrl: 'https://a.example.test/v1',
          apiKey,
          source,
        },
      },
      models: {
        'a/m1': {
          provider: 'a',
          model: 'm1',
          maxContextSize: 131072,
          capabilities: ['tool_use'],
          displayName: 'm1',
        },
      },
    });
    const fetchMock = vi.fn<FetchMock>(async (input, init) => {
      expect(fetchInputUrl(input)).toBe(registryUrl);
      expect(new Headers(init?.headers).get('authorization')).toBe(`Bearer ${apiKey}`);
      return new Response(
        JSON.stringify({
          a: {
            id: 'a',
            name: 'Provider A',
            api: 'https://a.example.test/v1',
            type: 'openai',
            models: { m1: { id: 'm1' } },
          },
          b: {
            id: 'b',
            name: 'Provider B',
            api: 'https://b.example.test/v1',
            type: 'openai',
            models: { m1: { id: 'm1' } },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await refreshProviderModels(
      {
        getConfig: async () => host.current(),
        removeProvider: host.removeProvider,
        setConfig: host.setConfig,
        resolveOAuthToken: vi.fn(),
      },
      { providerId: 'a' },
    );

    expect(result).toEqual({ changed: [], unchanged: ['a'], failed: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(host.removeProvider).not.toHaveBeenCalled();
    expect(host.setConfig).not.toHaveBeenCalled();
    expect(host.current().providers['b']).toBeUndefined();
    expect(host.current().models?.['b/m1']).toBeUndefined();
  });
});
