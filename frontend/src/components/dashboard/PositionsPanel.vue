<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();
const userStore = useUserStore();

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

// Panel data
const positions = ref({
  data: [] as any[],
  loading: true,
  error: null as string | null
});

// Positions sorting
const positionsSortBy = ref('recent');

// Check if there's content to sort
const hasPositionsToSort = computed(() => {
  return positions.value.data.length > 0;
});

// Functions for sorting positions
const getSortedPositions = computed(() => {
  if (!positions.value.data?.length) return [];
  
  const items = [...positions.value.data];
  
  switch (positionsSortBy.value) {
    case 'price':
      items.sort((a, b) => b.price - a.price);
      break;
    case 'quantity':
      items.sort((a, b) => b.quantity - a.quantity);
      break;
    case 'recent':
    default:
      // Sort by date if available, otherwise by ID
      items.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.id || 0) - (a.id || 0);
      });
      break;
  }
  
  return items;
});

const changePositionsSort = (sortType: string) => {
  positionsSortBy.value = sortType;
};

// Fetch positions data
const fetchPositions = async () => {
  try {
    positions.value.loading = true;
    positions.value.error = null;
    
    if (!userStore.isAuthenticated) {
      positions.value.error = 'Authentication required';
      positions.value.loading = false;
      return;
    }
    
    if (!userStore.user?.id) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!userStore.user?.id) {
      positions.value.error = 'User data not available';
      positions.value.loading = false;
      return;
    }
    
    // First try to fetch from portfolio endpoint
    try {
      const portfolioResponse = await fetch(`http://localhost:3000/api/portfolio/${userStore.user.id}`, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      });
      
      if (portfolioResponse.ok) {
        const portfolio = await portfolioResponse.json();
        console.log('Portfolio data received:', portfolio);
        
        // Extract assets from portfolio using the property names from PortfolioView
        if (portfolio && portfolio.assets && Array.isArray(portfolio.assets)) {
          positions.value.data = portfolio.assets
            .filter((asset: any) => Number(asset.quantity) > 0) // Only show assets with quantity > 0
            .map((asset: any) => {
              // Protect against division by zero or very small average price
              const averagePrice = Number(asset.averagePrice);
              let gainPercentage = 0;
              
              if (averagePrice > 0.0001) {
                gainPercentage = ((Number(asset.currentPrice) - averagePrice) / averagePrice) * 100;
              }
              
              return {
                id: asset.assetId,
                symbol: asset.symbol,
                name: asset.name,
                type: asset.type || 'stock',
                quantity: Number(asset.quantity),
                price: Number(asset.currentPrice),
                value: Number(asset.currentPrice) * Number(asset.quantity),
                gain: gainPercentage,
                created_at: asset.created_at || new Date().toISOString()
              };
            });
          
          console.log('Mapped positions:', positions.value.data);
          positions.value.loading = false;
          return; // Successfully fetched from portfolio
        } else {
          console.log('No assets found in portfolio data:', portfolio);
        }
      } else {
        console.log('Portfolio API unavailable, falling back to orders');
      }
    } catch (portfolioErr) {
      console.log('Error with portfolio API, falling back to orders:', portfolioErr);
    }
    
    // Fallback to orders API - only show real owned assets
    try {
      const ordersResponse = await fetch(`http://localhost:3000/api/orders/${userStore.user.id}`, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      });
      
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        
        if (Array.isArray(orders) && orders.length > 0) {
          // Create a map to aggregate quantities by asset
          const assetMap = new Map();
          
          // Process buy and sell orders to determine current positions
          orders.forEach((order: any) => {
            const assetId = order.assetId;
            if (!assetMap.has(assetId)) {
              assetMap.set(assetId, {
                id: assetId,
                symbol: order.assetSymbol,
                name: order.assetName || order.assetSymbol,
                type: 'stock', // Default to stock if not provided
                quantity: 0,
                price: order.price,
                totalCost: 0,
                created_at: order.createdAt
              });
            }
            
            const asset = assetMap.get(assetId);
            if (order.tradeType === 'buy') {
              asset.quantity += order.quantity;
              asset.totalCost += order.quantity * order.price;
            } else if (order.tradeType === 'sell') {
              asset.quantity -= order.quantity;
            }
          });
          
          // Convert map to array and calculate value and gain
          const positionsArray = Array.from(assetMap.values())
            .filter(asset => asset.quantity > 0)
            .map(asset => {
              // Avoid division by zero
              const avgPrice = asset.totalCost / asset.quantity || 0.0001;
              let gainPercentage = 0;
              
              if (avgPrice > 0.0001) {
                gainPercentage = ((asset.price - avgPrice) / avgPrice) * 100;
              }
              
              return {
                ...asset,
                value: asset.price * asset.quantity,
                gain: gainPercentage
              };
            });
          
          if (positionsArray.length > 0) {
            positions.value.data = positionsArray;
            positions.value.loading = false;
            return;
          }
        }
      }
    } catch (ordersErr) {
      console.log('Error fetching from orders API:', ordersErr);
    }
    
    // If we reach here, we have no real data to show
    positions.value.data = [];
    
  } catch (err) {
    console.error('Error fetching positions:', err);
    positions.value.error = 'Failed to load positions';
    positions.value.data = []; // Empty array on error, no simulated data
  } finally {
    positions.value.loading = false;
  }
};

const retryPositions = () => fetchPositions();

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchPositions();
  }
});
</script>

<template>
  <div v-if="positions.loading" class="flex-1 flex items-center justify-center">
    <LoadingSpinner class="w-6 h-6" />
  </div>
  <div v-else-if="positions.error" class="flex-1 flex flex-col items-center justify-center">
    <div class="text-red-400 mb-3">{{ positions.error }}</div>
    <button @click="retryPositions" 
            class="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm">
      <font-awesome-icon icon="sync" class="mr-1" /> Retry
    </button>
  </div>
  <div v-else class="h-full flex flex-col overflow-hidden">
    <!-- Sort options - only show when there are positions to sort -->
    <div v-if="hasPositionsToSort" class="flex gap-2 mb-3 px-2">
      <button 
        @click="changePositionsSort('recent')" 
        class="text-xs px-2 py-1 rounded"
        :class="positionsSortBy === 'recent' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
      >
        Recent
      </button>
      <button 
        @click="changePositionsSort('price')" 
        class="text-xs px-2 py-1 rounded"
        :class="positionsSortBy === 'price' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
      >
        Price
      </button>
      <button 
        @click="changePositionsSort('quantity')" 
        class="text-xs px-2 py-1 rounded"
        :class="positionsSortBy === 'quantity' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
      >
        Quantity
      </button>
    </div>
    
    <div class="flex-1 overflow-y-auto scrollbar-thin">
      <div v-if="getSortedPositions.length === 0" class="flex items-center justify-center h-full text-gray-400">
        No active positions
      </div>
      <div v-else v-for="position in getSortedPositions" :key="position.id" 
            class="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/10 transition-colors cursor-pointer"
            @click="router.push(`/trade/${position.id}`)">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <font-awesome-icon :icon="getAssetTypeIcon(position.type)" class="text-green-400" />
            <div>
              <div class="font-medium text-white">{{ position.symbol }}</div>
              <div class="text-sm text-gray-400">{{ position.name }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-white">${{ formatPrice(position.price) }}</div>
            <div :class="[
              'text-xs flex items-center justify-end gap-1',
              position.gain >= 0 ? 'text-green-400' : 'text-red-400'
            ]">
              <font-awesome-icon :icon="position.gain >= 0 ? 'caret-up' : 'caret-down'" />
              {{ isFinite(position.gain) ? Math.abs(position.gain).toFixed(2) : '0.00' }}%
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-1">
          <div class="text-xs text-gray-400">
            Qty: {{ position.quantity }}
          </div>
          <div class="text-xs text-gray-400">
            Value: ${{ formatPrice(position.value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  margin-right: -0.25rem;
  padding-right: 0.25rem;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style> 