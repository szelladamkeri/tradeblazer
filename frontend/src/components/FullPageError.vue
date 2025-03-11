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
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4">
    <div class="max-w-md w-full bg-white/5 rounded-xl border border-red-500/20 p-8 backdrop-blur-xl">
      <!-- Logo or app name -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white">TradeBlazer</h1>
        <div class="h-0.5 w-16 bg-green-400 mx-auto mt-2"></div>
      </div>
      
      <!-- Error icon based on type -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
          <font-awesome-icon 
            :icon="errorType === 'connection' ? 'server' : 
                  errorType === 'auth' ? 'lock' :
                  errorType === 'notFound' ? 'search' : 'triangle-exclamation'"
            class="text-4xl text-red-400" />
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
      
      <!-- Single retry button -->
      <div class="text-center">
        <button 
          @click="handleRetry"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors w-full sm:w-auto"
        >
          <font-awesome-icon icon="rotate" class="mr-2" />
          Retry Connection
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glass effect */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Add pulsing animation to the retry button */
button {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}
</style>
