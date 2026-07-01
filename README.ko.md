# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/) <br>
[문서](https://claudianus.github.io/super-kimi-code/) · [이슈](https://github.com/claudianus/super-kimi-code/issues) · [English](README.md) · [中文](README.zh-CN.md)

![Super Kimi Code 사용 데모](./docs/media/intro.gif)

## Kimi Code 복제가 아니라, Super Kimi 운영 레이어입니다

upstream Kimi Code가 좋은 터미널 코딩 에이전트라면, Super Kimi Code는 그 위에 실전 운영 레이어를 얹은 fork입니다. 여러 provider와 여러 계정, API key quota 소진, rate limit, 긴 context 붕괴, research evidence, 검증, 그리고 하루 종일 보는 TUI 품질까지 실제 작업에서 터지는 문제를 정면으로 다룹니다.

이 fork의 목적은 단순한 리브랜딩이 아닙니다. key 하나가 막혀도 다른 credential로 넘어가고, 장기 세션이 흐려지면 Context OS로 정리하고, 큰 작업은 Ultrawork로 계획-조사-실행-검증-학습까지 한 번에 밀어붙이게 만드는 것입니다.

## upstream 대비 Super Kimi가 추가한 것

| 영역 | upstream Kimi Code | Super Kimi Code |
| --- | --- | --- |
| 설치와 명령 | 공식 Kimi 중심 package flow | 이 fork에서 source install, 로컬 `skimi` 명령, Windows Git Bash 감지, PATH 복구, source update 경로 |
| provider 설정 | 기본 provider/model 설정 | multi-provider catalog, API key/OAuth account pool, custom endpoint, label, secret-safe status, `provider doctor` |
| routing | model/provider 선택 | `auto`, `fallback`, `fill_first`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, `rate_limit_aware`, `random` 전략 |
| quota 생존성 | 실패 후 사용자가 수동 조정 | auth, quota, rate-limit, timeout, server, connection, empty-response 실패를 감지하고 cooldown/fallback 후보로 자동 이동 |
| 긴 context | 일반 session compaction | Super Kimi Context OS, structured working memory, quality warning, repair, bounded rehydration, `super_kimi_context_compaction_v2` |
| memory | session history 중심 | Kimi Recall: semantic, episodic, procedural, prospective, governance memory scope와 readiness check |
| workflow | prompt, plan, subagent primitives | Ultrawork: UltraPlan, UltraResearch, UltraGoal, UltraSwarm, Integrate, Verify, Learn을 하나의 long-task workflow로 통합 |
| research | web fetch/search tool | local web research fallback, evidence pack, source classification, readiness check, research-provider metadata |
| TUI | 기능적인 terminal UI | premium theme preset, bundled external terminal themes, live theme picker, syntax-aware code color, 더 선명한 status surface |
| QA | 일반 test | agent benchmark script, 실제 TUI workflow check, installer QA, route test, compaction test, release hardening script |

## 프리미엄 운영 스택

- **provider/account 자유도**: Kimi, Anthropic, OpenAI 호환 provider, Google GenAI, Vertex AI, catalog provider, custom endpoint를 연결합니다.
- **multi-key resilience**: provider마다 여러 API key와 OAuth account를 등록하고 label, RPM/TPM hint, secret-safe status를 적용합니다.
- **quota-aware routing**: 건강한 credential과 fallback model로 자동 라우팅하고, quota/rate-limit 후보는 cooldown 처리합니다.
- **실시간 route 가시성**: 후보 credential, 선택된 route, latency, local limit headroom, cooldown reason, failure count를 확인합니다.
- **장기 세션용 Context OS**: 긴 작업 중 context를 구조화하고, 품질 경고와 repair, bounded rehydration으로 흐려진 세션을 복구합니다.
- **Kimi Recall memory**: 프로젝트 사실, 결정, 절차, 추후 할 일을 session 밖에 남기고 다시 꺼내 씁니다.
- **Ultrawork mode**: planning, research, goal creation, staffing, swarm execution, integration, verification, learning을 한 흐름으로 실행합니다.
- **근거 있는 research**: source를 분류하고 evidence pack을 남기며, 외부 경로가 부족할 때 local fallback search/fetch를 사용합니다.
- **매일 써도 지치지 않는 TUI**: premium visual theme, syntax color, status hint, command surface, ACP editor integration을 강화했습니다.

## 설치

이 GitHub 소스 저장소에서 바로 설치합니다. Git과 Node.js `>=24.15.0`이 필요하며, Corepack이 `package.json`에 고정된 pnpm 버전을 사용합니다.

**macOS 또는 Linux**

```sh
curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

**Windows PowerShell**

```powershell
irm https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.ps1 | iex
```

> Windows에서는 첫 실행 전에 [Git for Windows](https://gitforwindows.org/)를 설치하세요. Super Kimi Code는 Git Bash를 shell 환경으로 사용합니다. Git Bash를 표준 위치가 아닌 곳에 설치했다면 `KIMI_SHELL_PATH`에 `bash.exe`의 절대 경로를 지정하세요.

새 shell을 열고 설치를 확인합니다.

```sh
skimi --version
```

설치 스크립트는 소스를 `~/.super-kimi-code/source`에 checkout하고 CLI를 빌드한 뒤 `skimi` 명령을 설치합니다.

## 빠른 시작

프로젝트 폴더에서 TUI를 실행합니다.

```sh
cd your-project
skimi
```

처음 실행하면 `/login`으로 Kimi Code OAuth 또는 API key 기반 로그인을 설정하세요. 다른 provider를 연결하려면 TUI의 `/provider` 또는 비대화형 provider 명령을 사용합니다.

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route preview <modelAlias>
kimi provider route status <sessionId>
```

큰 구현 작업은 Ultrawork로 시작하면 됩니다.

```sh
skimi -p "/ultrawork 이 repo를 audit하고, migration plan을 세우고, 구현하고, 검증하고, release risk를 요약해줘."
```

또는 TUI에서 이렇게 요청하세요.

```text
Ultrawork를 사용해. 이 프로젝트를 분석하고, 가장 안전한 migration path를 찾고, 구현하고, 검증하고, 중요한 결정은 memory에 남겨줘.
```

## 에디터에서 사용

Super Kimi Code CLI는 Agent Client Protocol을 지원합니다. 한 번 로그인한 뒤 에디터가 `skimi acp`를 실행하도록 설정하면 됩니다.

Zed 예시:

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

## 문서

- [시작하기](https://claudianus.github.io/super-kimi-code/en/guides/getting-started)
- [Providers and models](https://claudianus.github.io/super-kimi-code/en/configuration/providers)
- [명령 reference](https://claudianus.github.io/super-kimi-code/en/reference/kimi-command)
- [Interaction and approvals](https://claudianus.github.io/super-kimi-code/en/guides/interaction)
- [Sessions](https://claudianus.github.io/super-kimi-code/en/guides/sessions)
- [Using in IDEs](https://claudianus.github.io/super-kimi-code/en/guides/ides)

## 개발

요구사항: Node.js `>=24.15.0`, pnpm `10.33.0`.

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

## 커뮤니티

- [Issues](https://github.com/claudianus/super-kimi-code/issues)
- 보안 취약점은 [SECURITY.md](SECURITY.md)를 참고하세요.

## 감사의 말

Super Kimi Code는 Kimi Code 프로젝트와 [`pi-tui`](https://github.com/earendil-works/pi-mono/tree/main/packages/tui) 터미널 UI 기반 위에서 만들어졌습니다. 이 fork의 핵심은 그 기반을 숨기는 것이 아니라, 더 무거운 실전 사용에 필요한 reliability, routing, memory, workflow, research, TUI layer를 추가하는 것입니다.

## 라이선스

[MIT License](LICENSE)로 배포됩니다.
