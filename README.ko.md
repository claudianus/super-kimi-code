# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Docs](https://img.shields.io/badge/docs-online-blue)](https://claudianus.github.io/super-kimi-code/) <br>
[문서](https://claudianus.github.io/super-kimi-code/) · [이슈](https://github.com/claudianus/super-kimi-code/issues) · [English](README.md) · [中文](README.zh-CN.md)

![Super Kimi Code 사용 데모](./docs/media/intro.gif)

## 실제로 배포하는 사람을 위한 코딩 에이전트

Super Kimi Code CLI는 터미널에서 바로 쓰는 AI 코딩 에이전트입니다. 코드를 읽고 수정하고, shell 명령을 실행하고, 파일과 웹을 검색하고, 여러 하위 에이전트를 조율하며, 실행 결과를 보면서 다음 단계를 스스로 조정합니다.

이 fork는 매일 쓰는 작업 경험에 집중합니다. GitHub 소스에서 한 번에 설치하고, 더 빠르고 선명한 TUI로 작업하며, 여러 provider와 계정, API key를 등록하고, rate limit과 quota 상황에 맞춰 자동으로 fallback/routing/load-balancing할 수 있게 다듬었습니다.

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

처음 실행하면 `/login`으로 Kimi Code OAuth 또는 API key 기반 로그인을 설정하세요. 다른 provider를 연결하려면 TUI의 `/provider` 또는 비대화형 `kimi provider` 명령을 사용합니다.

```sh
kimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
kimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
kimi provider route status <sessionId>
```

첫 작업은 이렇게 시작하면 됩니다.

```
이 프로젝트의 주요 디렉터리를 읽고 각각 무엇을 하는지 설명해줘.
```

## 왜 Super Kimi Code인가

- **GitHub 소스 한 줄 설치**: 전역 패키지 충돌 없이 이 fork에서 바로 `skimi` 명령을 설치합니다.
- **빠르고 집중된 TUI**: 긴 에이전트 세션에 맞춰 상태, 제어, 테마, 코드 표시를 정돈했습니다.
- **provider 자유도**: Kimi, Anthropic, OpenAI 호환 provider, Google GenAI, Vertex AI, custom endpoint, catalog provider를 연결할 수 있습니다.
- **계정과 key pool**: provider마다 여러 API key 또는 OAuth 계정을 등록하고, label과 로컬 RPM/TPM limit을 붙이고, 상태 화면에서는 secret을 숨깁니다.
- **quota-aware routing**: `auto`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, `rate_limit_aware` 전략으로 건강한 credential과 fallback model을 자동 선택합니다.
- **운영 가시성**: `kimi provider doctor`, route preview, route status로 cooldown, quota, latency, 실제 선택된 provider/key/account를 확인합니다.
- **하위 에이전트와 Ultrawork**: planning, goal tracking, research, verification이 필요한 긴 작업을 더 깔끔하게 진행합니다.
- **에디터 연동**: `skimi acp`로 Zed, JetBrains, Agent Client Protocol 클라이언트에서 바로 세션을 구동합니다.

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

Super Kimi Code는 Kimi Code 프로젝트와 [`pi-tui`](https://github.com/earendil-works/pi-mono/tree/main/packages/tui) 터미널 UI 기반 위에서 만들어졌습니다. 이 fork가 확장하는 토대를 만든 원 저자와 기여자들에게 감사드립니다.

## 라이선스

[MIT License](LICENSE)로 배포됩니다.
