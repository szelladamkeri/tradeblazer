<template>
  <div class="flex items-center justify-center animate-fade-in">
    <div
      class="w-8 h-8 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin"
    ></div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
