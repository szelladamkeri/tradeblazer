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
/* Global overrides for full-width layout with proper gradient */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh !important;
  width: 100% !important;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.95), rgba(8, 11, 22, 0.98)) !important;
  background-attachment: fixed !important;
  color: white;
  height: 100%;
  overflow-x: hidden !important;
}

/* Reset padding and margin for top-level elements */
body, html {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 100vh !important;
}

/* Override #app constraints */
#app {
  max-width: none !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
}

/* Make sure all content is full width by default */
.router-view, main, header {
  width: 100% !important;
  max-width: 100% !important;
  border-radius: 0 !important;
}

/* Override any remaining bordered containers */
.page-main, .component-global-wrapper, .page-header, .page-header-wrapper {
  border-radius: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Ensure consistent layout and width for both main and header */
.page-header-wrapper, .page-main-wrapper {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  box-sizing: border-box !important;
}

.page-header, .page-main {
  width: 100% !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: hidden;
}

@media (max-width: 1400px) {
  .page-header, .page-main {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 1100px) {
  .page-header, .page-main {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 640px) {
  .page-header, .page-main {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
  
  .page-header-wrapper {
    padding-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .mx-auto {
    padding-bottom: 2rem !important;
  }
}

/* Centered app container - updated for full width */
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
  padding-top: 0.5rem !important; /* Add space at top of app */
}

/* Add bottom padding to ensure content isn't flush with the bottom */
.mx-auto {
  padding-bottom: 1.5rem !important;
}

@media (max-width: 640px) {
  .mx-auto {
    padding-bottom: 2rem !important;
  }
}

/* Force consistent styling for all views */
.page-header, .page-main {
  width: 100% !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: hidden;
  box-sizing: border-box !important;
}

/* Ensure wrapper consistency */
.component-global-wrapper {
  padding-top: 1rem !important;
  margin-bottom: 1rem !important;
}

/* Reset any decorative elements that might conflict */
.page-header header::before,
.page-header header::after,
header::before,
header::after {
  display: none !important;
}

/* Fix z-index issues for dropdowns */
.page-header {
  z-index: 50 !important;
  overflow: visible !important; /* Allow dropdowns to be visible */
  position: relative !important;
}

/* Reset any problematic pointer-events styles */
body * {
  pointer-events: auto !important;
}

/* Fix avatar dropdown positioning */
[v-show*="showProfileDropdown"] {
  z-index: 100 !important;
  pointer-events: auto !important;
}

/* Ensure all headers allow dropdowns to overflow */
header, .page-header, .page-header-wrapper {
  overflow: visible !important;
}
</style>

<style scoped>
/* Centered app container - updated for full width */
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

header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

/* Add bottom padding to ensure content isn't flush with the bottom */
.mx-auto {
  padding-bottom: 1.5rem !important;
}

@media (max-width: 640px) {
  .mx-auto {
    padding-bottom: 2rem !important;
  }
}

/* Global styles for proper centering */
html, body {
  height: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

/* Centered app container */
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  max-width: 100% !important;
  padding: 0;
  margin: 0;
}

@media (max-width: 640px) {
  .app-container {
    padding: 0;
    min-height: 100vh;
    /* Fix iOS viewport height issues */
    min-height: -webkit-fill-available;
    overflow-x: hidden;
  }
  
  /* Better spacing for fixed elements on mobile */
  .mx-auto {
    padding-bottom: 0 !important;
  }
}

/* Fix touch target sizes on mobile */
@media (max-width: 640px) {
  button, 
  a, 
  [role="button"],
  input[type="submit"],
  input[type="button"] {
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem;
  }
}

/* Make sure RouterView takes full height */
.router-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Fix for mobile iOS */
@supports (-webkit-touch-callout: none) {
  .app-container {
    height: -webkit-fill-available;
  }
}

@media (max-width: 640px) {
  .app-container {
    padding: 0.5rem 0;
  }
}

/* Fixed layout structure to prevent inconsistencies */
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .app-container {
    padding: 0;
  }
}

/* Set consistent sizing across the whole app */
:root {
  --header-height: 4rem;
  --main-height: 42rem; /* Increased height to match PageMain */
  --total-height: calc(var(--header-height) + var(--main-height) + 2rem);
  --app-width: 1366px; /* Wider fixed width for widescreen look */
  --vh: 1vh; /* Fix for iOS viewport height */
}

@media (max-width: 1400px) {
  :root {
    --app-width: 95vw;
  }
}

@media (max-width: 1100px) {
  :root {
    --app-width: 95vw;
  }
}

@media (max-width: 640px) {
  :root {
    --header-height: 3.5rem;
    --main-height: calc(100vh - var(--header-height));
    --app-width: 100%;
    --total-height: 100vh;
  }
  
  .app-container {
    padding: 0;
  }
}

/* Add gradient background to the entire app */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: #051224 !important; /* Dark blue for trading platform */
  background-attachment: fixed !important;
  overflow-x: hidden;
}

/* Remove background image if it exists */
body[style*="background-image"] {
  background-image: none !important;
}
</style>
