const SECRET_PATTERNS: readonly RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bsk-proj-[A-Za-z0-9_-]{20,}\b/g,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g,
  /\b(?:xoxb|xoxp|xoxa|xoxr)-[A-Za-z0-9-]{20,}\b/g,
  /\b[A-Za-z0-9_=-]{32,}\.[A-Za-z0-9_=-]{16,}\.[A-Za-z0-9_=-]{16,}\b/g,
  /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret)\s*[:=]\s*['"]?[^'"\s]{12,}/gi,
];

export interface RedactionResult {
  readonly text: string;
  readonly redactions: number;
}

export function redactMemoryText(input: string): RedactionResult {
  let text = input;
  let redactions = 0;
  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, () => {
      redactions += 1;
      return '[REDACTED_SECRET]';
    });
  }
  return { text, redactions };
}

export function shouldSkipMemoryText(input: string): boolean {
  if (input.trim().length === 0) return true;
  const { redactions } = redactMemoryText(input);
  return redactions >= 4;
}
