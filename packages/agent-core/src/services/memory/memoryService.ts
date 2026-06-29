import { Disposable, InstantiationType, registerSingleton } from '../../di';
import type {
  MemoryConsolidateResult,
  MemoryCreateInput,
  MemoryExportResult,
  MemoryImportResult,
  MemoryListRequest,
  MemoryRecord,
  MemorySearchRequest,
  MemorySearchResult,
  MemoryStats,
  MemoryUpdateInput,
} from '../../memory';
import { ICoreProcessService } from '../coreProcess/coreProcess';
import { IMemoryService } from './memory';

export class MemoryService extends Disposable implements IMemoryService {
  readonly _serviceBrand: undefined;

  constructor(@ICoreProcessService private readonly core: ICoreProcessService) {
    super();
  }

  search(request: MemorySearchRequest): Promise<readonly MemorySearchResult[]> {
    return this.core.rpc.memorySearch(request);
  }

  list(request: MemoryListRequest = {}): Promise<readonly MemoryRecord[]> {
    return this.core.rpc.memoryList(request);
  }

  get(id: string): Promise<MemoryRecord | undefined> {
    return this.core.rpc.memoryGet({ id });
  }

  create(input: MemoryCreateInput): Promise<MemoryRecord> {
    return this.core.rpc.memoryCreate(input);
  }

  update(id: string, patch: MemoryUpdateInput): Promise<MemoryRecord> {
    return this.core.rpc.memoryUpdate({ id, patch });
  }

  forget(id: string): Promise<boolean> {
    return this.core.rpc.memoryForget({ id });
  }

  stats(): Promise<MemoryStats> {
    return this.core.rpc.memoryStats({});
  }

  exportMemories(request: MemoryListRequest = {}): Promise<MemoryExportResult> {
    return this.core.rpc.memoryExport(request);
  }

  importMemories(records: readonly MemoryRecord[]): Promise<MemoryImportResult> {
    return this.core.rpc.memoryImport({ records });
  }

  consolidate(): Promise<MemoryConsolidateResult> {
    return this.core.rpc.memoryConsolidate({});
  }
}

registerSingleton(IMemoryService, MemoryService, InstantiationType.Delayed);
