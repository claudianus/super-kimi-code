import { z } from 'zod';

import type { SwarmMode } from '../../../agent/swarm';
import type { BuiltinTool } from '../../../agent/tool';
import {
  DEFAULT_SUBAGENT_TIMEOUT_MS,
  type QueuedSubagentTask,
  type SessionSubagentHost,
} from '../../../session/subagent-host';
import { ToolAccesses } from '../../../loop/tool-access';
import type { ExecutableToolContext, ExecutableToolResult, ToolExecution } from '../../../loop/types';
import ULTRA_SWARM_DESCRIPTION from './ultra-swarm.md?raw';
import { toInputJsonSchema } from '../../support/input-schema';
import { globalUltraSwarmOrchestrator } from '../../../expert-agents/orchestrator';
import type { ExpertAssignment } from '../../../expert-agents/types';

const MAX_ULTRA_SWARM_SUBAGENTS = 16;

export const UltraSwarmToolInputSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1)
      .describe('Task description for the UltraSwarm. Be specific about what you need.'),
    experts: z
      .array(z.string().trim().min(1))
      .max(MAX_ULTRA_SWARM_SUBAGENTS)
      .optional()
      .describe(
        'Optional list of expert IDs to summon. If omitted, the system will auto-select the best experts for the task.',
      ),
    auto_select: z
      .boolean()
      .optional()
      .describe(
        'When true (default), the system automatically selects experts based on the task description. Set to false to require explicit expert IDs.',
      ),
    subagent_type: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('Base subagent type for all spawned experts. Defaults to "coder" when omitted.'),
    run_in_background: z
      .boolean()
      .optional()
      .describe(
        'If true, return immediately without waiting for completion. Prefer false unless the task can run independently.',
      ),
  })
  .strict();

export type UltraSwarmToolInput = z.infer<typeof UltraSwarmToolInputSchema>;

interface UltraSwarmSpec {
  readonly index: number;
  readonly expertId: string;
  readonly expertName: string;
  readonly prompt: string;
  readonly emoji: string;
  readonly color: string;
}

interface UltraSwarmRunResult {
  readonly spec: UltraSwarmSpec;
  readonly agentId?: string;
  readonly status: 'completed' | 'failed' | 'aborted';
  readonly state?: 'started' | 'not_started';
  readonly result?: string;
  readonly error?: string;
}

export class UltraSwarmTool implements BuiltinTool<UltraSwarmToolInput> {
  readonly name = 'UltraSwarm' as const;
  readonly description = ULTRA_SWARM_DESCRIPTION + `

 — Summon a team of expert agents to tackle complex tasks collaboratively.

This tool automatically assembles and orchestrates a swarm of specialized expert agents based on your task description. Each expert is selected from a catalog of 217+ professionals across 16 domains (Engineering, Design, Security, Product, Marketing, etc.) and given their specific persona to ensure high-quality, domain-specific output.

## How it works
1. Analyze your task description to identify required expertise domains
2. Search the expert catalog using BM25+fuzzy text search to find the best matches
3. Spawn each expert as a subagent with their full persona injected
4. Execute all experts in parallel (or sequential if dependencies exist)
5. Collect and synthesize results

## Usage tips
- Be specific in your description for better expert matching
- You can explicitly request experts by ID, or let the system auto-select
- Each expert receives their full persona + your task description
- Results are tagged with expert name and emoji for easy identification

## Available divisions
Engineering, Design, Security, Product, Marketing, Testing, Academic, Finance, Game Development, GIS, Paid Media, Project Management, Sales, Spatial Computing, Specialized, Support`;

  readonly parameters: Record<string, unknown> = toInputJsonSchema(UltraSwarmToolInputSchema);

  constructor(
    private readonly subagentHost: SessionSubagentHost,
    private readonly swarmMode: SwarmMode,
  ) {}

  resolveExecution(args: UltraSwarmToolInput): ToolExecution {
    const expertCount = args.experts?.length ?? 'auto';
    return {
      accesses: ToolAccesses.all(),
      description: `UltraSwarm: ${args.description}`,
      display: {
        kind: 'agent_call',
        agent_name: `UltraSwarm (${expertCount} experts)`,
        prompt: args.description,
      },
      approvalRule: this.name,
      execute: (ctx) => this.execution(args, ctx),
    };
  }

  private async execution(
    args: UltraSwarmToolInput,
    context: ExecutableToolContext,
  ): Promise<ExecutableToolResult> {
    try {
      this.swarmMode.enter('tool');
      const result = await this.runUltraSwarm(args, context.signal, context.toolCallId);
      return { output: result };
    } catch (error) {
      return {
        output: error instanceof Error ? error.message : String(error),
        isError: true,
      };
    }
  }

  private async runUltraSwarm(
    args: UltraSwarmToolInput,
    signal: AbortSignal,
    toolCallId: string,
  ): Promise<string> {
    const profileName = normalizeOptionalString(args.subagent_type) ?? 'coder';
    const autoSelect = args.auto_select !== false;

    // Build the swarm plan
    const plan = await globalUltraSwarmOrchestrator.buildSwarmPlan(
      args.description,
      autoSelect ? undefined : args.experts,
    );

    if (plan.experts.length === 0) {
      return 'No matching experts found for this task. Try being more specific in your description.';
    }

    if (plan.experts.length > MAX_ULTRA_SWARM_SUBAGENTS) {
      throw new Error(
        `UltraSwarm supports at most ${String(MAX_ULTRA_SWARM_SUBAGENTS)} experts. Requested: ${String(plan.experts.length)}`,
      );
    }

    // Build specs from plan
    const specs: UltraSwarmSpec[] = plan.experts.map((assignment, index) => ({
      index: index + 1,
      expertId: assignment.expertId,
      expertName: assignment.expertName,
      prompt: this.buildExpertPrompt(assignment, args.description),
      emoji: assignment.emoji,
      color: assignment.color,
    }));

    const tasks = specs.map((spec): QueuedSubagentTask<UltraSwarmSpec> => ({
      kind: 'spawn',
      data: spec,
      profileName,
      parentToolCallId: toolCallId,
      prompt: spec.prompt,
      description: `${args.description} #${String(spec.index)} (${spec.expertName} ${spec.emoji})`,
      swarmIndex: spec.index,
      runInBackground: false,
      swarmItem: spec.expertId,
      signal,
      timeout: DEFAULT_SUBAGENT_TIMEOUT_MS,
    }));

    const results = await this.subagentHost.runQueued(tasks);
    return renderUltraSwarmResults(
      results.map(({ task, ...result }) => ({ spec: task.data, ...result })),
      plan,
    );
  }

  private buildExpertPrompt(assignment: ExpertAssignment, taskDescription: string): string {
    const persona = `<expert_persona name="${assignment.expertName}" emoji="${assignment.emoji}" color="${assignment.color}">
${assignment.prompt}
</expert_persona>`;
    const task = `<task>
${taskDescription}
</task>`;
    return `${persona}\n\n${task}\n\nYou are ${assignment.expertName}. Apply your expertise to this task. Provide a thorough, high-quality response that leverages your specialized knowledge and skills.`;
  }
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function renderUltraSwarmResults(
  results: readonly UltraSwarmRunResult[],
  plan: { readonly taskDescription: string; readonly strategy: string },
): string {
  const completed = results.filter((r) => r.status === 'completed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const aborted = results.filter((r) => r.status === 'aborted').length;

  const lines = [
    '<ultra_swarm_result>',
    `<task>${escapeXml(plan.taskDescription)}</task>`,
    `<strategy>${plan.strategy}</strategy>`,
    `<summary>completed: ${String(completed)}, failed: ${String(failed)}, aborted: ${String(aborted)}</summary>`,
  ];

  for (const result of results) {
    const agentId = result.agentId === undefined ? '' : ` agent_id="${result.agentId}"`;
    const state = result.state === undefined ? '' : ` state="${result.state}"`;
    const body =
      result.status === 'completed'
        ? (result.result ?? '')
        : (result.error ?? 'unknown error');
    lines.push(
      `<expert name="${escapeXml(result.spec.expertName)}" emoji="${escapeXml(result.spec.emoji)}" color="${escapeXml(result.spec.color)}" outcome="${result.status}"${agentId}${state}>\n${body}\n</expert>`,
    );
  }

  lines.push('</ultra_swarm_result>');
  return lines.join('\n');
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
