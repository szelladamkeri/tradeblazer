<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  title: string;
  icon: string;
}>();
</script>

<template>
  <div class="dashboard-panel">
    <div class="panel-inner">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium text-white flex items-center gap-2 glow-text">
          <font-awesome-icon :icon="icon" class="panel-icon" />
          {{ title }}
        </h2>
      </div>
      
      <!-- Panel content with stricter overflow control -->
      <div class="content-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-panel {
  position: relative;
  height: 290px;
  border-radius: 0.75rem;
  overflow: hidden;
  width: 100%;
}

.panel-inner {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  width: 100%;
  height: 100%;
  overflow: hidden;
  max-width: 100%; /* Ensure panel doesn't overflow */
}

.content-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 30px);
}

.panel-inner:hover {
  border-color: rgba(74, 222, 128, 0.3);
  transform: translateY(-2px);
}

.glow-text {
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
}

.panel-icon {
  color: rgb(74, 222, 128);
  font-size: 1.25rem;
}

/* Extra small screens (phones) */
@media (max-width: 479px) {
  .dashboard-panel {
    height: 240px;
  }
  
  .panel-inner {
    padding: 0.75rem;
  }
  
  .content-container {
    max-height: calc(100% - 25px);
  }
}

/* Small screens (large phones) */
@media (min-width: 480px) and (max-width: 639px) {
  .dashboard-panel {
    height: 260px;
  }
  
  .content-container {
    max-height: calc(100% - 28px);
  }
}

/* Medium screens (tablets) */
@media (min-width: 640px) and (max-width: 1023px) {
  .dashboard-panel {
    height: 280px;
    max-height: 280px;
  }
  
  .panel-inner {
    padding: 0.875rem;
  }
  
  .content-container {
    max-height: calc(100% - 30px);
  }
}
</style> 