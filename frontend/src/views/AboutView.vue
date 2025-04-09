<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'

const { t } = useI18n()

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement;
  const rect = main.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  
  main.style.setProperty('--mouse-x', `${x}%`);
  main.style.setProperty('--mouse-y', `${y}%`);
};
</script>

<template>
  <div class="about-view view-container">
    <PageHeader @mousemove="handleMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full max-w-7xl mx-auto p-8 md:p-12 lg:p-16 xl:p-16">
        <div class="space-y-8">
          <h1 class="text-3xl font-bold text-white">{{ t('about.title') }}</h1>
          <div class="prose prose-invert">
            <p>
              {{ t('about.description') }}
            </p>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
/* Add interactive gradient effect */
:deep(.page-main)::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(74, 222, 128, 0.08) 0%,
    transparent 60%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 1;
  border-radius: 0.75rem;
}

:deep(.page-main):hover::after {
  opacity: 1;
}

/* Ensure consistent styling with other views */
.about-view {
  height: auto !important;
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  padding-top: 0 !important;
}

/* Add consistent responsiveness */
@media (max-width: 1400px) {
  :deep(.page-header), :deep(.page-main) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 1100px) {
  :deep(.page-header), :deep(.page-main) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 640px) {
  :deep(.page-header), :deep(.page-main) {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
}

/* Fix prose styling for dark theme */
.prose {
  color: rgba(255, 255, 255, 0.7);
}

.prose p {
  margin-bottom: 1.5rem;
}
</style>
