<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref } from 'vue';

const showPlaceholder = ref(true);
const toggleChart = () => {
  showPlaceholder.value = !showPlaceholder.value;
};
</script>

<template>
  <div class="chart-container">
    <div v-if="showPlaceholder" class="text-center">
      <font-awesome-icon icon="chart-line" class="panel-icon-lg mb-3 pulse-animate" />
      <p class="text-center text-gray-400 mb-4">Advanced charting features coming soon</p>
      <button 
        @click="toggleChart" 
        class="btn-preview"
      >
        Show Preview
      </button>
    </div>
    <div v-else class="preview-container">
      <div class="chart-placeholder">
        <div class="chart-line"></div>
        <div class="chart-line"></div>
        <div class="chart-line"></div>
      </div>
      <button 
        @click="toggleChart"
        class="btn-preview mt-4"
      >
        Hide Preview
      </button>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  max-width: 100%; /* Enforce max width */
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  overflow: hidden;
}

.btn-preview {
  padding: 0.375rem 0.75rem;
  background-color: rgba(74, 222, 128, 0.2);
  color: rgb(74, 222, 128);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-preview:hover {
  background-color: rgba(74, 222, 128, 0.3);
}

.panel-icon-lg {
  font-size: 3rem;
  color: rgba(74, 222, 128, 0.4);
}

.pulse-animate {
  animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.chart-placeholder {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  flex: 1;
  overflow: hidden;
}

.chart-line {
  height: 30px;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(74, 222, 128, 0.1) 0%, 
    rgba(74, 222, 128, 0.3) 30%, 
    rgba(74, 222, 128, 0.2) 60%, 
    rgba(74, 222, 128, 0.4) 80%, 
    rgba(74, 222, 128, 0.2) 100%);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.chart-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 2s infinite;
}

.chart-line:nth-child(2)::after {
  animation-delay: 0.5s;
}

.chart-line:nth-child(3)::after {
  animation-delay: 1s;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Extra small screens (phones) */
@media (max-width: 479px) {
  .panel-icon-lg {
    font-size: 2.25rem;
  }
  
  .preview-container {
    padding: 5px 0;
  }
  
  .chart-placeholder {
    gap: 0.5rem;
  }
  
  .chart-line {
    height: 20px;
  }
  
  .btn-preview {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Small screens (large phones) */
@media (min-width: 480px) and (max-width: 639px) {
  .panel-icon-lg {
    font-size: 2.5rem;
  }
  
  .preview-container {
    padding: 5px 0;
  }
  
  .chart-placeholder {
    gap: 0.75rem;
  }
  
  .chart-line {
    height: 25px;
  }
}

/* Medium screens (tablets) */
@media (min-width: 640px) and (max-width: 1023px) {
  .chart-placeholder {
    gap: 0.75rem;
  }
  
  .chart-line {
    height: 26px;
  }
  
  .panel-icon-lg {
    font-size: 2.75rem;
  }
  
  p.text-center {
    font-size: 0.9rem;
    margin-bottom: 3px;
  }
  
  .btn-preview {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style> 