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
- From interview: call NextPhase({ phase: 'design' }) only after UltraPlan says the future UltraGoal is true/false verifiable and all required Seed gaps are closed
- From design: call NextPhase({ phase: 'review' })
- From review: call NextPhase({ phase: 'write' })
- From write: call NextPhase({ phase: 'exit' })

This is the Ultra Plan phase-transition tool. Do not use EnterPlanMode to advance phases.
You can only advance forward, never backward.`;
  readonly parameters: Record<string, unknown> = toInputJsonSchema(NextPhaseInputSchema);

  constructor(private readonly agent: Agent) {}

  resolveExecution(args: NextPhaseInput): ToolExecution {
    return {
      description: `Advancing to ${args.phase} phase`,
      approvalRule: this.name,
      execute: async () => this.execution(args),
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

    if (currentPhase === 'interview' && targetPhase === 'design') {
      const readiness = this.agent.planMode.ultraEngine.interviewReadiness();
      if (!readiness.ready) {
        return {
          isError: true,
          output: this.agent.planMode.ultraEngine.readinessBlockerMessage(),
        };
      }
      if (this.agent.planMode.ultraEngine.seedSpec === null) {
        const seed = this.agent.planMode.ultraEngine.autoGenerateSeedSpecFromInterview('UltraGoal');
        this.agent.planMode.ultraEngine.setSeedSpec(seed);
      }
    }

    this.agent.planMode.setPhase(targetPhase);
    this.agent.telemetry.track('ultra_plan_phase_transition', { from: currentPhase, to: targetPhase });

    return {
      output: `Advanced from ${currentPhase} phase to ${targetPhase} phase.\n\n${this.phaseInstructions(targetPhase)}`,
    };
  }

  private phaseInstructions(phase: string): string {
    const instructions: Record<string, string> = {
      design: "Design Phase: Use read-only tools (Read, Grep, Glob, WebSearch, FetchURL, Bash) to explore the codebase and converge on the best approach. When the design summary is ready, call NextPhase({ phase: 'review' }); do not skip directly to write.",
      review: "Review Phase: Use Read, Grep, Glob to re-read key files and verify your understanding before writing the plan. When verification is complete, call NextPhase({ phase: 'write' }).",
      write: 'Write Phase: Write the complete plan to the plan file. Only the plan file can be edited. Include Seed Spec, AC Tree, Evaluation Plan, and Execution Plan.',
      exit: 'Exit Phase: The plan is complete. Call ExitPlanMode to request user approval.',
    };
    return instructions[phase] ?? '';
  }
}
