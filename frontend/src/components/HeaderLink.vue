<script setup lang="ts">
import '../assets/base.css'
</script>

<template>
  <div class="header-link">
    <div class="group">
      <slot name="icon"></slot>
    </div>
  </div>
</template>

<style scoped>
.header-link {
  flex-shrink: 0;
  width: 100%;
}

:deep(a),
:deep(button) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(209, 213, 219); /* text-gray-300 */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  width: 100%;
}

/* Desktop-specific hover effects */
@media (min-width: 640px) {
  :deep(a:hover),
  :deep(button:hover) {
    color: rgb(74, 222, 128); /* text-green-400 */
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
  }

  .header-link {
    width: auto;
  }
}

/* Active route styling */
:deep(a.router-link-active) {
  color: rgb(74, 222, 128); /* text-green-400 */
  background: rgba(74, 222, 128, 0.1);
}

/* Special button colors */
:deep(button.text-red-400) {
  color: rgb(248, 113, 113); /* text-red-400 */
}

:deep(button.text-red-400:hover) {
  color: rgb(252, 165, 165); /* text-red-300 */
}

/* Group container */
.group {
  display: flex;
  align-items: center;
  width: 100%;
}

/* Prevent text wrapping */
:deep(span) {
  white-space: nowrap;
}

/* Active state styling */
:deep(a:active),
:deep(button:active) {
  transform: scale(0.98);
}
</style>
