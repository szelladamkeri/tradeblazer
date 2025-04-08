<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AnimatedBackground from './components/AnimatedBackground.vue'
</script>

<template>
  <div class="app-container relative h-screen">
    <AnimatedBackground />
    <RouterView class="w-full relative z-10" />
  </div>
</template>

<style>
/* Global core styles */
:root {
  --z-background: 1;
  --z-base: 10;
  --z-content: 20;
  --z-header: 50;
  --z-dropdown: 60;
  --z-mobile-menu: 70;
  --z-modal: 100;
  --z-dialog: 150;
  --header-height: 4rem;
  --main-height: 42rem;
  --total-height: calc(var(--header-height) + var(--main-height) + 2rem);
  --app-width: 1280px;
}

/* Base layout resets */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh !important;
  width: 100% !important;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.95), rgba(8, 11, 22, 0.98)) !important;
  background-attachment: fixed !important;
  color: white;
  overflow-x: hidden !important;
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

/* Core app layout */
#app {
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  min-height: 100vh !important;
}

/* Base layout containers */
.app-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  isolation: isolate;
}

/* Page layout */
.page-header,
.page-main {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Responsive breakpoints */
@media (max-width: 1400px) {

  .page-header,
  .page-main {
    width: 95vw;
    max-width: 95vw;
  }
}

@media (max-width: 1100px) {

  .page-header,
  .page-main {
    width: 95vw;
    max-width: 95vw;
  }
}

@media (max-width: 640px) {

  .page-header,
  .page-main {
    width: calc(100vw - 2rem);
    max-width: calc(100vw - 2rem);
  }
}

/* iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  .app-container {
    height: -webkit-fill-available;
  }
}

/* Core layout */
#app {
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  min-height: 100vh !important;
  padding: 0 !important;
  margin: 0 auto !important;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.95), rgba(8, 11, 22, 0.98)) !important;
}

/* Page layout containers */
.view-container {
  width: 100% !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  padding: 0 1rem !important;
  box-sizing: border-box !important;
}

/* Responsive breakpoints */
@media (max-width: 1400px) {
  .view-container {
    max-width: 95vw !important;
  }
}

@media (max-width: 640px) {
  .view-container {
    padding: 0 0.5rem !important;
  }
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100% !important;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
}

@media (max-width: 640px) {
  .app-container {
    padding: 0;
    min-height: -webkit-fill-available;
  }
}
</style>
