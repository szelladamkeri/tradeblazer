<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const { t } = useI18n();

const marketStats = ref({
  totalTrades: 0,
  totalVolume: 0,
  activeAssets: 0,
  loading: true,
  error: null as string | null
});

// Format numbers with appropriate suffixes
const formatVolume = (volume: number | null | undefined): string => {
  if (volume === null || volume === undefined || isNaN(Number(volume))) {
    return '0.00';
  }
  
  const numVolume = Number(volume);
  
  if (numVolume < 0.01 && numVolume > 0) {
    return numVolume.toFixed(8);
  }
  
  if (numVolume >= 1000000000) {
    return (numVolume / 1000000000).toFixed(2) + 'B';
  } else if (numVolume >= 1000000) {
    return (numVolume / 1000000).toFixed(2) + 'M';
  } else if (numVolume >= 1000) {
    return (numVolume / 1000).toFixed(2) + 'K';
  } else {
    return numVolume.toFixed(2);
  }
};

const fetchMarketStats = async () => {
  try {
    marketStats.value.loading = true;
    marketStats.value.error = null;
    const response = await fetch('http://localhost:3000/api/assets/stats');

    if (!response.ok) {
      throw new Error('Failed to fetch market stats');
    }

    const data = await response.json();
    marketStats.value = {
      ...data,
      loading: false,
      error: null
    };
  } catch (err) {
    console.error('Error fetching market stats:', err);
    marketStats.value = {
      ...marketStats.value,
      loading: false,
      error: 'Failed to load market statistics'
    };
  }
};

onMounted(() => {
  fetchMarketStats();
});
</script>

<template>
  <div v-if="marketStats.loading" class="flex-1 flex items-center justify-center">
    <LoadingSpinner class="w-6 h-6" />
  </div>
  <div v-else-if="marketStats.error" class="flex-1 flex items-center justify-center text-red-400">
    {{ marketStats.error }}
  </div>
  <div v-else class="h-full flex flex-col gap-3">
    <!-- Top row - larger stats -->
    <div class="flex gap-3 flex-1">
      <div class="flex-1 bg-white/5 rounded-lg p-3">
        <div class="text-sm text-gray-400">{{ t('dashboard.volume24h') }}</div>
        <div class="text-xl text-white font-medium mt-1">
          ${{ formatVolume(marketStats.totalVolume) }}
        </div>
      </div>
      <div class="flex-1 bg-white/5 rounded-lg p-3">
        <div class="text-sm text-gray-400">{{ t('dashboard.totalTrades') }}</div>
        <div class="text-xl text-white font-medium mt-1">
          {{ marketStats.totalTrades.toLocaleString() }}
        </div>
      </div>
    </div>
    <!-- Bottom row - smaller stats -->
    <div class="flex gap-3">
      <div class="flex-1 bg-green-500/10 rounded-lg p-2 flex items-center justify-between">
        <span class="text-sm text-gray-400">{{ t('dashboard.marketStatus') }}</span>
        <span class="text-sm text-green-400 font-medium">{{ t('dashboard.open') }}</span>
      </div>
      <div class="flex-1 bg-white/5 rounded-lg p-2 flex items-center justify-between">
        <span class="text-sm text-gray-400">{{ t('dashboard.activeAssets') }}</span>
        <span class="text-sm text-white font-medium">{{ marketStats.activeAssets }}</span>
      </div>
    </div>
    <!-- Additional row for 2h volume -->
    <div class="bg-white/5 rounded-lg p-2 flex items-center justify-between">
      <span class="text-sm text-gray-400">2h Volume</span>
      <span class="text-sm text-white font-medium">
        ${{ formatVolume(marketStats.totalVolume / 12) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.h-full {
  position: relative;
  z-index: 10;
}
</style> 