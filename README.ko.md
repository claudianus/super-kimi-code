# Super Kimi Code CLI

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Site](https://img.shields.io/badge/site-online-blue)](https://claudianus.github.io/super-kimi-code/) <br>
[사이트](https://claudianus.github.io/super-kimi-code/) · [이슈](https://github.com/claudianus/super-kimi-code/issues) · [English](README.md) · [中文](README.zh-CN.md)

![Super Kimi Code command center](./site/assets/hero-command-center.png)

## 개발 흐름을 끝까지 이어가는 AI 코딩 에이전트

Super Kimi Code는 긴 소프트웨어 작업을 위한 독립 AI 코딩 에이전트입니다. 계획, 조사, 목표 관리, 병렬 실행, 검증, 기억, 프로젝트 문서화를 하나의 터미널 중심 작업 흐름으로 연결합니다.

이 제품은 context 품질, provider 가용성, 근거, release risk가 동시에 중요한 프로젝트 작업을 위해 만들어졌습니다. 결정은 추적 가능하게 남기고, 검증된 지식은 다시 사용할 수 있게 보존하며, 다음 단계가 더 분명한 출발점에서 시작되도록 돕습니다.

## 핵심 기능

| 기능 | 지원 내용 |
| --- | --- |
| UltraPlan | 요구사항, 제약, 위험을 실행 가능한 계획으로 정리합니다. |
| UltraResearch | API, 논문, 릴리스 노트, 보안 이슈를 확인하고 근거를 남깁니다. |
| UltraGoal | 목표, 예산, 완료 기준을 명확히 두어 장기 작업의 방향을 유지합니다. |
| UltraSwarm | 탐색, 구현, 검토, 문서 작업을 역할별 subagent에 나누어 진행합니다. |
| UltraWork | 계획, 조사, 역할 배정, 통합, 검증, 학습을 하나의 흐름으로 연결합니다. |
| Provider routing | API key와 OAuth account를 등록하고 quota, cooldown, latency, route health를 기준으로 fallback 후보를 선택합니다. |
| Kimi Recall | 프로젝트 사실, 결정, 절차, 후속 작업, governance rule을 보존합니다. |
| LLM Wiki | 코드베이스 지식, 조사 근거, 검증 결과를 다시 쓸 수 있는 프로젝트 문서로 정리합니다. |
| Context OS | structured working memory, repair, bounded rehydration으로 긴 세션을 관리합니다. |
| Premium themes | preset, 외부 terminal palette, syntax-aware color로 긴 터미널 세션의 가독성을 높입니다. |
| ACP support | 호환 editor에서 같은 Super Kimi workflow를 stdio 기반으로 이어갈 수 있습니다. |

## 설치

이 GitHub 소스 저장소에서 설치합니다. Git과 Node.js `>=24.15.0`이 필요하며, Corepack이 `package.json`에 고정된 pnpm 버전을 사용합니다.

**macOS 또는 Linux**

```sh
curl -fsSL https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.sh | bash
```

**Windows PowerShell**

```powershell
irm https://raw.githubusercontent.com/claudianus/super-kimi-code/main/install.ps1 | iex
```

> Windows에서는 첫 실행 전에 [Git for Windows](https://gitforwindows.org/)를 설치하세요. Super Kimi Code는 Git Bash를 shell 환경으로 사용합니다. Git Bash를 표준 위치가 아닌 곳에 설치했다면 `KIMI_SHELL_PATH`에 `bash.exe`의 절대 경로를 지정하세요.

새 shell을 열고 명령을 확인합니다.

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

처음 실행하면 `/login`으로 OAuth 계정 또는 API key 기반 provider를 연결하세요. provider와 route 후보를 추가하려면 TUI의 `/provider` 또는 비대화형 명령을 사용합니다.

```sh
skimi provider catalog add anthropic --api-key-env ANTHROPIC_API_KEY
skimi provider key add openai --api-key-env OPENAI_BACKUP_KEY --label backup --auto-route
skimi provider route preview <modelAlias>
skimi provider route status <sessionId>
```

큰 구현 작업은 UltraWork로 시작합니다.

```sh
skimi -p "/ultrawork 이 repo를 audit하고, migration plan을 세우고, 구현하고, 검증하고, release risk를 요약해줘."
```

또는 TUI에서 이렇게 요청하세요.

```text
UltraWork를 사용해. 이 프로젝트를 분석하고, 가장 안전한 migration path를 찾고, 구현하고, 검증하고, 중요한 결정은 memory에 남겨줘.
```

## 에디터에서 사용

Super Kimi Code는 Agent Client Protocol을 지원합니다. 한 번 로그인한 뒤 에디터가 `skimi acp`를 실행하도록 설정하면 됩니다.

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

- [한국어 사이트](https://claudianus.github.io/super-kimi-code/)
- [English site](https://claudianus.github.io/super-kimi-code/en/)
- [中文站点](https://claudianus.github.io/super-kimi-code/zh/)

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

## 라이선스

[MIT License](LICENSE)로 배포됩니다.
