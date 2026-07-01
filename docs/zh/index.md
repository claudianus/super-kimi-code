---
layout: home
hero:
  name: Super Kimi Code CLI
  text: 不是 Kimi Code 换皮，而是 Super Kimi 运营层
  tagline: Provider pool、quota-aware fallback、Context OS、Kimi Recall、Ultrawork、local research、高级 TUI 与源码安装。
  actions:
    - theme: brand
      text: 开始使用
      link: guides/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/claudianus/super-kimi-code
features:
  - title: 扛住 quota 冲击
    details: 建立 API key 与 OAuth account 池，查看实时 route health，cooldown 异常候选，并在 provider 卡住前 fallback。
  - title: 面向长任务
    details: 使用 Ultrawork、Kimi Recall、Context OS compaction 和 local research fallback 来规划、执行、验证并保留决策。
  - title: 高级终端体验
    details: 以 skimi 安装源码 fork，使用高级和导入主题，查看更清晰的状态，并连接 ACP 兼容编辑器。
---

## 为什么需要 Super Kimi

上游 Kimi Code 是一个优秀的终端编码 Agent。Super Kimi Code 解决的是更下一层的真实工作问题：一个 API key 被 rate limit，一个账号 quota 耗尽，一个长上下文开始漂移，或者一个实现任务需要 research、verification 和 memory，而不是再发一个简单 prompt。

这个 fork 保留 terminal-first 工作流，同时加入实战运营层。

## 代码层面的差异

| 维度 | 上游 Kimi Code | Super Kimi Code |
| --- | --- | --- |
| 安装与命令 | Kimi-oriented package flow | 从本 fork 源码安装，本地 `skimi` 命令，Windows Git Bash 检测，PATH 修复，source update 路径 |
| provider 设置 | 基础 provider/model 设置 | multi-provider catalog、API-key/OAuth account pool、custom endpoint、label、secret-safe status、`provider doctor` |
| routing | 选择 model/provider | `auto`、`fallback`、`fill_first`、`round_robin`、`weighted_round_robin`、`least_used`、`lowest_latency`、`rate_limit_aware`、`random` live planner |
| quota 处理 | 失败后用户手动调整 | 运行时识别 auth、quota、rate-limit、timeout、server、connection、empty-response 失败，然后 cooldown 与 fallback |
| 长上下文 | 普通 session compaction | Context OS、structured working memory、compaction quality warning、repair、bounded rehydration、`super_kimi_context_compaction_v2` |
| memory | session history | Kimi Recall semantic、episodic、procedural、prospective、governance memory scope |
| workflow | prompt、plan、subagent primitive | Ultrawork 的 intake、plan、research、goal、staff、swarm、integrate、verify、learn、done 阶段 |
| research | web fetch/search tool | local web research fallback、evidence pack、source classification、readiness check、research-provider metadata |
| TUI | 可用的 terminal UI | premium theme preset、bundled external terminal themes、live picker、syntax-aware color、更清晰的 status surface |
| QA | 常规 test | agent benchmark script、真实 TUI workflow check、installer QA、route test、compaction test、release hardening |

## 为重度 Agent 运行而设计

Super Kimi Code 面向不希望因为某个 provider 异常就中断会话的用户。你可以注册多个 credential，设置 label 和本地 rate hint，预览 route candidate，查看实际 provider metadata，并让 routing 绕开 rate limit 与 quota 耗尽。

它也面向不应该交给单个 prompt 的任务。Ultrawork 让 Agent 完成 planning、research、staffing、execution、integration、verification 和 learning。Kimi Recall 与 Context OS 保留有价值的工作成果，让长会话保持清晰。
