/**
 * NextPhaseTool — Ultra Plan Mode phase transition tool.
 *
 * The LLM calls this tool to advance to the next phase in the ultra plan
 * workflow: interview → design → review → write → exit.
 */

import type { Agent } from '#/agent';
import { z } from 'zod';

import type { BuiltinTool } from '../../../agent/tool';
import type { ExecutableToolResult, ToolExecution } from '../../../loop/types';
import { toInputJsonSchema } from '../../support/input-schema';

const MIN_INTERVIEW_ROUNDS = 3;

export const NextPhaseInputSchema = z.object({
  phase: z.enum(['design', 'review', 'write', 'exit']).describe(
    'The target phase to advance to. Must be the next logical phase in the workflow.',
  ),
}).strict();

export type NextPhaseInput = z.infer<typeof NextPhaseInputSchema>;

export class NextPhaseTool implements BuiltinTool<NextPhaseInput> {
  readonly name = 'NextPhase' as const;
  readonly description = `Advance to the next phase in Ultra Plan Mode workflow.

Usage: call this tool when you have completed the current phase.
- From interview: call NextPhase({ phase: 'design' }) after at least ${MIN_INTERVIEW_ROUNDS} interview rounds
- From design: call NextPhase({ phase: 'review' })
- From review: call NextPhase({ phase: 'write' })
- From write: call NextPhase({ phase: 'exit' })

You can only advance forward, never backward.`;
  readonly parameters: Record<string, unknown> = toInputJsonSchema(NextPhaseInputSchema);

  constructor(private readonly agent: Agent) {}

  resolveExecution(args: NextPhaseInput): ToolExecution {
    return {
      description: `Advancing to ${args.phase} phase`,
      approvalRule: this.name,
      execute: () => this.execution(args),
    };
  }

  private execution(args: NextPhaseInput): ExecutableToolResult {
    if (!this.agent.planMode.isActive) {
      return {
        isError: true,
        output: 'NextPhase can only be called while plan mode is active.',
      };
    }

    if (!this.agent.planMode.isUltraMode) {
      return {
        isError: true,
        output: 'NextPhase is only available in Ultra Plan mode.',
      };
    }

    const currentPhase = this.agent.planMode.phase;
    const targetPhase = args.phase;

    // Validate phase transition
    const validTransitions: Record<string, string[]> = {
      interview: ['design'],
      design: ['review'],
      review: ['write'],
      write: ['exit'],
      exit: [],
    };

    if (!validTransitions[currentPhase]?.includes(targetPhase)) {
      return {
        isError: true,
        output: `Invalid phase transition: cannot go from ${currentPhase} to ${targetPhase}. Valid transitions from ${currentPhase}: ${validTransitions[currentPhase]?.join(', ') ?? 'none'}.`,
      };
    }

    // Enforce minimum interview rounds
    if (currentPhase === 'interview' && targetPhase === 'design') {
      const rounds = this.agent.planMode.interviewRoundCount;
      if (rounds < MIN_INTERVIEW_ROUNDS) {
        return {
          isError: true,
          output: `Interview phase requires at least ${MIN_INTERVIEW_ROUNDS} rounds. Current rounds: ${rounds}. Continue using AskUserQuestion to clarify requirements.`,
        };
      }
    }

    this.agent.planMode.setPhase(targetPhase as any);
    this.agent.telemetry.track('ultra_plan_phase_transition', { from: currentPhase, to: targetPhase });

    return {
      output: `Advanced from ${currentPhase} phase to ${targetPhase} phase.\n\n${this.phaseInstructions(targetPhase)}`,
    };
  }

  private phaseInstructions(phase: string): string {
    const instructions: Record<string, string> = {
      design: 'Design Phase: Use read-only tools (Read, Grep, Glob, WebSearch, FetchURL, Bash) to explore the codebase and converge on the best approach.',
      review: 'Review Phase: Use Read, Grep, Glob to re-read key files and verify your understanding before writing the plan.',
      write: 'Write Phase: Write the complete plan to the plan file. Only the plan file can be edited. Include Seed Spec, AC Tree, Evaluation Plan, and Execution Plan.',
      exit: 'Exit Phase: The plan is complete. Call ExitPlanMode to request user approval.',
    };
    return instructions[phase] ?? '';
  }
}
