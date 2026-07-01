# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/en/) <br>
[Documentation](https://claudianus.github.io/super-kimi-code/en/) · [Issues](https://github.com/claudianus/super-kimi-code/issues) · [한국어](README.ko.md) · [中文](README.zh-CN.md)

![Demo of using Super Kimi Code](./docs/media/intro.gif)

## The coding agent for people who ship

Super Kimi Code CLI is a terminal-native AI coding agent for real project work: reading and editing code, running shell commands, searching files, fetching web pages, coordinating subagents, and adjusting its plan from live feedback.

This fork focuses on a smoother daily operator experience: one-command source installs, a faster and more expressive TUI, stronger provider/account setup, multi-key and OAuth account pools, quota-aware fallback routing, premium terminal themes, and workflow tools for long-running agent work.

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

## Quick start

Open a project and start the interactive UI:

```sh
cd your-project
skimi
```

On first launch, run `/login` and choose Kimi Code OAuth or an API-key flow. To connect other providers, use `/provider` in the TUI or the non-interactive `kimi provider` commands:

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route status <sessionId>
```

Try a first task:

```
Take a look at this project and explain its main directories.
```

## Why teams choose it

- **One-command source install**: install the fork directly from GitHub and get a local `skimi` command without global package conflicts.
- **Fast, focused TUI**: a terminal UI tuned for long agent sessions, readable status, clean controls, and premium theme presets.
- **Provider freedom**: connect Kimi, Anthropic, OpenAI-compatible providers, Google GenAI, Vertex AI, custom endpoints, and catalog-backed providers.
- **Account and key pools**: register multiple API keys or OAuth accounts per provider, label them, set local RPM/TPM limits, and avoid exposing secrets in status views.
- **Quota-aware routing**: route across healthy credentials and fallback models using strategies such as `auto`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, and `rate_limit_aware`.
- **Operational visibility**: inspect provider setup with `kimi provider doctor`, preview route candidates, and watch live cooldown, quota, latency, and selected-candidate metadata.
- **Subagents and workflows**: split focused work across built-in subagents and use Ultrawork flows for planning, goal tracking, research, and verification.
- **Editor integration**: drive sessions from Zed, JetBrains, or any [Agent Client Protocol](https://agentclientprotocol.com/) client with `skimi acp`.

## Use it in your editor

Super Kimi Code CLI speaks the Agent Client Protocol, so ACP-compatible editors and IDEs can drive a session over stdio. Log in once, then point your editor at `skimi acp`.

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

## Docs

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

Super Kimi Code builds on the Kimi Code project and the [`pi-tui`](https://github.com/earendil-works/pi-mono/tree/main/packages/tui) terminal UI foundation. We thank the original authors and contributors for the work this fork extends.

## License

Released under the [MIT License](LICENSE).
