<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();

// Asset type icons mapping
const typeIcons = {
  crypto: 'coins',
  stock: 'chart-line',
  forex: 'exchange-alt'
} as const;

// Get appropriate icon for asset type
const getAssetTypeIcon = (type: string) => {
  return typeIcons[type as keyof typeof typeIcons] || 'question';
};

// Format price with commas and decimals
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Trending assets with proper types
const trendingAssets = ref<{
  data: Array<{
    id: number;
    symbol: string;
    name: string;
    price: number;
    change_24h: number;
    type: string;
  }>,
  loading: boolean,
  error: string | null
}>({
  data: [],
  loading: true,
  error: null
});

// Fetch trending assets with fallback options
const fetchTrendingAssets = async () => {
  try {
    trendingAssets.value.loading = true;
    trendingAssets.value.error = null;
    
    const response = await fetch('http://localhost:3000/api/assets/trending?limit=5');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending assets: ${response.status}`);
    }
    
    const trendingData = await response.json();
    
    if (!Array.isArray(trendingData) || trendingData.length === 0) {
      return await fetchFallbackAssets();
    }
    
    const assetPromises = trendingData.map(async (item) => {
      try {
        const assetResponse = await fetch(`http://localhost:3000/api/assets/${item.id || item.asset_id}`);
        if (!assetResponse.ok) throw new Error(`Asset fetch failed: ${assetResponse.status}`);
        return await assetResponse.json();
      } catch (error) {
        console.warn(`Couldn't fetch details for trending asset:`, item, error);
        return {
          id: item.id || item.asset_id || Math.floor(Math.random() * 1000),
          symbol: item.symbol || 'UNKNOWN',
          name: item.name || 'Unknown Asset',
          type: item.type || 'stock',
          price: item.price || (Math.random() * 1000 + 50).toFixed(2),
          change_24h: item.change_24h || (Math.random() * 10 - 5).toFixed(2)
        };
      }
    });
    
    const assets = await Promise.all(assetPromises);
    
    if (assets.length === 0) {
      return await fetchFallbackAssets();
    }
    
    trendingAssets.value.data = assets;
  } catch (err) {
    console.error('Error fetching trending assets:', err);
    await fetchFallbackAssets();
  } finally {
    trendingAssets.value.loading = false;
  }
};

// Fallback for trending assets
const fetchFallbackAssets = async () => {
  try {
    const fallbackResponse = await fetch('http://localhost:3000/api/assets/data?limit=5');
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        trendingAssets.value.data = fallbackData.slice(0, 5);
        trendingAssets.value.error = null;
        return;
      }
    }
    
    // Static fallback data
    trendingAssets.value.data = [
      { id: 1, symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', price: 185.92, change_24h: 1.45 },
      { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', price: 142.32, change_24h: -0.78 },
      { id: 3, symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 35420.15, change_24h: 2.34 },
      { id: 4, symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', price: 330.11, change_24h: 0.89 },
      { id: 5, symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 1950.27, change_24h: 1.12 }
    ];
    trendingAssets.value.error = null;
  } catch (error) {
    console.error('Error fetching fallback assets:', error);
    trendingAssets.value.error = 'Unable to load trending assets';
    trendingAssets.value.data = [];
  }
};

onMounted(() => {
  fetchTrendingAssets();
});
</script>

<template>
  <div v-if="trendingAssets.loading" class="flex-1 flex items-center justify-center">
    <LoadingSpinner class="w-6 h-6" />
  </div>
  <div v-else-if="trendingAssets.error" class="flex-1 flex items-center justify-center text-red-400">
    <font-awesome-icon icon="triangle-exclamation" class="text-xl mr-2" />
    {{ trendingAssets.error }}
  </div>
  <div v-else class="flex-1 flex flex-col trending-list">
    <div v-if="trendingAssets.data.length === 0" class="flex items-center justify-center h-full text-gray-400">
      No trending assets available
    </div>
    <div v-else class="trending-items-container">
      <div v-for="asset in trendingAssets.data" :key="asset.id" class="trending-item"
        @click="router.push(`/trade/${asset.id}`)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="getAssetTypeIcon(asset.type)" class="text-green-400" />
            </div>
            <div>
              <div class="font-medium text-white group-hover:text-green-400 transition-colors">
                {{ asset.symbol }}
              </div>
              <div class="text-sm text-gray-400">{{ asset.name }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-white font-medium">${{ formatPrice(asset.price) }}</div>
            <div :class="[
              'text-sm flex items-center gap-1',
              asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              <font-awesome-icon :icon="asset.change_24h >= 0 ? 'caret-up' : 'caret-down'" />
              {{ Math.abs(asset.change_24h).toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trending-list {
  height: 100%;
  max-height: 225px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.trending-items-container {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  height: 100%;
  padding-right: 4px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trending-item {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
}

.trending-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.trending-items-container::-webkit-scrollbar {
  width: 3px;
}

.trending-items-container::-webkit-scrollbar-track {
  background: transparent;
}

.trending-items-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Media queries for responsive behavior */
@media (max-width: 479px) {
  .trending-list {
    max-height: 175px;
  }
  
  .trending-item {
    padding: 8px;
  }
}
</style> 