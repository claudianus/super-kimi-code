import type { ContentPart } from '@moonshot-ai/kosong';

import type { Agent } from '..';
import type { ContextMessage } from '../context';
import {
  estimateTokensForContentParts,
  estimateTokensForMessages,
} from '../../utils/tokens';

export interface MicroCompactionConfig {
  keepRecentMessages: number;
  minContentTokens: number;
  cacheMissedThresholdMs: number;
  truncatedMarker: string;
  minContextUsageRatio: number;
}

const DEFAULT_CONFIG: MicroCompactionConfig = {
  keepRecentMessages: 20,
  minContentTokens: 100,
  cacheMissedThresholdMs: 60 * 60 * 1000,
  truncatedMarker: '[Old tool result content cleared]',
  minContextUsageRatio: 0.5,
};

export class MicroCompaction {
  private cutoff = 0;
  readonly config: MicroCompactionConfig;

  constructor(
    public readonly agent: Agent,
    config?: Partial<MicroCompactionConfig>,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  reset(maxCutoff = 0): void {
    this.cutoff = Math.min(this.cutoff, maxCutoff);
  }

  apply(cutoff: number): void {
    this.agent.records.logRecord({
      type: 'micro_compaction.apply',
      cutoff,
    });
    this.cutoff = cutoff;
  }

  detect(): void {
    if (!this.agent.experimentalFlags.enabled('micro_compaction')) return;

    const config = this.config;
    const { history, lastAssistantAt } = this.agent.context;
    const cacheAgeMs = lastAssistantAt === null ? null : Date.now() - lastAssistantAt;
    const cacheMissed = cacheAgeMs !== null && cacheAgeMs >= config.cacheMissedThresholdMs;
    if (!cacheMissed) return;

    const maxContextTokens = this.agent.config.modelCapabilities.max_context_tokens;
    const contextTokens = this.agent.context.tokenCountWithPending;
    const contextUsageRatio =
      maxContextTokens !== undefined && maxContextTokens > 0
        ? contextTokens / maxContextTokens
        : 1;
    if (contextUsageRatio < config.minContextUsageRatio) return;

    const previousCutoff = this.cutoff;
    const nextCutoff = Math.max(0, history.length - config.keepRecentMessages);
    this.apply(nextCutoff);
    if (previousCutoff !== nextCutoff) {
      const effect = this.measureEffect(history, nextCutoff);
      const previousEffect = this.measureEffect(history, previousCutoff);
      const rawContextTokens = estimateTokensForMessages(history);
      // Whole-context length before/after this cutoff change, mirroring the
      // `tokensBefore`/`tokensAfter` fields on `compaction_finished` so the
      // two compaction paths can be compared on the same axis.
      const tokensBefore =
        rawContextTokens -
        previousEffect.truncatedToolResultTokensBefore +
        previousEffect.truncatedToolResultTokensAfter;
      const tokensAfter =
        rawContextTokens -
        effect.truncatedToolResultTokensBefore +
        effect.truncatedToolResultTokensAfter;
      this.agent.telemetry.track('micro_compaction_finished', {
        ...config,
        ...effect,
        tokensBefore,
        tokensAfter,
        previous_cutoff: previousCutoff,
        cutoff: nextCutoff,
        message_count: history.length,
        cache_age_ms: cacheAgeMs,
        thinkingLevel: this.agent.config.thinkingLevel,
      });
    }
  }

  compact(messages: readonly ContextMessage[]): readonly ContextMessage[] {
    if (!this.agent.experimentalFlags.enabled('micro_compaction')) return messages;

    const result: ContextMessage[] = [];
    let i = 0;
    for (const msg of messages) {
      if (
        i < this.cutoff &&
        msg.role === 'tool' &&
        msg.toolCallId !== undefined &&
        this.shouldClearToolResult(msg, messages)
      ) {
        result.push({
          ...msg,
          content: [
            {
              type: 'text',
              text: this.markerFor(msg, messages),
            } satisfies ContentPart,
          ],
        });
      } else {
        result.push(msg);
      }
      i++;
    }
    return result;
  }

  private measureEffect(
    messages: readonly ContextMessage[],
    cutoff: number,
  ) {
    let truncatedToolResultCount = 0;
    let truncatedToolResultTokensBefore = 0;
    let truncatedToolResultTokensAfter = 0;
    for (let i = 0; i < messages.length && i < cutoff; i++) {
      const message = messages[i];
      if (message?.role !== 'tool' || message.toolCallId === undefined) continue;

      const contentTokens = estimateTokensForContentParts(message.content);
      if (contentTokens < this.config.minContentTokens) continue;

      const markerTokenCount = this.markerTokenCount(message, messages);
      if (markerTokenCount >= contentTokens) continue;
      truncatedToolResultCount += 1;
      truncatedToolResultTokensBefore += contentTokens;
      truncatedToolResultTokensAfter += markerTokenCount;
    }
    return {
      truncatedToolResultCount,
      truncatedToolResultTokensBefore,
      truncatedToolResultTokensAfter,
    };
  }

  private markerFor(
    message: ContextMessage,
    messages: readonly ContextMessage[],
  ): string {
    const toolCallId = message.toolCallId ?? 'unknown';
    const toolName = this.toolNameFor(toolCallId, messages) ?? 'unknown';
    const tokenCount = estimateTokensForContentParts(message.content);
    const preview = truncateForMarker(contentPreview(message.content), 80);
    return [
      this.config.truncatedMarker,
      `toolCallId=${toolCallId}`,
      `toolName=${toolName}`,
      `tokensBeforeClearing=${String(tokenCount)}`,
      `isError=${message.isError === true ? 'true' : 'false'}`,
      'rawResult=replay',
      `preview=${preview}`,
    ].join('\n');
  }

  private shouldClearToolResult(
    message: ContextMessage,
    messages: readonly ContextMessage[],
  ): boolean {
    const contentTokens = estimateTokensForContentParts(message.content);
    return (
      contentTokens >= this.config.minContentTokens &&
      this.markerTokenCount(message, messages) < contentTokens
    );
  }

  private markerTokenCount(
    message: ContextMessage,
    messages: readonly ContextMessage[],
  ): number {
    return estimateTokensForContentParts([
      { type: 'text', text: this.markerFor(message, messages) },
    ]);
  }

  private toolNameFor(
    toolCallId: string,
    messages: readonly ContextMessage[],
  ): string | undefined {
    for (let i = messages.length - 1; i >= 0; i--) {
      const match = messages[i]?.toolCalls.find((toolCall) => toolCall.id === toolCallId);
      if (match !== undefined) return match.name;
    }
    return undefined;
  }
}

function contentPreview(parts: readonly ContentPart[]): string {
  return parts.map(contentPartPreview).join('\n').trim();
}

function contentPartPreview(part: ContentPart): string {
  if (part.type === 'text') return part.text;
  return `[${part.type}]`;
}

function truncateForMarker(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
