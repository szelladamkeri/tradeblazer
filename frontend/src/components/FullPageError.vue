<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true
  },
  errorType: {
    type: String,
    default: 'general' // 'general', 'connection', 'notFound', 'auth'
  }
});

const emit = defineEmits(['retry']);

const handleRetry = () => {
  emit('retry');
};

// Add handler for going back
const handleBack = () => {
  window.history.back();
};
</script>

<template>
  <div class="error-modal-overlay">
    <div class="error-modal-container">
      <!-- Logo or app name -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white">TradeBlazer</h1>
        <div class="h-0.5 w-16 bg-green-400 mx-auto mt-2"></div>
      </div>

      <!-- Error icon based on type -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
          <font-awesome-icon :icon="errorType === 'connection' ? 'server' :
            errorType === 'auth' ? 'lock' :
              errorType === 'notFound' ? 'search' : 'triangle-exclamation'" class="text-4xl text-red-400" />
        </div>

        <h2 class="text-xl font-bold text-white mb-2">
          {{ errorType === 'connection' ? 'Connection Error' :
            errorType === 'auth' ? 'Authentication Error' :
              errorType === 'notFound' ? 'Not Found' : 'Error' }}
        </h2>

        <!-- Main error message -->
        <p class="text-red-300 mb-6">{{ message }}</p>

        <!-- Helper text for server errors -->
        <div v-if="errorType === 'connection'" class="text-gray-400 text-sm mb-6 max-w-md">
          <p>This usually happens when the server is not running. Please check that:</p>
          <ul class="text-left mt-2 list-disc pl-5">
            <li>XAMPP is started and running</li>
            <li>MySQL and Apache services are active</li>
            <li>The backend server is running</li>
          </ul>
        </div>
      </div>

      <!-- Buttons - changed from single button to multiple buttons -->
      <div class="text-center flex flex-col sm:flex-row gap-3 justify-center">
        <button @click="handleBack" class="back-button">
          <font-awesome-icon icon="arrow-left" class="mr-2" />
          Go Back
        </button>
        <button @click="handleRetry" class="retry-button">
          <font-awesome-icon icon="rotate" class="mr-2" />
          Retry Connection
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(8, 11, 22, 0.4);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  animation: fadeIn 0.25s ease-out;
}

.error-modal-container {
  max-width: 28rem;
  width: 100%;
  background: rgba(18, 24, 38, 0.98);
  /* Solid, neutral dark background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  /* Neutral border */
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-origin: center;
  overflow: hidden;
  position: relative;
}

/* Remove the gradient overlay */
.error-modal-container::before {
  display: none;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background-color: rgb(34, 197, 94);
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  min-width: 10rem;
}

.retry-button:hover {
  background-color: rgb(22, 163, 74);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}

.retry-button:active {
  transform: translateY(0);
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: rgb(107, 114, 128);
  /* gray-500 */
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.15);
  min-width: 10rem;
}

.back-button:hover {
  background-color: rgb(75, 85, 99);
  /* gray-600 */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 114, 128, 0.25);
}

.back-button:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Media query adjustments for smaller screens */
@media (max-width: 640px) {
  .error-modal-container {
    padding: 1.5rem;
  }
}
</style>
