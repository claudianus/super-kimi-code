import { createDecorator } from '../../di';
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

export interface IMemoryService {
  readonly _serviceBrand: undefined;
  search(request: MemorySearchRequest): Promise<readonly MemorySearchResult[]>;
  list(request?: MemoryListRequest): Promise<readonly MemoryRecord[]>;
  get(id: string): Promise<MemoryRecord | undefined>;
  create(input: MemoryCreateInput): Promise<MemoryRecord>;
  update(id: string, patch: MemoryUpdateInput): Promise<MemoryRecord>;
  forget(id: string): Promise<boolean>;
  stats(): Promise<MemoryStats>;
  exportMemories(request?: MemoryListRequest): Promise<MemoryExportResult>;
  importMemories(records: readonly MemoryRecord[]): Promise<MemoryImportResult>;
  consolidate(): Promise<MemoryConsolidateResult>;
}

export const IMemoryService = createDecorator<IMemoryService>('memoryService');

void IMemoryService;
