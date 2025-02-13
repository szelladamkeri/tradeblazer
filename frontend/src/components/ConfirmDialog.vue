<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
}>()

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
      <div class="fixed inset-0 transition-opacity">
        <div class="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
      </div>

      <div
        class="bg-black/90 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full backdrop-blur-xl border border-red-500/20"
      >
        <div class="p-6">
          <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="triangle-exclamation" class="text-red-400" />
            {{ title }}
          </h3>
          <p class="text-gray-300 mb-6">{{ message }}</p>

          <div class="flex justify-end space-x-3">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2 bg-black/50 border border-gray-600 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="$emit('confirm')"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
