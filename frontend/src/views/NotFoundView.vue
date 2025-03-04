<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
</script>

<template>
  <PageHeader class="mb-4" />
  <PageMain
    class="w-full flex flex-col bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center max-w-7xl mx-auto overflow-hidden"
  >
    <div class="text-center space-y-4">
      <h1 class="text-4xl sm:text-6xl font-bold text-white">404</h1>
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-300">Page Not Found</h2>
      <p class="text-gray-400">The page you're looking for doesn't exist.</p>
      <router-link
        to="/"
        class="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Return to Dashboard
      </router-link>
    </div>
  </PageMain>
</template>

<style scoped>
body {
  background-image: url();
  background-color: var(--vt-c-black-mute);
}

/* Media query adjustments for smaller screens */
@media (max-width: 1400px) {
  .page-header {
    width: 95vw !important;
    max-width: 1366px !important;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 90vw !important;
    max-width: 1024px !important;
  }
}

@media (max-width: 640px) {
  .page-header {
    height: 3.5rem;
    width: calc(100vw - 2rem) !important;
  }
}
</style>
