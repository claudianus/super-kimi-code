export interface CompactionResult {
  summary: string;
  compactedCount: number;
  tokensBefore: number;
  tokensAfter: number;
  algorithmVersion?: string;
  actions?: readonly CompactionResultAction[];
  rawRefs?: readonly CompactionResultRawRef[];
  summaryTokens?: number;
  retainedTokens?: number;
  compactedTokens?: number;
  qualityWarnings?: readonly string[];
}

export interface CompactionResultAction {
  readonly type: string;
  readonly reason: string;
  readonly messageStart: number;
  readonly messageEnd: number;
  readonly tokensBefore?: number;
  readonly tokensAfter?: number;
  readonly toolCallIds?: readonly string[];
  readonly toolNames?: readonly string[];
}

export interface CompactionResultRawRef {
  readonly kind: string;
  readonly messageStart: number;
  readonly messageEnd: number;
  readonly tokens: number;
  readonly toolCallIds?: readonly string[];
  readonly toolNames?: readonly string[];
}

export type CompactionSource = 'manual' | 'auto';

export interface CompactionBeginData {
  instruction?: string;
  source: CompactionSource;
}
