<script setup lang="ts">
import '../assets/base.css'
//defineProps<{
//  msg: string
//}>()
</script>
<template>
  <div class="w-auto justify-center p-1.5 item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
    </div>
  </div>
</template>

<style scoped></style>
