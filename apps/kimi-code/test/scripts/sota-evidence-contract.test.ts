import { describe, expect, it } from 'vitest';

import {
  isCompleteUltraworkEvidenceSummary,
  ULTRAWORK_SUMMARY_REQUIRED_VALIDATIONS,
  ultraworkQuestionValidation,
} from '../../../../scripts/kimi-sota-evidence-contract.mjs';

interface TestValidation {
  status: string;
  optional?: boolean;
  metrics?: Record<string, number>;
}

function completeUltraworkSummary(questionValidation: TestValidation) {
  const validations: Record<string, TestValidation> = {};
  for (const name of ULTRAWORK_SUMMARY_REQUIRED_VALIDATIONS) {
    validations[name] = name === 'questionHandled' ? questionValidation : { status: 'PASS' };
  }
  validations['usageTelemetryVisible'] = {
    status: 'PASS',
    metrics: {
      inputTokensApprox: 1000,
      outputTokensApprox: 100,
      totalTokensApprox: 1100,
      cacheReadTokensApprox: 800,
      cacheWriteTokensApprox: 50,
      cacheSharePercent: 80,
      contextUsagePercent: 10,
      contextTokensApprox: 1000,
      maxContextTokensApprox: 10000,
      remainingContextTokensApprox: 9000,
    },
  };
  return {
    phase: 'tui-ultrawork-workflow',
    status: 'PASS',
    kimiCodeHomeMode: 'real-user-opt-in',
    validations,
    workflow: {
      wait: {
        activationEvidence: [{}],
        interviewEvidence: [{}],
        questionAnswerEvidence: [{}],
        postQuestionProgressEvidence: [{}],
        agentVerificationEvidence: [{}],
        questionToolErrorEvidence: [],
      },
    },
    captures: [],
    inputTraces: [],
    workspace: {
      editFiles: [
        'apps/kimi-code/src/tui/commands/ultrawork-contract.ts',
        'apps/kimi-code/test/tui/commands/ultrawork.test.ts',
      ],
      editedFileCount: 2,
      diffExitCode: 0,
      verificationExitCode: 0,
      targetedTestExitCode: 0,
    },
  };
}

describe('Ultrawork evidence contract', () => {
  it('requires the clearer questionHandled validation name', () => {
    expect(ULTRAWORK_SUMMARY_REQUIRED_VALIDATIONS).toContain('questionHandled');
    expect(ULTRAWORK_SUMMARY_REQUIRED_VALIDATIONS).not.toContain('questionAnswered');
  });

  it('accepts complete summaries with questionHandled evidence', () => {
    const summary = completeUltraworkSummary({ status: 'PASS', optional: true });

    expect(ultraworkQuestionValidation(summary)).toEqual({ status: 'PASS', optional: true });
    expect(isCompleteUltraworkEvidenceSummary(summary)).toBe(true);
  });

  it('keeps legacy questionAnswered summaries readable while new runs migrate', () => {
    const summary = completeUltraworkSummary({ status: 'PASS', optional: true });
    const handled = summary.validations['questionHandled'];
    expect(handled).toBeDefined();
    if (handled === undefined) return;
    summary.validations['questionAnswered'] = handled;
    delete summary.validations['questionHandled'];

    expect(ultraworkQuestionValidation(summary)).toEqual({ status: 'PASS', optional: true });
    expect(isCompleteUltraworkEvidenceSummary(summary)).toBe(true);
  });
});
