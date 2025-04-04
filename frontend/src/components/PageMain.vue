<script setup lang="ts">
import '../assets/base.css'
import { onMounted } from 'vue'
import { useWindowHeight } from '@/composables/useWindowHeight'

// Initialize window height utility
useWindowHeight()

onMounted(() => {
  document.querySelectorAll('.page-main').forEach((el) => {
    el.classList.add('fixed-height')
  })
})
</script>

<template>
  <div class="page-main-wrapper">
    <main class="page-main">
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
  max-width: 1280px !important; /* Match max-w-7xl */
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
}

@media (max-width: 1400px) {
  .page-main {
    width: 95vw !important;
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
