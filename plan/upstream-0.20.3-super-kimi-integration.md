# Upstream 0.20.3 Super Kimi Integration

Source: `upstream/main` fetched from `MoonshotAI/kimi-code` on 2026-07-01.
Local baseline: Super Kimi `main` after `230d90d3`, derived from upstream `0.20.1` plus Super Kimi changes.

## Scope

Do not wholesale-merge upstream. Super Kimi carries Ultrawork, bundled themes, web-search readiness, and harness-specific TUI behavior that must survive. Prefer selective ports that improve CLI/TUI/harness reliability without reintroducing web UI as a product target.

## Upstream Change Buckets

- Adopt first: TUI input fixes, CLI wedging fixes, provider/wire compliance hardening, token/context efficiency, model/provider refresh reliability.
- Review carefully: compaction overhaul, thinking-effort config overhaul, plugin slash commands, ripgrep-backed Glob, strict provider compliance. These touch shared agent behavior and can conflict with Ultrawork prompts, skill routing, and Super Kimi diagnostics.
- Defer unless needed: web UI, desktop app, vis UI, mobile Safari, workspace sidebar, GUI store, web notifications. Useful ideas may be absorbed later, but web UI itself remains out of scope.

## Integrated In This Pass

- Upstream `#1223`: allow `@file` mentions inside slash command arguments.
- Upstream `#1225`: treat `/` as path completion in shell mode instead of opening slash-command completion.
- Upstream `#1233`: bound completed headless prompt cleanup and arm a force-exit backstop after stdio drains.
- Upstream `#1241`: recover strict-provider request-structure failures caused by malformed tool exchange history.

Super Kimi adaptation:
- Preserved dynamic `skill:` slash command lookup.
- Preserved advanced command visibility rules.
- Connected completion behavior to `appState.inputMode`.
- Added regression tests for prompt-mode slash commands and bash-mode path completion.
- Preserved Super Kimi headless `/goal` and `/ultrawork` prompt handling while adding bounded shutdown.
- Ported only the strict-provider projector/one-shot resend hardening from `#1241`, without taking the broader compaction rewrite.
- Added focused regressions for non-adjacent tool results, mid-history missing results, strict resend, and provider error classification.
- Verified `skimi` still points at the freshly built local `apps/kimi-code/dist/main.mjs`.

## Next Candidate Queue

- `#1214` compaction strategy: potential token-efficiency win, but large behavioral surface.
- `#1068` ripgrep-backed Glob: likely speed win, must preserve Super Kimi search semantics.
- `#1204` plugin slash commands: likely useful, but must fit Super Kimi skill/plugin UX.
- `#1220` double-Esc undo selector: small TUI ergonomics win after current input fixes settle.
