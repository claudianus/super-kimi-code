# Super Kimi Code CLI

> A heavier-duty Kimi Code fork for provider pools, quota-aware routing, long-context work, memory, research, and premium terminal operation.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/en/)

## What This Package Is

This package contains the terminal CLI/TUI application built by Super Kimi Code. Upstream Kimi Code gives you a capable terminal coding agent; Super Kimi Code adds the operational layer around it for heavier daily use.

The fork focuses on practical failure modes: multiple API keys, OAuth accounts, provider outages, rate limits, quota exhaustion, long context drift, research-heavy implementation, and a terminal UI that stays readable during long sessions.

## Super Kimi Advantages

| Surface | Super Kimi Code capability |
| --- | --- |
| Source install | Builds from this GitHub fork and installs the local `skimi` command |
| Provider operations | Multi-provider catalog, custom endpoints, API-key/OAuth pools, labels, secret-safe status |
| Routing | `auto`, `fallback`, `fill_first`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, `rate_limit_aware`, and `random` |
| Quota handling | Detects auth, quota, rate-limit, timeout, server, connection, and empty-response failures and cools down unhealthy candidates |
| Long context | Context OS compaction, structured working memory, repair, bounded rehydration |
| Memory | Kimi Recall semantic, episodic, procedural, prospective, and governance memory scopes |
| Workflow | Ultrawork planning, research, goal creation, swarm execution, integration, verification, and learning |
| TUI | Premium themes, bundled external terminal themes, syntax-aware colors, stronger status surfaces |

## Install

The recommended path builds Super Kimi Code from this GitHub source repository. It requires Git and Node.js 24.15.0 or later.

**macOS / Linux**

```sh
curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

**Windows PowerShell**

```powershell
irm https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.ps1 | iex
```

> On Windows, install [Git for Windows](https://gitforwindows.org/) before first launch because Super Kimi Code uses the bundled Git Bash as its shell environment. If Git Bash is installed in a custom location, set `KIMI_SHELL_PATH` to the absolute path of `bash.exe`.

Open a new terminal session and verify:

```sh
skimi --version
```

## Quick Start

Open a project and start the interactive UI:

```sh
cd your-project
skimi
```

Connect providers and route candidates:

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route preview <modelAlias>
kimi provider route status <sessionId>
```

Run a larger task through Ultrawork:

```sh
skimi -p "/ultrawork Plan, implement, verify, and summarize the release risk for this change."
```

## Documentation

- Full docs: https://claudianus.github.io/super-kimi-code/en/
- 中文文档: https://claudianus.github.io/super-kimi-code/zh/
- Root README: https://github.com/claudianus/super-kimi-code

## Repository And Issues

- Source: https://github.com/claudianus/super-kimi-code
- Issues: https://github.com/claudianus/super-kimi-code/issues
- Security: see `SECURITY.md` in the main repository

## License

MIT
