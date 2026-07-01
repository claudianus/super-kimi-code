---
layout: home
hero:
  name: Super Kimi Code CLI
  text: 터미널에서 실제로 배포하는 사람을 위한 AI coding agent
  tagline: Provider freedom, quota-aware routing, premium TUI, and long-running agent workflows in one source-installable CLI.
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
  - title: 한국어
    details: GitHub 소스에서 한 줄로 설치하고, 여러 provider와 계정을 연결하며, rate limit과 quota에 맞춰 자동 fallback/routing을 수행합니다.
  - title: English
    details: A terminal-native coding agent with provider pools, live route health, custom endpoints, ACP editor integration, and polished TUI workflows.
  - title: 简体中文
    details: 支持多 provider、多 API key、多 OAuth 账号、quota-aware routing、实时 route status，以及面向长任务的高效 TUI 工作流。
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
