export const DEFAULT_TASK_DIR = '.omo/bench/tasks';
export const DEFAULT_EVIDENCE_BASE = '.omo/evidence/kimi-agent-bench';
export const BENCH_SCHEMA_VERSION = 1;

export const SUPPORTED_SUITES = new Set(['seed', 'holdout', 'guard', 'system', 'all']);
export const SUPPORTED_RUNNERS = new Set(['fixture', 'external', 'ultrawork', 'provider']);
export const SUPPORTED_TASK_EXPECTED_OUTCOMES = new Set(['PASS', 'FAIL', 'BLOCKED', 'QUARANTINED']);
