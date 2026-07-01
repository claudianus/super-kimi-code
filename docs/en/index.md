---
layout: home
hero:
  name: Super Kimi Code CLI
  text: Not a Kimi Code mirror. The Super Kimi operations layer.
  tagline: Provider pools, quota-aware fallback, Context OS, Kimi Recall, Ultrawork, local research, premium TUI, and source install for serious agent work.
  actions:
    - theme: brand
      text: Get started
      link: guides/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/claudianus/super-kimi-code
features:
  - title: Survives quota shocks
    details: Pool API keys and OAuth accounts, inspect live route health, cool down unhealthy candidates, and fallback before a blocked provider stops the session.
  - title: Built for long work
    details: Use Ultrawork, Kimi Recall, Context OS compaction, and local research fallback to plan, execute, verify, and preserve decisions.
  - title: Premium daily terminal
    details: Install the source fork as skimi, use premium and imported themes, see clearer status, and connect ACP-compatible editors.
---

## Why Super Kimi Exists

Upstream Kimi Code is a capable terminal coding agent. Super Kimi Code exists for the next layer of real work: the moment one API key is rate-limited, one account runs out of quota, one long context starts drifting, or one implementation needs research, verification, and memory instead of another single prompt.

This fork keeps the terminal-first workflow, then adds the operational machinery around it.

## Code-Backed Differences

| Surface | Upstream Kimi Code | Super Kimi Code |
| --- | --- | --- |
| Install and command | Kimi-oriented package flow | Source install from this fork, local `skimi` command, Windows Git Bash detection, PATH repair, source update path |
| Provider setup | Basic provider/model configuration | Multi-provider catalog, API-key and OAuth account pools, custom endpoints, labels, secret-safe status, `provider doctor` |
| Routing | Pick a model/provider | Live planner with `auto`, `fallback`, `fill_first`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, `rate_limit_aware`, and `random` |
| Quota handling | User changes config after failure | Runtime classification for auth, quota, rate-limit, timeout, server, connection, and empty-response failures, then cooldown and fallback |
| Long context | Ordinary session compaction | Context OS, structured working memory, compaction quality warnings, repair, bounded rehydration, and `super_kimi_context_compaction_v2` |
| Memory | Session history | Kimi Recall semantic, episodic, procedural, prospective, and governance memory scopes |
| Workflow | Prompt, plan, subagent primitives | Ultrawork stages for intake, plan, research, goal, staff, swarm, integrate, verify, learn, and done |
| Research | Web fetch/search tools | Local web research fallback, evidence packs, source classification, readiness checks, and research-provider metadata |
| TUI | Functional terminal UI | Premium theme presets, bundled external terminal themes, live picker, syntax-aware colors, and clearer status surfaces |
| QA | Standard tests | Agent benchmark scripts, real TUI workflow checks, installer QA, route tests, compaction tests, and release hardening |

## Designed For Heavy Agent Operation

Super Kimi Code is for users who do not want the session to die just because one provider is unhealthy. You can register multiple credentials, label them, set local rate hints, preview route candidates, watch selected provider metadata, and let routing move around rate limits and exhausted quota.

It is also for tasks that should not be trusted to a single prompt. Ultrawork makes the agent plan, research, staff, execute, integrate, verify, and learn. Kimi Recall and Context OS preserve the useful parts of that work so long sessions remain legible.
