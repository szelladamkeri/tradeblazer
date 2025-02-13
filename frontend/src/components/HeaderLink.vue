<script setup lang="ts">
import '../assets/base.css'
//defineProps<{
//  msg: string
//}>()
</script>
<template>
  <div class="w-full">
    <div class="group p-2">
      <slot name="icon"></slot>
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

:deep(a),
:deep(button) {
  display: flex;
  align-items: center;
  gap: 2px;
  color: rgb(209 213 219); /* text-gray-300 */
}

:deep(a:hover),
:deep(button:hover) {
  color: rgb(34 197 94); /* text-green-400 */
}

:deep(a:hover *),
:deep(button:hover *) {
  color: rgb(34 197 94); /* text-green-400 */
}

:deep(button.text-red-400) {
  color: rgb(248 113 113); /* text-red-400 */
}

:deep(button.text-red-400:hover),
:deep(button.text-red-400:hover *) {
  color: rgb(252 165 165); /* text-red-300 */
}
</style>
