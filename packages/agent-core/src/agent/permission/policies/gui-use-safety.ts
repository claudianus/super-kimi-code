import type { Agent } from '../..';
import type {
  PermissionDecisionReason,
  PermissionPolicy,
  PermissionPolicyContext,
  PermissionPolicyResult,
} from '../types';

type GuiUseSafetyDecision = {
  readonly kind: 'ask' | 'deny';
  readonly risk: string;
  readonly message: string;
};

export class GuiUseSafetyPermissionPolicy implements PermissionPolicy {
  readonly name = 'gui-use-safety';

  constructor(private readonly agent: Agent) {}

  evaluate(context: PermissionPolicyContext): PermissionPolicyResult | undefined {
    const decision = classifyGuiUseRisk(context.toolCall.name, context.args);
    if (decision === undefined) return;

    if (decision.kind === 'deny') {
      return {
        kind: 'deny',
        reason: guiUseReason(decision.risk, { blocked: true }),
        message: decision.message,
      };
    }

    if (this.agent.rpc?.requestApproval === undefined) {
      return {
        kind: 'deny',
        reason: guiUseReason(decision.risk, { approval_surface: false }),
        message:
          `${decision.message} This GUI-use action requires an explicit approval surface and was not run.`,
      };
    }

    return {
      kind: 'ask',
      reason: guiUseReason(decision.risk, { approval_surface: true }),
    };
  }
}

function classifyGuiUseRisk(
  toolName: string,
  args: unknown,
): GuiUseSafetyDecision | undefined {
  if (toolName === 'BrowserConsole') return browserConsoleRisk(args);
  if (toolName === 'BrowserAct') return browserActRisk(args);
  if (toolName === 'ComputerAct') return computerActRisk(args);
  return undefined;
}

function browserConsoleRisk(args: unknown): GuiUseSafetyDecision | undefined {
  const expression = stringProp(args, 'expression')?.trim();
  if (expression === undefined || expression.length === 0) return;
  const blocked = unsafeBrowserConsoleExpression(expression);
  if (blocked === undefined) return;
  return {
    kind: 'deny',
    risk: 'browser_console_unsafe_eval',
    message: `Blocked browser console expression: ${blocked}.`,
  };
}

function browserActRisk(args: unknown): GuiUseSafetyDecision | undefined {
  for (const action of arrayProp(args, 'actions')) {
    if (!isRecord(action)) continue;
    const type = action['type'];
    if (type === 'navigate') {
      const blocked = privilegedBrowserUrlReason(stringProp(action, 'url'));
      if (blocked !== undefined) {
        return {
          kind: 'ask',
          risk: 'browser_privileged_navigation',
          message: `Browser navigation targets a privileged URL: ${blocked}.`,
        };
      }
    }
    if (type === 'type_text') {
      const sensitive = sensitiveTypedTextReason(stringProp(action, 'text') ?? '');
      if (sensitive !== undefined) {
        return {
          kind: 'ask',
          risk: 'browser_sensitive_text',
          message: `Browser text entry may contain sensitive data: ${sensitive}.`,
        };
      }
    }
    if (type === 'press_keys') {
      const risky = riskyKeyComboReason(stringProp(action, 'keys') ?? '');
      if (risky !== undefined) {
        return {
          kind: 'ask',
          risk: 'browser_risky_shortcut',
          message: `Browser shortcut may close or discard state: ${risky}.`,
        };
      }
    }
  }
  return undefined;
}

function computerActRisk(args: unknown): GuiUseSafetyDecision | undefined {
  for (const action of arrayProp(args, 'actions')) {
    if (!isRecord(action)) continue;
    const type = action['type'];
    if (type === 'type_text') {
      const text = stringProp(action, 'text') ?? '';
      const blocked = hardBlockedTypedTextReason(text);
      if (blocked !== undefined) {
        return {
          kind: 'deny',
          risk: 'computer_hard_blocked_text',
          message: `Blocked desktop text entry: ${blocked}.`,
        };
      }
      const risky = riskyTypedTextReason(text) ?? sensitiveTypedTextReason(text);
      if (risky !== undefined) {
        return {
          kind: 'ask',
          risk: 'computer_risky_text',
          message: `Desktop text entry may perform a high-risk action: ${risky}.`,
        };
      }
    }
    if (type === 'set_value') {
      const sensitive = sensitiveTypedTextReason(stringProp(action, 'value') ?? '');
      if (sensitive !== undefined) {
        return {
          kind: 'ask',
          risk: 'computer_sensitive_value',
          message: `Desktop value entry may contain sensitive data: ${sensitive}.`,
        };
      }
    }
    if (type === 'press_keys') {
      const risky = riskyKeyComboReason(stringProp(action, 'keys') ?? '');
      if (risky !== undefined) {
        return {
          kind: 'ask',
          risk: 'computer_risky_shortcut',
          message: `Desktop shortcut may close or discard state: ${risky}.`,
        };
      }
    }
  }
  return undefined;
}

function hardBlockedTypedTextReason(text: string): string | undefined {
  return matchPattern(text, [
    [
      /\brm\s+-(?=[a-z]*r)(?=[a-z]*f)[a-z]*\s+(?:\/|~|\$HOME)(?:\s|$)/i,
      'recursive delete of a root or home directory',
    ],
    [/\bsudo\s+rm\b/i, 'sudo delete command'],
    [/\bmkfs(?:\.[a-z0-9]+)?\b/i, 'filesystem formatting command'],
    [/\bdd\s+if=.*\bof=\/dev\//i, 'raw disk write'],
    [/\bdiskutil\s+(?:eraseDisk|partitionDisk)\b/i, 'disk erase or partition command'],
    [/\bformat\s+[a-z]:/i, 'Windows volume format command'],
    [/\b(?:shutdown|reboot|poweroff|halt)\b/i, 'system power command'],
    [/\b(?:Stop-Computer|Restart-Computer)\b/i, 'PowerShell system power command'],
    [/:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;/, 'fork bomb'],
  ]);
}

function riskyTypedTextReason(text: string): string | undefined {
  return matchPattern(text, [
    [/\brm\s+-(?=[a-z]*r)(?=[a-z]*f)[a-z]*\b/i, 'recursive force delete'],
    [/\b(?:Remove-Item|rm)\b.*\b(?:-Recurse|-Force)\b/i, 'recursive or forced remove'],
    [/\b(?:del|rd|rmdir)\b.*\/[sq]\b/i, 'Windows recursive or quiet delete'],
    [/\bgit\s+reset\s+--hard\b/i, 'hard git reset'],
    [/\bgit\s+clean\s+-[a-z]*[dfx][a-z]*\b/i, 'git clean can remove untracked files'],
    [/\bgit\s+push\b.*\s--force(?:-with-lease)?\b/i, 'force push'],
    [/\bdocker\s+(?:system|volume)\s+prune\b/i, 'Docker prune'],
    [/\bkubectl\s+delete\b/i, 'Kubernetes delete'],
    [/\bterraform\s+destroy\b/i, 'Terraform destroy'],
    [/\b(?:drop\s+database|truncate\s+table)\b/i, 'destructive database command'],
    [/\b(?:npm|pnpm|yarn)\s+publish\b/i, 'package publish'],
    [/\bgh\s+repo\s+delete\b/i, 'GitHub repository delete'],
  ]);
}

function sensitiveTypedTextReason(text: string): string | undefined {
  return matchPattern(text, [
    [
      /\b(?:password|passwd|api[_-]?key|secret|token|access[_-]?token)\s*[:=]/i,
      'credential-like assignment',
    ],
    [/\b(?:sk-[a-z0-9_-]{20,}|gh[pousr]_[a-z0-9_]{20,})\b/i, 'token-like secret'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key material'],
  ]);
}

function riskyKeyComboReason(keys: string): string | undefined {
  const normalized = keyParts(keys);
  const hasCommand = hasAny(normalized, ['cmd', 'command', 'meta']);
  const hasControl = hasAny(normalized, ['ctrl', 'control']);
  const hasAlt = hasAny(normalized, ['alt', 'option']);
  const hasShift = normalized.has('shift');
  if ((hasCommand || hasControl) && normalized.has('q')) return 'application quit shortcut';
  if ((hasCommand || hasControl) && normalized.has('w')) return 'window or tab close shortcut';
  if (hasAlt && normalized.has('f4')) return 'window close shortcut';
  if ((hasCommand || hasControl || hasAlt) && hasAny(normalized, ['power', 'eject'])) {
    return 'system power shortcut';
  }
  if (
    (hasCommand && hasAny(normalized, ['backspace', 'delete'])) ||
    (hasShift && normalized.has('delete'))
  ) {
    return 'delete-bypassing shortcut';
  }
  if (hasControl && hasAlt && hasAny(normalized, ['delete', 'del'])) return 'system security shortcut';
  return undefined;
}

function unsafeBrowserConsoleExpression(expression: string): string | undefined {
  return matchPattern(expression, [
    [/\bdocument\.cookie\b/i, 'cookie access'],
    [/\b(?:localStorage|sessionStorage|indexedDB)\b/i, 'browser storage access'],
    [/\b(?:fetch|XMLHttpRequest|WebSocket|navigator\.sendBeacon)\b/i, 'network API access'],
    [/\b(?:password|credential|token|secret)\b/i, 'credential-like field access'],
    [/\b(?:HTMLInputElement|HTMLTextAreaElement)\b.*\.value\b/i, 'form value access'],
    [
      /\bquerySelector(?:All)?\([^)]*(?:password|token|secret|credential|input|textarea)/i,
      'form or credential selector access',
    ],
  ]);
}

function privilegedBrowserUrlReason(url: string | undefined): string | undefined {
  if (url === undefined || url.trim().length === 0) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const protocol = parsed.protocol.toLowerCase();
  if (protocol === 'http:' || protocol === 'https:') return undefined;
  if (protocol === 'file:') return 'file URL';
  if (protocol === 'javascript:') return 'javascript URL';
  if (protocol === 'chrome:' || protocol === 'chrome-extension:' || protocol === 'devtools:') {
    return `${protocol.slice(0, -1)} URL`;
  }
  if (protocol === 'about:' && parsed.href.toLowerCase() !== 'about:blank') return 'about URL';
  return 'non-web URL scheme';
}

function matchPattern(
  text: string,
  patterns: readonly (readonly [RegExp, string])[],
): string | undefined {
  return patterns.find(([pattern]) => pattern.test(text))?.[1];
}

function keyParts(keys: string): Set<string> {
  return new Set(
    keys
      .toLowerCase()
      .split('+')
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
}

function hasAny(parts: Set<string>, aliases: readonly string[]): boolean {
  return aliases.some((alias) => parts.has(alias));
}

function arrayProp(value: unknown, key: string): readonly unknown[] {
  if (!isRecord(value)) return [];
  const prop = value[key];
  return Array.isArray(prop) ? prop : [];
}

function stringProp(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const prop = value[key];
  return typeof prop === 'string' ? prop : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function guiUseReason(
  risk: string,
  extra: PermissionDecisionReason,
): PermissionDecisionReason {
  return {
    gui_use: true,
    gui_use_risk: risk,
    ...extra,
  };
}
