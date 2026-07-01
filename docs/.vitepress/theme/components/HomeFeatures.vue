<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { lang, frontmatter } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))
const isKo = computed(() => String(frontmatter.value.hero?.text ?? '').includes('Kimi Code 복제'))

interface Highlight {
  icon: string
  title: string
  desc: string
}

interface Feature {
  icon: string
  title: string
  desc: string
  href: string
}

const highlights = computed<Highlight[]>(() => isZh.value
  ? [
      {
        icon: '⇄',
        title: 'Quota-aware routing',
        desc: '多 provider、多 API key、多 OAuth account 形成 route pool，绕开 quota 与 rate limit。',
      },
      {
        icon: '◇',
        title: 'Context OS + Kimi Recall',
        desc: '长会话通过结构化 compaction、repair、rehydration 与 durable memory 保持清晰。',
      },
      {
        icon: '✓',
        title: 'Ultrawork verification',
        desc: '把 plan、research、goal、swarm、integrate、verify、learn 串成一个长任务流程。',
      },
    ]
  : isKo.value
    ? [
        {
          icon: '⇄',
          title: 'Quota-aware routing',
          desc: '여러 provider, API key, OAuth account를 route pool로 묶고 quota와 rate limit을 우회합니다.',
        },
        {
          icon: '◇',
          title: 'Context OS + Kimi Recall',
          desc: '긴 세션을 structured compaction, repair, rehydration, durable memory로 선명하게 유지합니다.',
        },
        {
          icon: '✓',
          title: 'Ultrawork verification',
          desc: 'plan, research, goal, swarm, integrate, verify, learn을 하나의 long-task workflow로 실행합니다.',
        },
      ]
  : [
      {
        icon: '⇄',
        title: 'Quota-aware routing',
        desc: 'Route across provider, API-key, and OAuth account pools while avoiding quota and rate-limit failures.',
      },
      {
        icon: '◇',
        title: 'Context OS + Kimi Recall',
        desc: 'Keep long sessions legible with structured compaction, repair, rehydration, and durable memory.',
      },
      {
        icon: '✓',
        title: 'Ultrawork verification',
        desc: 'Run planning, research, goals, swarm execution, integration, verification, and learning as one workflow.',
      },
    ])

const features = computed<Feature[]>(() => isZh.value
  ? [
      {
        icon: '01',
        title: 'Provider operations',
        desc: '管理 catalog provider、custom endpoint、API key pool、OAuth account、label、local limit 与 route health。',
        href: '/zh/configuration/providers',
      },
      {
        icon: '02',
        title: 'Long-running goals',
        desc: '用 goal 与 Ultrawork 把大任务拆成可验证的执行合同。',
        href: '/zh/guides/goals',
      },
      {
        icon: '03',
        title: 'Premium TUI themes',
        desc: '选择内置高级主题、导入 terminal palette，并保持代码高亮与状态可读。',
        href: '/zh/customization/themes',
      },
      {
        icon: '04',
        title: 'ACP editor use',
        desc: '通过 skimi acp 在兼容编辑器中运行同一个 Super Kimi 会话。',
        href: '/zh/guides/ides',
      }
    ]
  : isKo.value
    ? [
        {
          icon: '01',
          title: 'Provider operations',
          desc: 'catalog provider, custom endpoint, API key pool, OAuth account, label, local limit, route health를 관리합니다.',
          href: '/en/configuration/providers',
        },
        {
          icon: '02',
          title: 'Long-running goals',
          desc: 'goal과 Ultrawork로 큰 작업을 검증 가능한 실행 계약으로 바꿉니다.',
          href: '/en/guides/goals',
        },
        {
          icon: '03',
          title: 'Premium TUI themes',
          desc: '고급 theme, imported terminal palette, code highlight, status readability를 강화합니다.',
          href: '/en/customization/themes',
        },
        {
          icon: '04',
          title: 'ACP editor use',
          desc: 'skimi acp로 compatible editor에서 같은 Super Kimi session을 구동합니다.',
          href: '/en/guides/ides',
        }
      ]
  : [
      {
        icon: '01',
        title: 'Provider operations',
        desc: 'Manage catalog providers, custom endpoints, API-key pools, OAuth accounts, labels, local limits, and route health.',
        href: '/en/configuration/providers',
      },
      {
        icon: '02',
        title: 'Long-running goals',
        desc: 'Use goals and Ultrawork to turn large tasks into a verifiable execution contract.',
        href: '/en/guides/goals',
      },
      {
        icon: '03',
        title: 'Premium TUI themes',
        desc: 'Choose premium themes, import terminal palettes, and keep code highlighting and status surfaces readable.',
        href: '/en/customization/themes',
      },
      {
        icon: '04',
        title: 'ACP editor use',
        desc: 'Run the same Super Kimi session inside compatible editors with skimi acp.',
        href: '/en/guides/ides',
      }
    ])

const highlightsTitle = computed(() => isZh.value
  ? '为真实故障而设计'
  : isKo.value ? '실전 장애를 전제로 설계' : 'Designed for real failure modes')
const highlightsLede = computed(() => isZh.value
  ? 'Super Kimi Code 不是展示 demo 的 fork，而是为 quota、context、research、verification 和长期使用设计的运营层。'
  : isKo.value
    ? 'Super Kimi Code는 demo용 fork가 아니라 quota, context, research, verification, 장기 사용을 버티는 운영 레이어입니다.'
    : 'Super Kimi Code is not a demo fork. It is an operations layer for quota, context, research, verification, and long daily use.')

const featuresTitle = computed(() => isZh.value
  ? '超越上游的核心入口'
  : isKo.value ? 'upstream을 넘어선 핵심 진입점' : 'Core Entry Points Beyond Upstream')
const featuresLede = computed(() => isZh.value
  ? '从 provider operations 到 editor integration，Super Kimi 的新增能力都放在日常路径上。'
  : isKo.value
    ? 'provider operations부터 editor integration까지, Super Kimi의 추가 기능은 매일 쓰는 경로에 배치되어 있습니다.'
    : 'From provider operations to editor integration, the Super Kimi additions sit directly on the daily path.')

const ctaText = computed(() => isZh.value ? '查看' : isKo.value ? '보기' : 'Learn more')
</script>

<template>
  <section class="KimiHome__section KimiHighlights">
    <h2 class="KimiHome__sectionTitle">{{ highlightsTitle }}</h2>
    <p class="KimiHome__sectionLede">{{ highlightsLede }}</p>
    <div class="KimiHighlights__grid">
      <div
        v-for="h in highlights"
        :key="h.title"
        class="KimiHighlights__card"
      >
        <div class="KimiHighlights__icon" aria-hidden="true">{{ h.icon }}</div>
        <h3 class="KimiHighlights__title">{{ h.title }}</h3>
        <p class="KimiHighlights__desc">{{ h.desc }}</p>
      </div>
    </div>
  </section>

  <section class="KimiHome__section KimiFeatures">
    <h2 class="KimiHome__sectionTitle">{{ featuresTitle }}</h2>
    <p class="KimiHome__sectionLede">{{ featuresLede }}</p>
    <div class="KimiFeatures__grid">
      <a
        v-for="f in features"
        :key="f.title"
        class="KimiFeatures__card"
        :href="withBase(f.href)"
      >
        <div class="KimiFeatures__icon" aria-hidden="true">{{ f.icon }}</div>
        <h3 class="KimiFeatures__title">{{ f.title }}</h3>
        <p class="KimiFeatures__desc">{{ f.desc }}</p>
        <span class="KimiFeatures__cta">
          {{ ctaText }}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </a>
    </div>
  </section>
</template>

<style scoped>
/* === Highlights (top section: non-clickable product attributes) === */
.KimiHighlights__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 720px) {
  .KimiHighlights__grid {
    grid-template-columns: 1fr;
  }
}

.KimiHighlights__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 22px 22px 24px;
  border-radius: var(--kimi-radius-card);
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.KimiHighlights__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--kimi-brand-soft);
  font-size: 18px;
  margin-bottom: 14px;
}

.KimiHighlights__title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
  color: var(--vp-c-text-1);
}

.KimiHighlights__desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* === Features (bottom section: clickable extension points) === */
.KimiFeatures__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 1024px) {
  .KimiFeatures__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .KimiFeatures__grid {
    grid-template-columns: 1fr;
  }
}

.KimiFeatures__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 28px 24px 26px;
  border-radius: var(--kimi-radius-card);
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: transform var(--kimi-transition), border-color var(--kimi-transition),
              box-shadow var(--kimi-transition), background var(--kimi-transition);
  overflow: hidden;
}

.KimiFeatures__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--kimi-brand-gradient-soft);
  opacity: 0;
  transition: opacity var(--kimi-transition);
  pointer-events: none;
  border-radius: inherit;
}

.KimiFeatures__card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-3);
}
.KimiFeatures__card:hover::before {
  opacity: 1;
}

.KimiFeatures__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--kimi-brand-soft);
  font-size: 22px;
  margin-bottom: 18px;
}

.KimiFeatures__title {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
}

.KimiFeatures__desc {
  position: relative;
  z-index: 1;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 20px;
}

.KimiFeatures__cta {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-top: auto;
  transition: transform var(--kimi-transition);
}

.KimiFeatures__card:hover .KimiFeatures__cta {
  transform: translateX(3px);
}
</style>
