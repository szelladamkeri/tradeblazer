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
const watchlist = ref({
  data: [] as any[],
  loading: true,
  error: null as string | null
});

// Watchlist sorting
const watchlistSortBy = ref('recent');

// Fetch watchlist data
const fetchWatchlist = async () => {
  try {
    watchlist.value.loading = true;
    watchlist.value.error = null;
    
    if (!userStore.isAuthenticated) {
      watchlist.value.error = 'Authentication required';
      watchlist.value.loading = false;
      return;
    }
    
    if (!userStore.user?.id) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!userStore.user?.id) {
      watchlist.value.error = 'User data not available';
      watchlist.value.loading = false;
      return;
    }
    
    const response = await fetch(
      `http://localhost:3000/api/watchlist/user/${userStore.user.id}`,
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist');
    }
    
    watchlist.value.data = await response.json();
    if (!Array.isArray(watchlist.value.data)) {
      watchlist.value.data = [];
    }
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    watchlist.value.error = 'Failed to load watchlist';
    watchlist.value.data = [];
  } finally {
    watchlist.value.loading = false;
  }
};

const retryWatchlist = () => fetchWatchlist();

// Function to get top 3 watchlist items based on sort criteria
const getTopWatchlistItems = computed(() => {
  if (!watchlist.value.data?.length) return [];
  
  const items = [...watchlist.value.data];
  
  switch (watchlistSortBy.value) {
    case 'price':
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'change':
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'recent':
    default:
      items.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.watchlistId || 0) - (a.watchlistId || 0);
      });
      break;
  }
  
  return items.slice(0, 3);
});

const changeWatchlistSort = (sortType: string) => {
  watchlistSortBy.value = sortType;
};

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchWatchlist();
  }
});
</script>

<template>
  <div v-if="watchlist.loading" class="flex-1 flex items-center justify-center">
    <LoadingSpinner class="w-6 h-6" />
  </div>
  <div v-else-if="watchlist.error" class="flex-1 flex flex-col items-center justify-center">
    <div class="text-red-400 mb-3">{{ watchlist.error }}</div>
    <button @click="retryWatchlist" 
            class="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm">
      <font-awesome-icon icon="sync" class="mr-1" /> Retry
    </button>
  </div>
  <div v-else class="h-full flex flex-col overflow-hidden">
    <!-- Sort options -->
    <div class="flex gap-2 mb-3 px-2">
      <button 
        @click="changeWatchlistSort('recent')" 
        class="text-xs px-2 py-1 rounded"
        :class="watchlistSortBy === 'recent' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
      >
        Recent
      </button>
      <button 
        @click="changeWatchlistSort('price')" 
        class="text-xs px-2 py-1 rounded"
        :class="watchlistSortBy === 'price' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
      >
        Price
      </button>
      <button 
        @click="changeWatchlistSort('change')" 
        class="text-xs px-2 py-1 rounded"
        :class="watchlistSortBy === 'change' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
      >
        Change
      </button>
    </div>
    
    <!-- Watchlist items (limited to top 3) -->
    <div class="flex-1 overflow-y-auto scrollbar-thin">
      <div v-if="getTopWatchlistItems.length === 0" class="flex items-center justify-center h-full text-gray-400">
        No assets in watchlist
      </div>
      <div v-else v-for="item in getTopWatchlistItems" :key="item.watchlistId" 
            class="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/10 transition-colors cursor-pointer"
            @click="router.push(`/trade/${item.id}`)">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <font-awesome-icon :icon="getAssetTypeIcon(item.type)" class="text-green-400" />
            <div>
              <div class="font-medium text-white">{{ item.symbol }}</div>
              <div class="text-sm text-gray-400">{{ item.name }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-white">${{ formatPrice(item.price) }}</div>
            <div v-if="item.alert_price" class="text-xs text-green-400">
              Alert: {{ item.alert_type === 'above' ? '>' : '<' }} ${{ formatPrice(item.alert_price) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- View all link -->
    <div v-if="watchlist.data.length > 3" class="text-center mt-2">
      <router-link to="/markets" class="text-xs text-green-400 hover:underline">
        View all {{ watchlist.data.length }} items
      </router-link>
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