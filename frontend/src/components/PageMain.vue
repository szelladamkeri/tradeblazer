<script setup lang="ts">
import '../assets/base.css'
</script>

<template>
  <main
    class="page-main bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl"
  >
    <slot></slot>
  </main>
</template>

<style scoped>
/* Fixed size consistent main container with widescreen format */
.page-main {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  height: 42rem !important; /* Increased height */
  min-height: 42rem !important;
  max-height: 42rem !important;
  width: 1366px !important; /* Wider width for widescreen look */
  min-width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  overflow: hidden; /* Don't show scrollbar by default */
}

/* Ensure content containers handle their own overflow */
:deep(.content-container) {
  height: 100%;
  overflow-y: auto;
}

:deep(.overflow-y-auto) {
  overflow-y: auto; /* Only show scrollbar when needed */
  -webkit-overflow-scrolling: touch;
}

/* Media query adjustments */
@media (max-width: 640px) {
  .page-main {
    height: 40rem !important; /* Increased height for mobile */
    min-height: 40rem !important;
    max-height: 40rem !important;
  }
}

/* Improve mobile responsiveness */
@media (max-width: 640px) {
  .page-main {
    height: calc(100vh - 11rem) !important;
    min-height: calc(100vh - 11rem) !important;
    max-height: calc(100vh - 11rem) !important;
    padding-bottom: 0 !important;
  }
  
  :deep(.overflow-y-auto) {
    -webkit-overflow-scrolling: touch;
  }
}

/* Ensure content takes full height */
:deep(.content-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* iOS fixes */
@supports (-webkit-touch-callout: none) {
  .page-main {
    height: calc(100vh - 11rem - env(safe-area-inset-bottom)) !important;
  }
}

/* Ensure bottom margin/padding doesn't push content up */
@media (max-width: 640px) {
  .page-main {
    margin-bottom: 1rem !important; 
    padding-bottom: 1.5rem !important;
    height: calc(100vh - 11rem) !important;
  }
  
  :deep(.overflow-y-auto > *:last-child) {
    margin-bottom: 2rem;
  }
}

/* Ensure main container takes full available height */
@media (max-height: 700px) {
  .page-main {
    height: calc(100vh - 8rem) !important;
    min-height: calc(100vh - 8rem) !important;
  }
}

/* Create container for content to prevent layout shifts */
:deep(.content-container) {
  min-height: inherit;
  position: relative;
}

/* Clean up scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  /* Always show scrollbar to prevent layout shifts */
  display: block;
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

/* Existing heading styles */
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

/* Add bottom space to content for mobile */
:deep(.overflow-y-auto > *:last-child) {
  margin-bottom: 1.5rem;
}

/* Media query adjustments for smaller screens */
@media (max-width: 1100px) {
  .page-main {
    width: 90vw !important; /* Fall back to responsive width on smaller screens */
    min-width: auto !important;
    max-width: 1024px !important;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .page-main {
    height: 36rem !important; /* Slightly smaller on mobile */
    min-height: 36rem !important;
    max-height: 36rem !important;
    width: calc(100vw - 2rem) !important;
    padding-bottom: 0 !important;
  }
}

/* Media query adjustments for smaller screens */
@media (max-width: 1400px) {
  .page-main {
    width: 95vw !important; /* Fall back to responsive width on smaller screens */
    min-width: auto !important;
    max-width: 1366px !important;
  }
}
</style>
