<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HomeView from './views/HomeView.vue'
</script>

<template>
  <div class="app-container mx-auto w-screen min-h-screen flex items-center justify-center px-4">
    <RouterView class="w-full" />
  </div>
</template>

<style scoped>
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
}

/* Centered app container */
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .app-container {
    padding: 0.5rem 0;
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
  width: 100vw;
  padding: 1rem 0;
}

/* Set consistent sizing across the whole app */
:root {
  --header-height: 4rem;
  --main-height: 42rem; /* Increased height to match PageMain */
  --total-height: calc(var(--header-height) + var(--main-height) + 2rem);
  --app-width: 1366px; /* Wider fixed width for widescreen look */
}

@media (max-width: 1400px) {
  :root {
    --app-width: 95vw;
  }
}

@media (max-width: 1100px) {
  :root {
    --app-width: 90vw;
  }
}

@media (max-width: 640px) {
  :root {
    --header-height: 3.5rem;
    --main-height: 40rem; /* Increased height for mobile */
    --app-width: calc(100vw - 2rem);
    --total-height: calc(var(--header-height) + var(--main-height) + 1.5rem);
  }
  
  .app-container {
    padding: 0.5rem 0;
  }
}
</style>
