import { describe, expect, it } from 'vitest';

import { UltraworkRunStateMachine } from '../../src/ultrawork';

describe('UltraworkRunStateMachine', () => {
  it('creates a run and advances through the fixed Ultrawork spine', () => {
    const machine = UltraworkRunStateMachine.create({
      id: 'uw_1',
      objective: 'Ship the workflow',
      now: '2026-07-01T00:00:00.000Z',
    });

    expect(machine.snapshot()).toMatchObject({
      id: 'uw_1',
      objective: 'Ship the workflow',
      status: 'running',
      stage: 'intake',
    });

    machine.advance('plan', 'requirements captured', '2026-07-01T00:00:01.000Z');
    machine.advance('research', 'current knowledge needed', '2026-07-01T00:00:02.000Z');

    expect(machine.snapshot().stage).toBe('research');
    expect(machine.snapshot().stageHistory).toEqual([
      { stage: 'intake', enteredAt: '2026-07-01T00:00:00.000Z' },
      {
        stage: 'plan',
        enteredAt: '2026-07-01T00:00:01.000Z',
        reason: 'requirements captured',
      },
      {
        stage: 'research',
        enteredAt: '2026-07-01T00:00:02.000Z',
        reason: 'current knowledge needed',
      },
    ]);
  });

  it('rejects skipped or backward stage transitions', () => {
    const machine = UltraworkRunStateMachine.create({
      id: 'uw_1',
      objective: 'Ship the workflow',
      now: '2026-07-01T00:00:00.000Z',
    });

    expect(() => machine.advance('research')).toThrow('Cannot skip Ultrawork stages');
    machine.advance('plan');
    expect(() => machine.advance('intake')).toThrow('Cannot move Ultrawork run backward');
  });

  it('attaches team, verification, and knowledge state without changing stage', () => {
    const machine = UltraworkRunStateMachine.create({
      id: 'uw_1',
      objective: 'Ship the workflow',
      now: '2026-07-01T00:00:00.000Z',
    });

    const updated = machine.update(
      {
        teamPlan: {
          id: 'team_1',
          runId: 'uw_1',
          intensity: 'premium',
          maxExperts: 24,
          experts: [],
        },
        verification: {
          id: 'verify_1',
          runId: 'uw_1',
          status: 'passed',
          checks: [{ name: 'typecheck', status: 'passed' }],
          completedAt: '2026-07-01T00:00:02.000Z',
        },
        knowledgePromotions: [
          {
            id: 'learn_1',
            runId: 'uw_1',
            target: 'llm_wiki',
            findingId: 'finding_1',
            title: 'Verified finding',
            promotedAt: '2026-07-01T00:00:03.000Z',
            sourceEvidenceIds: ['evidence_1'],
          },
        ],
      },
      '2026-07-01T00:00:04.000Z',
    );

    expect(updated.stage).toBe('intake');
    expect(updated.teamPlan?.maxExperts).toBe(24);
    expect(updated.verification?.status).toBe('passed');
    expect(updated.knowledgePromotions).toHaveLength(1);
  });
});
