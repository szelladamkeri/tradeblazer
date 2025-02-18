<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  message: string
  confirmText: string
  confirmButtonClass?: string
  type?: 'delete' | 'update'
  zIndex?: number
}>()

const emit = defineEmits(['confirm', 'cancel'])
const isVisible = ref(false)
const isLeaving = ref(false)

watch(
  () => props.show,
  (newValue) => {
    isVisible.value = newValue
  },
  { immediate: true },
)

const handleConfirm = () => {
  emit('confirm')
  isVisible.value = false
}

const handleCancel = () => {
  emit('cancel')
  isVisible.value = false
}
</script>

<template>
  <Transition
    enter-from-class="opacity-0"
    enter-active-class="transition-all duration-200"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-active-class="transition-all duration-200"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0" :style="{ zIndex: zIndex || 200 }">
      <!-- Update backdrop opacity and blur -->
      <div class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>

      <!-- Dialog Container -->
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <!-- Dialog Box with updated background -->
        <div
          :class="{
            'animate-slideIn': !isLeaving,
            'animate-slideOut': isLeaving,
          }"
          class="relative max-w-md w-full mx-auto bg-black/95 rounded-xl overflow-hidden shadow-2xl border border-white/10"
        >
          <!-- Header -->
          <div
            class="p-6 border-b border-white/10"
            :class="type === 'delete' ? 'bg-red-500/10' : 'bg-green-500/10'"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="
                  type === 'delete'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                "
              >
                <font-awesome-icon :icon="type === 'delete' ? 'trash' : 'pen'" class="text-xl" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-1">{{ title }}</h3>
                <p class="text-sm text-gray-400">{{ message }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 flex gap-3 justify-end">
            <button
              @click="handleCancel"
              class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200',
                confirmButtonClass ||
                  (type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'),
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animate-slideIn {
  animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-slideOut {
  animation: slideOut 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-fadeOut {
  animation: fadeOut 0.2s ease-out;
}

/* Custom border glow effect for delete/update */
.border-white\/10 {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

/* Improve button focus states */
button:focus {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
}

/* Add glass effect */
.from-gray-900\/95 {
  background: linear-gradient(to bottom, rgba(17, 24, 39, 0.95), rgba(0, 0, 0, 0.95));
}

/* Ensure sharp text */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure backdrop blur works */
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Update backdrop blur */
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
}

/* Add glass effect */
.bg-black\/95 {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.98));
}

/* Update button hover effects */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0px);
}

/* Sharper text rendering */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Update background opacity */
.bg-black\/90 {
  background-color: rgba(0, 0, 0, 0.9);
}

.bg-black\/95 {
  background-color: rgba(0, 0, 0, 0.95);
}
</style>
