<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: true
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
  <div class="flex flex-col items-center justify-center py-8 px-4 bg-white/5 rounded-xl border border-red-500/20 max-w-lg mx-auto text-center">
    <!-- Error icon based on type -->
    <div class="mb-4 text-3xl" :class="{
      'text-red-400': errorType === 'connection' || errorType === 'general',
      'text-amber-400': errorType === 'auth',
      'text-blue-400': errorType === 'notFound'
    }">
      <font-awesome-icon 
        :icon="errorType === 'connection' ? 'server' : 
               errorType === 'auth' ? 'lock' :
               errorType === 'notFound' ? 'search' : 'triangle-exclamation'" />
    </div>
    
    <!-- Connection error helper text -->
    <div v-if="errorType === 'connection'" class="text-amber-400 text-sm mb-2 font-medium">
      Server connection error
    </div>
    
    <!-- Main error message -->
    <p class="text-red-300 mb-4">{{ message }}</p>
    
    <!-- Helper text for server errors -->
    <div v-if="errorType === 'connection'" class="text-gray-400 text-sm mb-4 max-w-md">
      <p>This usually happens when the XAMPP server is not running. Please check that:</p>
      <ul class="text-left mt-2 list-disc pl-5">
        <li>XAMPP is started and running</li>
        <li>MySQL and Apache services are active</li>
        <li>The backend server is running</li>
      </ul>
    </div>
    
    <!-- Retry button -->
    <button 
      v-if="showRetry"
      @click="handleRetry"
      class="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      <font-awesome-icon icon="rotate" class="mr-2" />
      Retry Connection
    </button>
  </div>
</template>
