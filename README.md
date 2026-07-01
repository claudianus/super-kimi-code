# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/en/) <br>
[Documentation](https://claudianus.github.io/super-kimi-code/en/) · [Issues](https://github.com/claudianus/super-kimi-code/issues) · [한국어](README.ko.md) · [中文](README.zh-CN.md)

![Demo of using Super Kimi Code](./docs/media/intro.gif)

## Not a Kimi Code mirror. A Super Kimi operations layer.

Upstream Kimi Code is a capable terminal coding agent. Super Kimi Code turns that foundation into a heavier-duty operator system for long, expensive, failure-prone work: multiple providers, multiple accounts, quota shocks, long context drift, research evidence, verification, and the terminal UI you stare at all day.

This fork is built for people who need the agent to keep working when a key hits rate limit, an account burns quota, a session grows too long, or a task needs research, planning, parallel execution, and proof before code lands.

## What Super Kimi Adds Beyond Upstream

| Surface | Upstream Kimi Code | Super Kimi Code |
| --- | --- | --- |
| Install and command | Official Kimi-oriented package flow | Source install from this fork, local `skimi` command, Windows Git Bash detection, PATH repair, source update path |
| Provider setup | Basic provider/model configuration | Multi-provider catalog, API-key and OAuth account pools, custom endpoints, labels, secret-safe status, `provider doctor` |
| Routing | Choose a model/provider | Live route planner with `auto`, `fallback`, `fill_first`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, `rate_limit_aware`, and `random` |
| Quota survival | User changes config after failures | Runtime detection for auth, quota, rate-limit, timeout, server, connection, and empty-response failures, then cooldown and fallback selection |
| Long context | Ordinary session compaction | Super Kimi Context OS with structured working memory, quality warnings, repair, bounded rehydration, and `super_kimi_context_compaction_v2` |
| Memory | Session history | Kimi Recall: semantic, episodic, procedural, prospective, and governance memory scopes backed by local storage and readiness checks |
| Workflows | Prompt, plan, subagent primitives | Ultrawork: UltraPlan, UltraResearch, UltraGoal, UltraSwarm, Integrate, Verify, Learn in one long-task workflow |
| Research | Web fetch/search tools | Local web research fallback, evidence packs, source classification, readiness checks, and research-provider metadata |
| TUI | Functional terminal UI | Premium theme presets, bundled external terminal themes, live theme picker, syntax-aware code colors, clearer status surfaces |
| QA discipline | Standard tests | Agent benchmark scripts, real TUI workflow checks, installer QA, route tests, compaction tests, and release hardening scripts |

## The Premium Operator Stack

- **Provider and account freedom**: connect Kimi, Anthropic, OpenAI-compatible providers, Google GenAI, Vertex AI, catalog providers, and custom endpoints.
- **Multi-key resilience**: register several API keys or OAuth accounts per provider, label them, set RPM/TPM hints, and keep secrets out of status output.
- **Quota-aware routing**: route across healthy credentials and fallback models, then cool down exhausted or rate-limited candidates automatically.
- **Live route visibility**: inspect route candidates, selected credentials, latency, local limit headroom, cooldown reason, failure counts, and reset route health when needed.
- **Context that survives long sessions**: compact, repair, and rehydrate structured context instead of letting a long agent run decay into guesswork.
- **Kimi Recall memory**: preserve useful facts, project decisions, procedures, and future reminders across sessions without turning every chat into a manual notes system.
- **Ultrawork mode**: run serious tasks through planning, research, goal creation, staffing, swarm execution, integration, verification, and learning.
- **Research with receipts**: prefer evidence-backed work, classify sources, and use local fallback search/fetch when external research paths are not enough.
- **Terminal experience worth living in**: premium visual themes, syntax colors, status hints, command surfaces, and editor/ACP integration built for long daily use.

## Install

Install from this GitHub source repository. You need Git and Node.js `>=24.15.0`; Corepack uses the pinned pnpm version from `package.json`.

**macOS or Linux**

```sh
curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

**Windows PowerShell**

```powershell
irm https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.ps1 | iex
```

> On Windows, install [Git for Windows](https://gitforwindows.org/) before first launch. Super Kimi Code uses Git Bash as its shell environment. If Git Bash is installed in a custom location, set `KIMI_SHELL_PATH` to the absolute path of `bash.exe`.

Then open a new shell and verify the command:

```sh
skimi --version
```

The installer checks out the source under `~/.super-kimi-code/source`, builds the CLI, and installs the `skimi` command.

## Quick Start

Open a project and start the interactive UI:

```sh
cd your-project
skimi
```

On first launch, run `/login` and choose Kimi Code OAuth or an API-key flow. To connect other providers, use `/provider` in the TUI or the non-interactive provider commands:

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route preview <modelAlias>
kimi provider route status <sessionId>
```

For a serious implementation task, start with Ultrawork:

```sh
skimi -p "/ultrawork Audit this repo, plan the migration, implement it, run verification, and summarize the release risk."
```

Or launch the TUI and ask:

```text
Use Ultrawork. Analyze this project, identify the safest migration path, implement it, verify it, and preserve the important decisions in memory.
```

## Editor And IDE Use

Super Kimi Code speaks the Agent Client Protocol, so ACP-compatible editors and IDEs can drive a session over stdio. Log in once, then point your editor at `skimi acp`.

For Zed, add this to `~/.config/zed/settings.json`:

```json
{
  "agent_servers": {
    "Super Kimi Code": {
      "type": "custom",
      "command": "skimi",
      "args": ["acp"],
      "env": {}
    }
  }
}
```

## Documentation

- [Getting Started](https://claudianus.github.io/super-kimi-code/en/guides/getting-started)
- [Providers and models](https://claudianus.github.io/super-kimi-code/en/configuration/providers)
- [Command reference](https://claudianus.github.io/super-kimi-code/en/reference/kimi-command)
- [Interaction and approvals](https://claudianus.github.io/super-kimi-code/en/guides/interaction)
- [Sessions](https://claudianus.github.io/super-kimi-code/en/guides/sessions)
- [Using in IDEs](https://claudianus.github.io/super-kimi-code/en/guides/ides)

## Develop

Requirements: Node.js `>=24.15.0`, pnpm `10.33.0`.

```sh
git clone https://github.com/claudianus/super-kimi-code.git
cd super-kimi-code
pnpm install
```

```sh
pnpm dev:cli
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Community

- [Issues](https://github.com/claudianus/super-kimi-code/issues)
- For security vulnerabilities, see [SECURITY.md](SECURITY.md).

## Acknowledgements

Super Kimi Code builds on the Kimi Code project and the [`pi-tui`](https://github.com/earendil-works/pi-mono/tree/main/packages/tui) terminal UI foundation. The point of this fork is not to hide that foundation; it is to add the reliability, routing, memory, workflow, research, and TUI layers needed for heavier daily use.

## License

Released under the [MIT License](LICENSE).
