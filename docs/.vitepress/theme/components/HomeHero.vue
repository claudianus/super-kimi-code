<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'
import KimiLogo from './KimiLogo.vue'

interface HeroAction {
  theme?: string
  text: string
  link: string
}

const { frontmatter } = useData()

const hero = computed(() => frontmatter.value.hero ?? {})
const actions = computed<HeroAction[]>(() => hero.value.actions ?? [])

function resolveHref(link: string): string {
  return /^https?:\/\//.test(link) ? link : withBase(link)
}
</script>

<template>
  <section class="KimiHero">
    <div class="KimiHero__halo" aria-hidden="true" />
    <div class="KimiHero__inner">
      <div class="KimiHero__logo">
        <KimiLogo :size="64" />
      </div>
      <h1 class="KimiHero__title">
        Super Kimi <span class="KimiHero__accent">Code</span> CLI
      </h1>
      <p class="KimiHero__tagline">{{ hero.text }}</p>
      <p class="KimiHero__subtagline">{{ hero.tagline }}</p>
      <div class="KimiHero__actions">
        <a
          v-for="action in actions"
          :key="action.text"
          :class="['KimiBtn', action.theme === 'brand' ? 'KimiBtn--primary' : 'KimiBtn--ghost']"
          :href="resolveHref(action.link)"
          :target="/^https?:\/\//.test(action.link) ? '_blank' : undefined"
          :rel="/^https?:\/\//.test(action.link) ? 'noopener' : undefined"
        >
          {{ action.text }}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.KimiHero {
  position: relative;
  padding: clamp(72px, 12vw, 140px) 0 clamp(48px, 8vw, 96px);
  overflow: hidden;
}

.KimiHero__halo {
  position: absolute;
  top: -120px;
  left: 50%;
  width: 900px;
  height: 600px;
  transform: translateX(-50%);
  background:
    radial-gradient(closest-side, rgba(10, 122, 255, 0.22), transparent 70%),
    radial-gradient(closest-side, rgba(129, 196, 255, 0.20) 30%, transparent 75%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
}
:global(.dark) .KimiHero__halo {
  opacity: 0.85;
  background:
    radial-gradient(closest-side, rgba(61, 149, 255, 0.36), transparent 70%),
    radial-gradient(closest-side, rgba(129, 196, 255, 0.30) 30%, transparent 75%);
}

.KimiHero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.KimiHero__logo {
  margin-bottom: 28px;
  filter: drop-shadow(0 12px 32px rgba(10, 122, 255, 0.28));
}

.KimiHero__title {
  font-size: 76px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.05;
  margin: 0 0 18px;
  color: var(--vp-c-text-1);
  max-width: 18ch;
}

.KimiHero__accent {
  background: var(--kimi-brand-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.KimiHero__tagline {
  font-size: 22px;
  font-weight: 640;
  line-height: 1.55;
  color: var(--vp-c-text-1);
  max-width: 760px;
  margin: 0 0 12px;
}

.KimiHero__subtagline {
  font-size: 17px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  max-width: 820px;
  margin: 0 0 40px;
}

.KimiHero__actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 480px) {
  .KimiHero__title {
    font-size: 42px;
  }
  .KimiHero__tagline {
    font-size: 18px;
  }
  .KimiHero__subtagline {
    font-size: 15px;
  }
  .KimiHero__actions {
    width: 100%;
    flex-direction: column;
  }
  .KimiHero__actions .KimiBtn {
    width: 100%;
  }
}
</style>
