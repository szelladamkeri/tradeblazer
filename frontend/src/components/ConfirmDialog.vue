<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  confirmButtonClass?: string
  type?: 'delete' | 'update' // Add type prop
}>()

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="scale">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200" />
      <div
        class="bg-black/90 rounded-xl p-6 border border-green-500/20 max-w-md w-full scale-100 transition-all duration-200"
      >
        <h3 class="text-xl font-bold text-white mb-3">{{ title }}</h3>
        <p class="text-gray-300 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors text-white"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            :class="[
              'px-4 py-2 rounded transition-colors text-white',
              confirmButtonClass || 'bg-green-600 hover:bg-green-700',
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
