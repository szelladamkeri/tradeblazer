<script setup lang="ts">
import '../assets/base.css'
import { onMounted } from 'vue'
import { useWindowHeight } from '@/composables/useWindowHeight'

// Initialize window height utility
useWindowHeight()

onMounted(() => {
  // Force consistent height on all page-main elements
  document.querySelectorAll('.page-main').forEach((el) => {
    el.classList.add('fixed-height')
  })
})
</script>

<template>
  <div class="component-global-wrapper">
    <main class="page-main fixed-height bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl">
      <slot></slot>
    </main>
  </div>
</template>

<style>
/* Global height definition - put in global scope */
:root {
  --view-height: 42rem;
}

@media (max-width: 640px) {
  :root {
    --view-height: calc(100vh - 4.5rem);
  }
}
</style>

<style scoped>
/* Global wrapper class to ensure identical positioning */
.component-global-wrapper {
  width: 100% !important; 
  display: flex !important;
  justify-content: center !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

/* Fixed height class to enforce consistency */
.fixed-height {
  height: var(--view-height) !important;
  min-height: var(--view-height) !important;
  max-height: var(--view-height) !important;
}

/* Base styling for the main container */
.page-main {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto !important;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 0.75rem;
}

/* Media query adjustments - high specificity selectors */
@media (max-width: 1400px) {
  .component-global-wrapper .page-main {
    width: 95vw !important;
    min-width: auto !important;
    max-width: 1366px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

@media (max-width: 1100px) {
  .component-global-wrapper .page-main {
    width: 95vw !important;
    min-width: auto !important;
    max-width: 1024px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

/* Explicit tablet media query with highest specificity - Updated for better centering */
@media (min-width: 641px) and (max-width: 1024px) {
  .component-global-wrapper {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    padding: 0 1rem !important;
    box-sizing: border-box !important;
  }
  
  .component-global-wrapper .page-main {
    width: 100% !important;
    max-width: 95vw !important;
    margin-left: auto !important;
    margin-right: auto !important;
    min-height: 52rem !important; /* Further increased height for tablet mode */
    height: calc(100vh - 5.5rem) !important; /* Adjust height calculation for tablets */
  }
}

/* Additional breakpoint to handle the transition better */
@media (min-width: 768px) and (max-width: 1024px) {
  .component-global-wrapper .page-main {
    max-width: 90vw !important;
  }
}

/* Tablet-specific adjustments */
@media (max-width: 900px) and (min-width: 641px) {
  .page-main {
    min-height: 48rem;
  }
}

/* Mobile adjustments - Completely revised */
@media (max-width: 640px) {
  .page-main {
    /* Improved height calculation with minimum height safeguard */
    height: var(--view-height) !important;
    min-height: var(--view-height) !important;
    max-height: var(--view-height) !important;
    width: calc(100vw - 2rem) !important;
    min-width: auto !important;
    max-width: 100% !important;
    border-radius: 0.75rem;
    margin: 0 auto !important;
  }
}

/* Extra small devices */
@media (max-width: 380px) {
  .page-main {
    min-height: 28rem;
    width: calc(100vw - 1.5rem);
  }
}

/* Content container styling */
:deep(.content-container) {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.overflow-y-auto) {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Improve scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Add bottom padding to content for better spacing */
:deep(.overflow-y-auto > *:last-child) {
  margin-bottom: 1.5rem;
}

/* Fix iOS-specific height issues */
@supports (-webkit-touch-callout: none) {
  .fixed-height {
    height: calc(var(--view-height) - env(safe-area-inset-bottom)) !important;
  }
}

/* Landscape mode adjustments */
@media (max-height: 500px) and (orientation: landscape) {
  .page-main {
    height: calc(100vh - 3.5rem);
    min-height: 24rem;
  }
}
</style>
