<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'

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
  <div class="not-found-view view-container">
    <PageHeader @mousemove="handleMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
        <div class="max-w-md w-full px-4 text-center">
          <div class="space-y-8">
            <div class="flex flex-col items-center">
              <div class="w-24 h-24 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <font-awesome-icon icon="question-circle" class="text-4xl text-green-400" />
              </div>
              <h1 class="text-4xl sm:text-6xl font-bold text-white">404</h1>
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-300 mt-4">Page Not Found</h2>
              <p class="text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
            </div>
            <router-link
              to="/"
              class="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Return to Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
body {
  background-image: url();
  background-color: var(--vt-c-black-mute);
}

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
.not-found-view {
  height: auto !important;
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  padding-top: 0 !important;
}

/* Media query adjustments for smaller screens */
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
</style>
