<script setup lang="ts">
import '../assets/base.css'
//defineProps<{
//  msg: string
//}>()
</script>
<template>
  <div class="w-full">
    <div class="hover:text-green-400 transition-colors p-2 cursor-pointer">
      <div class="flex items-center justify-center gap-2">
        <slot name="icon"></slot>
        <h3 class="text-sm sm:text-base font-semibold whitespace-nowrap">
          <slot name="heading"></slot>
        </h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-size: 1.2rem;
}
a {
  width: 100%;
  display: block;
}
</style>
