import { Disposable, InstantiationType, registerSingleton } from '../../di';
import type { KimiConfig, ProviderConfig } from '../../config';
import type {
  ModelCatalogItem,
  ProviderCatalogItem,
  RefreshOAuthProviderModelsResponse,
  SetDefaultModelResponse,
} from '@moonshot-ai/protocol';
import {
  refreshProviderModels,
  type ManagedKimiOAuthRef,
  type RefreshProviderHost,
  type RefreshResult,
} from '@moonshot-ai/kimi-code-oauth';

import { createManagedAuthFacade, type ServicesAuthFacade } from '../auth/managedAuth';
import { ICoreProcessService } from '../coreProcess/coreProcess';
import { IEnvironmentService } from '../environment/environment';
import {
  IModelCatalogService,
  ModelNotFoundError,
  ProviderNotFoundError,
  toProtocolModel,
  toProtocolProvider,
} from './modelCatalog';

export class ModelCatalogService
  extends Disposable
  implements IModelCatalogService {
  readonly _serviceBrand: undefined;

  private _authFacade: ServicesAuthFacade;

  constructor(
    @IEnvironmentService env: IEnvironmentService,
    @ICoreProcessService private readonly core: ICoreProcessService,
  ) {
    super();
    this._authFacade = createManagedAuthFacade(env);
  }

  static _createForTest(
    env: IEnvironmentService,
    core: ICoreProcessService,
    authFacade: ServicesAuthFacade,
  ): ModelCatalogService {
    const service = new ModelCatalogService(env, core);
    service._authFacade = authFacade;
    return service;
  }

  async listModels(): Promise<readonly ModelCatalogItem[]> {
    const config = await this._readConfig();
    return Object.entries(config.models ?? {}).map(([modelId, alias]) =>
      toProtocolModel(modelId, alias),
    );
  }

  async listProviders(): Promise<readonly ProviderCatalogItem[]> {
    const config = await this._readConfig();
    const out: ProviderCatalogItem[] = [];
    for (const [providerId, provider] of Object.entries(config.providers ?? {})) {
      out.push(await this._provider(config, providerId, provider));
    }
    return out;
  }

  async getProvider(providerId: string): Promise<ProviderCatalogItem> {
    const config = await this._readConfig();
    const provider = config.providers?.[providerId];
    if (provider === undefined) {
      throw new ProviderNotFoundError(providerId);
    }
    return this._provider(config, providerId, provider);
  }

  async setDefaultModel(modelId: string): Promise<SetDefaultModelResponse> {
    const config = await this._readConfig();
    const alias = config.models?.[modelId];
    if (alias === undefined) {
      throw new ModelNotFoundError(modelId);
    }

    const updated = await this.core.rpc.setKimiConfig({ defaultModel: modelId });
    const updatedAlias = updated.models?.[modelId] ?? alias;
    return {
      default_model: modelId,
      model: toProtocolModel(modelId, updatedAlias),
    };
  }

  async refreshOAuthProviderModels(): Promise<RefreshOAuthProviderModelsResponse> {
    return mapRefreshResult(
      await refreshProviderModels(this._buildRefreshHost(), { scope: 'oauth' }),
    );
  }

  private _buildRefreshHost(): RefreshProviderHost {
    return {
      getConfig: () => this._readConfig(),
      removeProvider: (providerId) => this.core.rpc.removeKimiProvider({ providerId }),
      setConfig: (patch) => this.core.rpc.setKimiConfig(patch as Record<string, unknown>),
      resolveOAuthToken: (providerName, oauthRef) =>
        this._resolveOAuthToken(providerName, oauthRef),
    };
  }

  private async _resolveOAuthToken(
    providerName: string,
    oauthRef?: ManagedKimiOAuthRef,
  ): Promise<string> {
    const tokenProvider = this._authFacade.resolveOAuthTokenProvider(providerName, oauthRef);
    if (tokenProvider === undefined) {
      throw new Error('OAuth token provider is not configured.');
    }
    return tokenProvider.getAccessToken();
  }

  private async _readConfig(): Promise<KimiConfig> {
    return this.core.rpc.getKimiConfig({ reload: true });
  }

  private async _provider(
    config: KimiConfig,
    providerId: string,
    provider: ProviderConfig,
  ): Promise<ProviderCatalogItem> {
    const hasApiKey = hasConfiguredApiKey(provider);
    const hasOAuthToken = await this._hasCachedToken(providerId, provider);
    return toProtocolProvider(providerId, provider, config, {
      hasApiKey,
      hasOAuthToken,
    });
  }

  private async _hasCachedToken(
    providerId: string,
    provider: ProviderConfig,
  ): Promise<boolean> {
    if (provider.oauth === undefined) return false;
    try {
      const token = await this._authFacade.getCachedAccessToken(
        providerId,
        provider.oauth,
      );
      return nonEmpty(token) !== undefined;
    } catch {
      return false;
    }
  }
}

function mapRefreshResult(result: RefreshResult): RefreshOAuthProviderModelsResponse {
  return {
    changed: result.changed.map((change) => ({
      provider_id: change.providerId,
      provider_name: change.providerName,
      added: change.added,
      removed: change.removed,
    })),
    unchanged: [...result.unchanged],
    failed: result.failed.map((failure) => ({
      provider: failure.provider,
      reason: failure.reason,
    })),
  };
}

function hasConfiguredApiKey(provider: ProviderConfig): boolean {
  if (nonEmpty(provider.apiKey) !== undefined) return true;
  switch (provider.type) {
    case 'anthropic':
      return nonEmpty(provider.env?.['ANTHROPIC_API_KEY']) !== undefined;
    case 'openai':
    case 'openai_responses':
      return nonEmpty(provider.env?.['OPENAI_API_KEY']) !== undefined;
    case 'kimi':
      return nonEmpty(provider.env?.['KIMI_API_KEY']) !== undefined;
    case 'google-genai':
      return nonEmpty(provider.env?.['GOOGLE_API_KEY']) !== undefined;
    case 'vertexai':
      return (
        nonEmpty(provider.env?.['VERTEXAI_API_KEY']) !== undefined ||
        nonEmpty(provider.env?.['GOOGLE_API_KEY']) !== undefined
      );
  }
  return false;
}

function nonEmpty(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

registerSingleton(IModelCatalogService, ModelCatalogService, InstantiationType.Delayed);
