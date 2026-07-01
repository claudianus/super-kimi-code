import { extractText, type Message } from '@moonshot-ai/kosong';

import type { CompactionPlan } from './planner';
import { parseStructuredCompactionMemory } from './memory';

export interface CompactionQualityResult {
  readonly critical: readonly string[];
  readonly warnings: readonly string[];
}

const V2_REQUIRED_LABELS = [
  'current_goal',
  'last_known_state',
  'decisions',
  'files_touched',
  'failed_attempts',
  'open_questions',
  'next_actions',
  'raw_refs',
] as const;

export function validateInitialCompactionSummary(
  summary: string,
  plan: CompactionPlan,
  compactedMessages: readonly Message[],
): CompactionQualityResult {
  const critical: string[] = [];
  const warnings: string[] = [];
  const trimmed = summary.trim();

  if (trimmed.length === 0) {
    critical.push('summary is empty');
    return { critical, warnings };
  }

  const exactV2Attempt = hasExactV2Attempt(trimmed);
  if (exactV2Attempt) {
    const memory = parseStructuredCompactionMemory(trimmed);
    if (memory.currentGoal === undefined || memory.currentGoal.trim().length === 0) {
      critical.push('v2 summary is missing current_goal');
    }
    if (memory.nextActions.length === 0) {
      critical.push('v2 summary is missing next_actions');
    }
    if (plan.rawRefs.length > 0 && memory.rawRefs.length === 0) {
      critical.push('v2 summary is missing raw_refs');
    }
  }

  const latestUserRequest = latestUserText(compactedMessages);
  if (
    exactV2Attempt &&
    latestUserRequest !== undefined &&
    latestUserRequest.length >= 24 &&
    !sharesMeaningfulToken(trimmed, latestUserRequest)
  ) {
    warnings.push('summary may not mention the latest compacted user request');
  }

  if (containsRiskyBarePath(trimmed)) {
    warnings.push('summary contains a path-like reference outside code formatting');
  }

  return {
    critical: uniqueList(critical),
    warnings: uniqueList(warnings),
  };
}

export function validateRenderedCompactionSummary(
  summary: string,
  plan: CompactionPlan,
): CompactionQualityResult {
  const critical: string[] = [];
  const warnings: string[] = [];

  if (!summary.includes('# Super Kimi Context Compaction v2 Memory')) {
    critical.push('rendered summary is missing the v2 memory header');
  }

  for (const label of V2_REQUIRED_LABELS) {
    if (!summary.includes(`${label}:`)) {
      critical.push(`rendered summary is missing ${label}`);
    }
  }

  const memory = parseStructuredCompactionMemory(summary);
  if (plan.rawRefs.length > 0 && memory.rawRefs.length === 0) {
    critical.push('rendered summary is missing raw_refs entries');
  }

  return {
    critical: uniqueList(critical),
    warnings: uniqueList(warnings),
  };
}

export function mergeCompactionQualityResults(
  ...results: readonly CompactionQualityResult[]
): CompactionQualityResult {
  return {
    critical: uniqueList(results.flatMap((result) => result.critical)),
    warnings: uniqueList(results.flatMap((result) => result.warnings)),
  };
}

function hasExactV2Attempt(summary: string): boolean {
  return V2_REQUIRED_LABELS.some((label) =>
    new RegExp(`(^|\\n)\\s*(?:#{1,6}\\s*)?${label}\\s*:`, 'i').test(summary)
  );
}

function latestUserText(messages: readonly Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== 'user') continue;
    const text = extractText(message, ' ').replaceAll(/\s+/g, ' ').trim();
    if (text.length > 0) return text;
  }
  return undefined;
}

function sharesMeaningfulToken(summary: string, source: string): boolean {
  const summaryLower = summary.toLowerCase();
  for (const token of source.toLowerCase().match(/[a-z0-9_./-]{4,}/g) ?? []) {
    if (token.length < 4) continue;
    if (summaryLower.includes(token)) return true;
  }
  return false;
}

function containsRiskyBarePath(summary: string): boolean {
  const withoutInlineCode = summary.replaceAll(/`[^`]*`/g, '');
  return /(?:^|\s)(?:\.{1,2}\/|\/|[A-Za-z]:\\)[^\s]+\.(?:ts|js|tsx|jsx|py|rs|go|java|kt|swift|md|json|ya?ml|toml|html|css|scss|sql)(?:\s|$)/i.test(
    withoutInlineCode,
  );
}

function uniqueList(items: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (normalized.length === 0) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}
