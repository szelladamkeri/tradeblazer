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
  <main class="page-main fixed-height w-full relative">
    <!-- Simple trading platform container -->
    <div class="trading-container">
      <slot></slot>
    </div>
  </main>
</template>

<style scoped>
/* Trading platform styling */
.page-main {
  width: 100% !important;
  max-width: 1366px !important;
  margin: 0 auto !important;
  position: relative;
  z-index: 10;
  background: transparent !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Trading container */
.trading-container {
  width: 100%;
  height: 100%;
  max-width: 100%;
  position: relative;
  padding: 1rem;
}

/* Fixed height class */
.fixed-height {
  height: var(--view-height) !important;
  min-height: var(--view-height) !important;
  max-height: var(--view-height) !important;
}

/* Global variables */
:root {
  --view-height: calc(100vh - 4rem);
}

@media (max-width: 640px) {
  :root {
    --view-height: calc(100vh - 4.5rem);
  }
  
  .trading-container {
    padding: 0.5rem;
  }
}
</style>
