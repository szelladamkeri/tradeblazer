<script setup lang="ts">
import '../assets/base.css'
import { onMounted } from 'vue'
import { useWindowHeight } from '@/composables/useWindowHeight'

// Initialize window height utility
useWindowHeight()

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement;
  const rect = main.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  main.style.setProperty('--mouse-x', `${x}%`);
  main.style.setProperty('--mouse-y', `${y}%`);
};

onMounted(() => {
  document.querySelectorAll('.page-main').forEach((el) => {
    el.classList.add('fixed-height')
  })
})
</script>

<template>
  <div class="page-main-wrapper">
    <main class="page-main" @mousemove="handleMouseMove">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.page-main-wrapper {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

.page-main {
  width: 100% !important;
  max-width: 1280px !important;
  /* Match max-w-7xl */
  margin: 0 auto !important;
  box-sizing: border-box !important;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  flex: 1;
  z-index: 10;
  /* Lower than header's z-index of 50 */
}

/* Interactive gradient effect */
.page-main::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(74, 222, 128, 0.08) 0%,
      transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 1;
  border-radius: 0.75rem;
}

.page-main:hover::after {
  opacity: 1;
}

/* Content alignment */
:deep(.page-content) {
  width: 100% !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 1rem !important;
  box-sizing: border-box !important;
}

/* Consistent responsive breakpoints */
@media (max-width: 1400px) {
  .page-main {
    width: 95vw !important;
    max-width: 95vw !important;
  }

  :deep(.page-content) {
    max-width: 95vw !important;
  }
}

@media (max-width: 1100px) {
  .page-main {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 640px) {
  .page-main {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
}
</style>
