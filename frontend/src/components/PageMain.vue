<script setup lang="ts">
import '../assets/base.css'
//defineProps<{
//  msg: string
//}>()
</script>

<template>
  <main
    class="w-full max-w-7xl mx-auto min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-7rem)] bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl"
  >
    <slot></slot>
  </main>
</template>

<style scoped>
main {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
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
