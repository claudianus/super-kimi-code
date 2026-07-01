import type {
  KnowledgePromotion,
  TeamPlan,
  UltraResearchRun,
  UltraworkRun,
  UltraworkRunStatus,
  UltraworkStage,
  VerificationResult,
  WorkGraph,
} from '@moonshot-ai/protocol';

export const ULTRAWORK_STAGE_ORDER: readonly UltraworkStage[] = [
  'intake',
  'plan',
  'research',
  'goal',
  'staff',
  'swarm',
  'integrate',
  'verify',
  'learn',
  'done',
];

const STAGE_INDEX = new Map<UltraworkStage, number>(
  ULTRAWORK_STAGE_ORDER.map((stage, index) => [stage, index]),
);

export interface CreateUltraworkRunInput {
  readonly id: string;
  readonly objective: string;
  readonly now?: string;
}

export interface UltraworkRunUpdate {
  readonly researchRun?: UltraResearchRun;
  readonly teamPlan?: TeamPlan;
  readonly workGraph?: WorkGraph;
  readonly verification?: VerificationResult;
  readonly knowledgePromotions?: readonly KnowledgePromotion[];
}

export class UltraworkRunStateMachine {
  private run: UltraworkRun;

  constructor(run: UltraworkRun) {
    assertValidStage(run.stage);
    this.run = run;
  }

  static create(input: CreateUltraworkRunInput): UltraworkRunStateMachine {
    const now = input.now ?? new Date().toISOString();
    return new UltraworkRunStateMachine({
      id: input.id,
      objective: input.objective,
      status: 'running',
      stage: 'intake',
      createdAt: now,
      updatedAt: now,
      stageHistory: [{ stage: 'intake', enteredAt: now }],
    });
  }

  snapshot(): UltraworkRun {
    return this.run;
  }

  advance(to: UltraworkStage, reason?: string, now = new Date().toISOString()): UltraworkRun {
    assertValidStage(to);
    if (this.run.status === 'done' || this.run.status === 'failed') {
      throw new Error(`Cannot advance Ultrawork run after ${this.run.status}.`);
    }
    const fromIndex = stageIndex(this.run.stage);
    const toIndex = stageIndex(to);
    if (toIndex < fromIndex) {
      throw new Error(`Cannot move Ultrawork run backward from ${this.run.stage} to ${to}.`);
    }
    if (toIndex > fromIndex + 1) {
      throw new Error(`Cannot skip Ultrawork stages from ${this.run.stage} to ${to}.`);
    }

    const stageHistory = [...(this.run.stageHistory ?? [])];
    if (to !== this.run.stage) {
      stageHistory.push({ stage: to, enteredAt: now, reason });
    }

    this.run = {
      ...this.run,
      status: to === 'done' ? 'done' : 'running',
      stage: to,
      updatedAt: now,
      stageHistory,
    };
    return this.run;
  }

  update(update: UltraworkRunUpdate, now = new Date().toISOString()): UltraworkRun {
    this.run = {
      ...this.run,
      ...update,
      updatedAt: now,
    };
    return this.run;
  }

  markBlocked(reason: string, now = new Date().toISOString()): UltraworkRun {
    return this.markTerminalish('blocked', reason, now);
  }

  markFailed(reason: string, now = new Date().toISOString()): UltraworkRun {
    return this.markTerminalish('failed', reason, now);
  }

  private markTerminalish(
    status: Exclude<UltraworkRunStatus, 'running' | 'done'>,
    reason: string,
    now: string,
  ): UltraworkRun {
    const stageHistory = [
      ...(this.run.stageHistory ?? []),
      { stage: this.run.stage, enteredAt: now, reason },
    ];
    this.run = {
      ...this.run,
      status,
      updatedAt: now,
      stageHistory,
    };
    return this.run;
  }
}

function assertValidStage(stage: UltraworkStage): void {
  if (!STAGE_INDEX.has(stage)) {
    throw new Error(`Unknown Ultrawork stage: ${stage}`);
  }
}

function stageIndex(stage: UltraworkStage): number {
  const index = STAGE_INDEX.get(stage);
  if (index === undefined) throw new Error(`Unknown Ultrawork stage: ${stage}`);
  return index;
}
