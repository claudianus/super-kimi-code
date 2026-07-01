# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/zh/) <br>
[文档](https://claudianus.github.io/super-kimi-code/zh/) · [Issues](https://github.com/claudianus/super-kimi-code/issues) · [한국어](README.ko.md) · [English](README.md)

![Super Kimi Code 使用演示](./docs/media/intro.gif)

## 不是 Kimi Code 换皮，而是 Super Kimi 运营层

上游 Kimi Code 是一个优秀的终端编码 Agent。Super Kimi Code 在这个基础上加入更重的实战运营层：多个 provider、多个账号、API key quota 耗尽、rate limit、长上下文漂移、research evidence、验证流程，以及每天长时间使用时真正重要的 TUI 质量。

这个 fork 的目标不是简单改名。它要解决的是：一个 key 被限流时自动换 credential，长会话变散时用 Context OS 收束，大任务通过 Ultrawork 完成规划、研究、执行、验证和学习。

## Super Kimi 相比上游新增了什么

| 维度 | 上游 Kimi Code | Super Kimi Code |
| --- | --- | --- |
| 安装与命令 | 官方 Kimi package flow | 从本 fork 源码安装，本地 `skimi` 命令，Windows Git Bash 检测，PATH 修复，source update 路径 |
| provider 设置 | 基础 provider/model 设置 | multi-provider catalog、API key/OAuth account pool、custom endpoint、label、secret-safe status、`provider doctor` |
| routing | 选择 model/provider | `auto`、`fallback`、`fill_first`、`round_robin`、`weighted_round_robin`、`least_used`、`lowest_latency`、`rate_limit_aware`、`random` 策略 |
| quota 生存能力 | 失败后用户手动调整 | 识别 auth、quota、rate-limit、timeout、server、connection、empty-response 失败，并进入 cooldown/fallback 选择 |
| 长上下文 | 普通 session compaction | Super Kimi Context OS、structured working memory、quality warning、repair、bounded rehydration、`super_kimi_context_compaction_v2` |
| memory | 以 session history 为主 | Kimi Recall：semantic、episodic、procedural、prospective、governance memory scope 与 readiness check |
| workflow | prompt、plan、subagent primitive | Ultrawork：UltraPlan、UltraResearch、UltraGoal、UltraSwarm、Integrate、Verify、Learn 的长任务流程 |
| research | web fetch/search tool | local web research fallback、evidence pack、source classification、readiness check、research-provider metadata |
| TUI | 可用的 terminal UI | premium theme preset、bundled external terminal themes、live theme picker、syntax-aware code color、更清晰的 status surface |
| QA | 常规 test | agent benchmark script、真实 TUI workflow check、installer QA、route test、compaction test、release hardening script |

## 高级运营栈

- **provider/account 自由度**：连接 Kimi、Anthropic、OpenAI 兼容 provider、Google GenAI、Vertex AI、catalog provider 和 custom endpoint。
- **multi-key resilience**：每个 provider 注册多个 API key 或 OAuth account，设置 label、RPM/TPM hint，并在状态输出中隐藏 secret。
- **quota-aware routing**：自动路由到健康 credential 和 fallback model，对 quota/rate-limit 候选执行 cooldown。
- **实时 route 可见性**：查看候选 credential、实际选中 route、latency、local limit headroom、cooldown reason、failure count。
- **长会话 Context OS**：在长任务中结构化上下文，通过质量告警、repair 和 bounded rehydration 修复逐渐发散的会话。
- **Kimi Recall memory**：把项目事实、决策、流程和未来提醒保存在 session 之外，后续继续复用。
- **Ultrawork mode**：把 planning、research、goal creation、staffing、swarm execution、integration、verification、learning 串成一个流程。
- **有证据的 research**：分类 source，保留 evidence pack，并在外部路径不足时使用 local fallback search/fetch。
- **适合每天使用的 TUI**：强化 premium visual theme、syntax color、status hint、command surface 和 ACP editor integration。

## 安装

从本 GitHub 源码仓库安装。需要 Git 和 Node.js `>=24.15.0`；Corepack 会使用 `package.json` 中固定的 pnpm 版本。

**macOS 或 Linux**

```sh
curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

**Windows PowerShell**

```powershell
irm https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.ps1 | iex
```

> Windows 用户首次启动前需要安装 [Git for Windows](https://gitforwindows.org/)。Super Kimi Code 使用 Git Bash 作为 shell 环境。如果 Git Bash 安装在非标准路径，请把 `KIMI_SHELL_PATH` 设为 `bash.exe` 的绝对路径。

打开新的 shell 后验证命令：

```sh
skimi --version
```

安装器会把源码检出到 `~/.super-kimi-code/source`，构建 CLI，并安装 `skimi` 命令。

## 快速开始

进入项目目录并启动 TUI：

```sh
cd your-project
skimi
```

首次启动时，运行 `/login` 并选择 Kimi Code OAuth 或 API key 登录流程。要连接其他 provider，可以使用 TUI 中的 `/provider`，也可以使用非交互的 provider 命令：

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route preview <modelAlias>
kimi provider route status <sessionId>
```

大型实现任务可以从 Ultrawork 开始：

```sh
skimi -p "/ultrawork Audit this repo, plan the migration, implement it, run verification, and summarize the release risk."
```

或者在 TUI 中这样请求：

```text
Use Ultrawork. Analyze this project, identify the safest migration path, implement it, verify it, and preserve the important decisions in memory.
```

## 在编辑器中使用

Super Kimi Code CLI 支持 Agent Client Protocol。登录一次后，让编辑器运行 `skimi acp` 即可。

Zed 示例：

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

## 文档

- [快速上手](https://claudianus.github.io/super-kimi-code/zh/guides/getting-started)
- [平台与模型](https://claudianus.github.io/super-kimi-code/zh/configuration/providers)
- [命令参考](https://claudianus.github.io/super-kimi-code/zh/reference/kimi-command)
- [交互与审批](https://claudianus.github.io/super-kimi-code/zh/guides/interaction)
- [会话](https://claudianus.github.io/super-kimi-code/zh/guides/sessions)
- [在 IDE 中使用](https://claudianus.github.io/super-kimi-code/zh/guides/ides)

## 本地开发

环境要求：Node.js `>=24.15.0`，pnpm `10.33.0`。

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

## 社区

- [Issues](https://github.com/claudianus/super-kimi-code/issues)
- 安全漏洞反馈请见 [SECURITY.md](SECURITY.md)。

## 致谢

Super Kimi Code 构建在 Kimi Code 项目和 [`pi-tui`](https://github.com/earendil-works/pi-mono/tree/main/packages/tui) 终端 UI 基础之上。这个 fork 的重点不是隐藏基础，而是加入重度日常使用需要的 reliability、routing、memory、workflow、research 和 TUI layer。

## 许可证

基于 [MIT License](LICENSE) 发布。
