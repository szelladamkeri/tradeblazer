<script setup lang="ts">
import '../assets/base.css'
</script>

<template>
  <main
    class="w-full max-w-7xl mx-auto h-[calc(100vh-12rem)] sm:h-[calc(100vh-7rem)] bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl overflow-y-auto"
  >
    <slot></slot>
  </main>
</template>

<style scoped>
main {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
}

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

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}
</style>
