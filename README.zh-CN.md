# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/zh/) <br>
[文档](https://claudianus.github.io/super-kimi-code/zh/) · [Issues](https://github.com/claudianus/super-kimi-code/issues) · [한국어](README.ko.md) · [English](README.md)

![Super Kimi Code 使用演示](./docs/media/intro.gif)

## 为真正交付的人准备的编码 Agent

Super Kimi Code CLI 是运行在终端里的 AI 编码 Agent。它可以阅读和修改代码、执行 shell 命令、搜索文件、抓取网页、协调子 Agent，并根据实时反馈调整下一步行动。

这个 fork 专注于日常高强度使用体验：从 GitHub 源码一行安装，更快、更清晰的 TUI，更强的 provider 与账号/API key 设置，多 key 与 OAuth 账号池，以及根据 rate limit 和 quota 自动 fallback、routing、load balancing 的能力。

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

首次启动时，运行 `/login` 并选择 Kimi Code OAuth 或 API key 登录流程。要连接其他 provider，可以使用 TUI 中的 `/provider`，也可以使用非交互的 `kimi provider` 命令：

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route status <sessionId>
```

可以从这个任务开始：

```
帮我看一下这个项目的主要目录，并说明每个目录负责什么。
```

## 为什么选择它

- **GitHub 源码一行安装**：直接从这个 fork 安装本地 `skimi` 命令，避免全局包冲突。
- **快速、专注的 TUI**：为长时间 Agent 会话优化状态、控制、主题和代码显示。
- **Provider 自由度**：支持 Kimi、Anthropic、OpenAI 兼容 provider、Google GenAI、Vertex AI、自定义 endpoint 和 catalog provider。
- **账号和 key 池**：每个 provider 可注册多个 API key 或 OAuth 账号，设置 label、本地 RPM/TPM limit，并在状态视图中隐藏 secret。
- **Quota-aware routing**：使用 `auto`、`round_robin`、`weighted_round_robin`、`least_used`、`lowest_latency`、`rate_limit_aware` 等策略自动选择健康 credential 与 fallback model。
- **运营可见性**：用 `kimi provider doctor`、route preview、route status 查看 cooldown、quota、latency 和实际选中的 provider/key/account。
- **子 Agent 与 Ultrawork**：让 planning、goal tracking、research、verification 等长任务流程更清晰。
- **编辑器集成**：通过 `skimi acp` 接入 Zed、JetBrains 或任何 Agent Client Protocol 客户端。

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

Super Kimi Code 构建在 Kimi Code 项目和 [`pi-tui`](https://github.com/earendil-works/pi-mono/tree/main/packages/tui) 终端 UI 基础之上。感谢原作者和贡献者提供了这个 fork 得以继续扩展的基础。

## 许可证

基于 [MIT License](LICENSE) 发布。
