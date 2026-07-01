---
layout: home
hero:
  name: Super Kimi Code CLI
  text: Kimi Code 복제가 아닌 Super Kimi 운영 레이어
  tagline: Multi-account provider routing, quota-aware fallback, Context OS, Kimi Recall, Ultrawork, premium TUI, and source install in one CLI.
  actions:
    - theme: brand
      text: English docs
      link: en/
    - theme: alt
      text: 中文文档
      link: zh/
    - theme: alt
      text: 한국어 README
      link: https://github.com/claudianus/super-kimi-code/blob/main/README.ko.md
features:
  - title: Quota-aware operations
    details: 여러 provider, API key, OAuth 계정을 pool로 묶고 rate limit, quota, latency, cooldown 상태를 보며 자동 fallback routing을 수행합니다.
  - title: Long-task intelligence
    details: Ultrawork, Kimi Recall, Context OS compaction, local research fallback으로 큰 작업을 계획하고 검증하고 기억합니다.
  - title: Premium terminal experience
    details: source-installable skimi command, premium themes, bundled terminal palettes, clearer status surfaces, and ACP editor integration.
---

<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()

onMounted(() => {
  const lang = navigator.language || navigator.userLanguage || ''
  if (lang.startsWith('en')) {
    router.go(withBase('/en/'))
  } else if (lang.startsWith('zh')) {
    router.go(withBase('/zh/'))
  }
})
</script>

## 한국어

Super Kimi Code는 단순한 Kimi Code 리브랜딩이 아닙니다. upstream Kimi Code가 터미널 코딩 에이전트의 출발점이라면, Super Kimi Code는 실전 운영에서 필요한 계정 연동, API 연동, quota-aware routing, 장기 context 관리, memory, research, verification, premium TUI를 코드 레벨에서 확장한 fork입니다.

| 차이 | Super Kimi Code가 추가한 것 |
| --- | --- |
| 계정/API 연동 | 여러 provider, API key, OAuth account, custom endpoint, catalog provider, label, local RPM/TPM hint |
| 자동 fallback | auth, quota, rate-limit, timeout, server, connection, empty-response 실패 감지 후 cooldown과 route 재선택 |
| 라우팅 전략 | `auto`, `fallback`, `fill_first`, `round_robin`, `weighted_round_robin`, `least_used`, `lowest_latency`, `rate_limit_aware`, `random` |
| 장기 작업 | Ultrawork로 planning, research, goal, swarm, integrate, verify, learn 흐름을 실행 |
| 기억과 context | Kimi Recall memory와 Context OS compaction으로 긴 세션의 결정, 절차, 근거를 보존 |
| 사용감 | source install `skimi`, premium theme, bundled terminal palette, syntax color, 더 선명한 status surface |

## English

Super Kimi Code is not a skin over Kimi Code. It is an operator-focused fork that adds the production layer around a terminal coding agent: provider pools, quota-aware routing, live route health, Kimi Recall memory, Context OS compaction, Ultrawork, local research fallback, premium TUI themes, and source installation through `skimi`.

## 简体中文

Super Kimi Code 不是 Kimi Code 换皮。它在终端编码 Agent 之上加入实战运营层：多 provider、多 API key、多 OAuth account、quota-aware routing、实时 route health、Kimi Recall、Context OS compaction、Ultrawork、local research fallback、高级 TUI 主题，以及 `skimi` 源码安装。
