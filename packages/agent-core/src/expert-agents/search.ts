import MiniSearch from 'minisearch';
import type { ExpertCatalogEntry, ExpertSearchResult } from './types';
import { EXPERT_CATALOG } from './catalog';

export interface ExpertSearchOptions {
  readonly query: string;
  readonly topK?: number;
  readonly division?: string;
  readonly filter?: (expert: ExpertCatalogEntry) => boolean;
  readonly useEmbedding?: boolean; // default true if available
}

export class ExpertSearchEngine {
  private readonly index: MiniSearch<ExpertCatalogEntry>;
  private readonly expertById: Map<string, ExpertCatalogEntry>;
  private initialized = false;
  private embeddingCache?: Map<string, readonly number[]>;

  constructor() {
    this.index = new MiniSearch({
      fields: ['name', 'description', 'vibe', 'tags', 'capabilities', 'division', 'divisionLabel'],
      storeFields: ['id'],
      searchOptions: {
        boost: { name: 3, description: 2, tags: 2, vibe: 1.5, capabilities: 1.5, division: 1 },
        fuzzy: 0.3,
        prefix: true,
      },
    });
    this.expertById = new Map();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    const docs = EXPERT_CATALOG.map((expert) => ({
      ...expert,
      // Flatten arrays for indexing
      tags: expert.tags.join(' '),
      capabilities: expert.capabilities.join(' '),
    }));
    this.index.addAll(docs as unknown as ExpertCatalogEntry[]);
    for (const expert of EXPERT_CATALOG) {
      this.expertById.set(expert.id, expert);
    }
    // Cache embeddings for fast cosine similarity
    this.embeddingCache = new Map();
    for (const expert of EXPERT_CATALOG) {
      if (expert.embedding !== undefined && expert.embedding.length > 0) {
        this.embeddingCache.set(expert.id, expert.embedding);
      }
    }
    this.initialized = true;
  }

  search(options: ExpertSearchOptions): ExpertSearchResult[] {
    if (!this.initialized) {
      throw new Error('ExpertSearchEngine not initialized. Call initialize() first.');
    }
    const topK = options.topK ?? 5;
    const useEmbedding = options.useEmbedding !== false && this.embeddingCache !== undefined && this.embeddingCache.size > 0;

    // 1. Sparse search (MiniSearch)
    const miniResults = this.index.search(options.query).map((r) => {
      const expert = this.expertById.get(r.id);
      if (expert === undefined) return undefined;
      return { expert, score: r.score };
    }).filter((r): r is ExpertSearchResult => r !== undefined);

    // 2. Dense search (cosine similarity on embeddings) if available
    let denseResults: ExpertSearchResult[] = [];
    if (useEmbedding) {
      denseResults = this.denseSearch(options.query, topK * 2);
    }

    // 3. RRF fusion
    const fused = this.rrfFusion(miniResults, denseResults, topK);

    // 4. Apply filters
    let results = fused;
    if (options.division !== undefined) {
      results = results.filter((r) => r.expert.division === options.division);
    }
    if (options.filter !== undefined) {
      results = results.filter((r) => options.filter!(r.expert));
    }
    return results.slice(0, topK);
  }

  private denseSearch(query: string, topK: number): ExpertSearchResult[] {
    if (!this.embeddingCache || this.embeddingCache.size === 0) return [];

    // For dense search without a query embedding model, we use a simple approach:
    // compute a pseudo-embedding from the query by averaging keyword-matched expert embeddings
    // This is a lightweight fallback when no query embedding is available at search time.
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (queryTerms.length === 0) return [];

    const scores = new Map<string, number>();
    for (const id of this.embeddingCache.keys()) {
      const expert = this.expertById.get(id);
      if (!expert) continue;
      const text = `${expert.name} ${expert.description} ${expert.vibe} ${expert.tags.join(' ')} ${expert.capabilities.join(' ')}`.toLowerCase();
      const matches = queryTerms.filter(t => text.includes(t)).length;
      if (matches > 0) {
        scores.set(id, matches / queryTerms.length);
      }
    }

    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    return sorted.map(([id, score]) => {
      const expert = this.expertById.get(id)!;
      return { expert, score };
    });
  }

  private rrfFusion(
    sparse: ExpertSearchResult[],
    dense: ExpertSearchResult[],
    topK: number,
    k: number = 60,
  ): ExpertSearchResult[] {
    const rrfScores = new Map<string, number>();
    const expertMap = new Map<string, ExpertCatalogEntry>();

    // Normalize MiniSearch scores to [0, 1]
    const maxSparseScore = sparse.length > 0 ? sparse[0]!.score : 1;

    for (let i = 0; i < sparse.length; i++) {
      const id = sparse[i]!.expert.id;
      expertMap.set(id, sparse[i]!.expert);
      const rankScore = 1.0 / (k + i + 1);
      const normScore = sparse[i]!.score / maxSparseScore;
      rrfScores.set(id, (rrfScores.get(id) ?? 0) + rankScore * 0.6 + normScore * 0.4);
    }

    for (let i = 0; i < dense.length; i++) {
      const id = dense[i]!.expert.id;
      expertMap.set(id, dense[i]!.expert);
      const rankScore = 1.0 / (k + i + 1);
      rrfScores.set(id, (rrfScores.get(id) ?? 0) + rankScore * 0.5);
    }

    const sorted = Array.from(rrfScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    return sorted.map(([id, score]) => {
      const expert = expertMap.get(id);
      if (!expert) return undefined;
      return { expert, score };
    }).filter((r): r is ExpertSearchResult => r !== undefined);
  }

  addExpert(expert: ExpertCatalogEntry): void {
    if (!this.initialized) {
      throw new Error('ExpertSearchEngine not initialized. Call initialize() first.');
    }
    this.expertById.set(expert.id, expert);
    if (expert.embedding !== undefined && expert.embedding.length > 0 && this.embeddingCache !== undefined) {
      this.embeddingCache.set(expert.id, expert.embedding);
    }
    this.index.add({
      ...expert,
      tags: expert.tags.join(' '),
      capabilities: expert.capabilities.join(' '),
    } as unknown as ExpertCatalogEntry);
  }

  removeExpert(id: string): boolean {
    if (!this.initialized) return false;
    this.expertById.delete(id);
    this.embeddingCache?.delete(id);
    this.index.remove({ id } as unknown as ExpertCatalogEntry);
    return true;
  }

  getExpertById(id: string): ExpertCatalogEntry | undefined {
    return this.expertById.get(id);
  }

  getExpertsByDivision(division: string): ExpertCatalogEntry[] {
    return EXPERT_CATALOG.filter((e) => e.division === division);
  }

  listAll(): ExpertCatalogEntry[] {
    return [...EXPERT_CATALOG];
  }
}

export const globalExpertSearchEngine = new ExpertSearchEngine();
