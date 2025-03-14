<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { handleApiError } from '@/utils/errorHandler'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { 
  faChartPie, faBolt, faListCheck, faChartLine, 
  faClockRotateLeft, faEye, faGaugeHigh, faShieldHalved,
  faCartShopping, faChartColumn, faSync, faSearch, faWallet,
  faBitcoinSign, faDollarSign, faFire, faCaretUp, faCaretDown
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faChartPie, faBolt, faListCheck, faChartLine,
  faClockRotateLeft, faEye, faGaugeHigh, faShieldHalved,
  faCartShopping, faChartColumn, faSync, faSearch, faWallet,
  faBitcoinSign, faDollarSign, faFire, faCaretUp, faCaretDown
)

const router = useRouter()

const marketStats = ref({
  totalTrades: 0,
  totalVolume: 0,
  activeAssets: 0,
  loading: true,
  error: null
})

const dashboardPanels = ref([
  { id: 'market-stats', title: 'Market Statistics', icon: 'chart-pie', visible: true },
  { id: 'active-positions', title: 'Active Positions', icon: 'list-check', visible: true },
  { id: 'charts', title: 'Charts', icon: 'chart-line', visible: true },
  { id: 'recent-activity', title: 'Recent Activity', icon: 'clock-rotate-left', visible: true },
  { id: 'watchlist', title: 'Watchlist', icon: 'eye', visible: true },
  { id: 'trending', title: 'Trending Assets', icon: 'fire', visible: true }
])

// Panel visibility toggles
const togglePanel = (panelId: string) => {
  const panel = dashboardPanels.value.find(p => p.id === panelId)
  if (panel) panel.visible = !panel.visible
}

const error = ref<{ message: string; type: string } | null>(null)
const loading = ref(false)

const reconnectToDatabase = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch('http://localhost:3000/api/reconnect', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Failed to reconnect to database')
    }

    // After successful reconnection, retry fetching data
    await fetchData()
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}

// Add error handling to fetchData
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch('http://localhost:3000/api/assets/data')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    
    // ...rest of existing fetch logic...
  } catch (err) {
    error.value = handleApiError(err)
    throw err // Re-throw to be caught by error boundary
  } finally {
    loading.value = false
  }
}

const fetchMarketStats = async () => {
  try {
    marketStats.value.loading = true
    marketStats.value.error = null
    const response = await fetch('http://localhost:3000/api/assets/stats')
    
    if (!response.ok) {
      throw new Error('Failed to fetch market stats')
    }
    
    const data = await response.json()
    marketStats.value = { 
      ...data, 
      loading: false,
      error: null
    }
  } catch (err) {
    console.error('Error fetching market stats:', err)
    marketStats.value = {
      ...marketStats.value,
      loading: false,
      error: 'Failed to load market statistics'
    }
  }
}

// Add default trending assets data
const defaultTrendingAssets = [
  { id: 1, symbol: 'BTC/USD', name: 'Bitcoin', price: 43123.45, change_24h: 2.45, type: 'crypto' },
  { id: 2, symbol: 'ETH/USD', name: 'Ethereum', price: 2234.56, change_24h: -1.23, type: 'crypto' },
  { id: 3, symbol: 'AAPL', name: 'Apple Inc.', price: 187.45, change_24h: 0.89, type: 'stock' }
]

// Update trendingAssets initialization
const trendingAssets = ref({
  data: defaultTrendingAssets, // Initialize with default data
  loading: false,
  error: null
})

// Update fetchTrendingAssets function
const fetchTrendingAssets = async () => {
  try {
    trendingAssets.value.loading = true
    const response = await fetch('http://localhost:3000/api/assets/trending')
    if (!response.ok) throw new Error('Failed to fetch trending assets')
    const data = await response.json()
    if (data && data.length > 0) {
      trendingAssets.value.data = data
    }
  } catch (err) {
    console.error('Error fetching trending assets:', err)
    // Keep the default data on error
    trendingAssets.value.error = 'Using default trending assets'
  } finally {
    trendingAssets.value.loading = false
  }
}

// Update onMounted to include fetchTrendingAssets
onMounted(() => {
  fetchMarketStats()
  fetchTrendingAssets()
})

// Add formatPrice function if not already present
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// Add asset type icons mapping
const typeIcons = {
  crypto: 'coins',
  stock: 'chart-line',
  forex: 'exchange-alt'
} as const

// Add function to get appropriate icon for asset type
const getAssetTypeIcon = (type: string) => {
  return typeIcons[type as keyof typeof typeIcons] || 'question'
}

</script>

<template>
  <div class="flex flex-col">
    <PageHeader>
      <div class="flex-1 overflow-x-auto py-2">
        <!-- Panel toggle buttons -->
        <div class="flex items-center gap-2 px-2 min-w-max">
          <button 
            v-for="panel in dashboardPanels"
            :key="panel.id"
            @click="togglePanel(panel.id)"
            class="px-4 py-2 rounded-lg text-sm transition-all duration-200"
            :class="panel.visible ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
          >
            <font-awesome-icon :icon="panel.icon" class="mr-2" />
            {{ panel.title }}
          </button>
        </div>
      </div>
    </PageHeader>

    <PageMain>
      <div class="w-full h-full overflow-y-auto px-4 py-4">
        <div class="h-full">
          <!-- Welcome Section -->
          <div class="mb-6">
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to TradeBlazer</h1>
            <p class="text-gray-400">Your personalized trading dashboard</p>
          </div>

          <!-- Panels Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div 
              v-for="panel in dashboardPanels" 
              :key="panel.id"
              v-show="panel.visible" 
              class="dashboard-panel"
            >
              <div class="panel-inner">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-medium text-white flex items-center gap-2">
                    <font-awesome-icon :icon="panel.icon" class="panel-icon" />
                    {{ panel.title }}
                  </h2>
                </div>

                <!-- Market Statistics Panel -->
                <div v-if="panel.id === 'market-stats'" class="flex-1">
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
                        <div class="text-sm text-gray-400">24h Volume</div>
                        <div class="text-xl text-white font-medium mt-1">
                          ${{ marketStats.totalVolume.toLocaleString() }}
                        </div>
                      </div>
                      <div class="flex-1 bg-white/5 rounded-lg p-3">
                        <div class="text-sm text-gray-400">Total Trades</div>
                        <div class="text-xl text-white font-medium mt-1">
                          {{ marketStats.totalTrades.toLocaleString() }}
                        </div>
                      </div>
                    </div>
                    <!-- Bottom row - smaller stats -->
                    <div class="flex gap-3">
                      <div class="flex-1 bg-green-500/10 rounded-lg p-2 flex items-center justify-between">
                        <span class="text-sm text-gray-400">Market Status</span>
                        <span class="text-sm text-green-400 font-medium">Open</span>
                      </div>
                      <div class="flex-1 bg-white/5 rounded-lg p-2 flex items-center justify-between">
                        <span class="text-sm text-gray-400">Active Assets</span>
                        <span class="text-sm text-white font-medium">{{ marketStats.activeAssets }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Trending Assets Panel -->
                <div v-else-if="panel.id === 'trending'" class="flex-1 flex flex-col">
                  <div v-if="trendingAssets.loading" class="flex-1 flex items-center justify-center">
                    <LoadingSpinner class="w-6 h-6" />
                  </div>
                  <div v-else-if="trendingAssets.error" class="flex-1 flex items-center justify-center text-red-400">
                    <font-awesome-icon icon="triangle-exclamation" class="text-xl mr-2" />
                    {{ trendingAssets.error }}
                  </div>
                  <div v-else class="flex-1 flex flex-col">
                    <div class="flex-1 overflow-y-auto scrollbar-thin">
                      <div class="py-2 space-y-2">
                        <div
                          v-for="asset in trendingAssets.data"
                          :key="asset.id"
                          class="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                          @click="router.push(`/trade/${asset.id}`)"
                        >
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
                  </div>
                </div>

                <!-- Placeholder for other panels -->
                <div v-else class="flex-1 flex flex-col items-center justify-center">
                  <font-awesome-icon :icon="panel.icon" class="panel-icon-lg mb-3" />
                  <p class="text-center text-gray-400">{{ panel.title }} content coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
.dashboard-panel {
  @apply relative overflow-hidden;
  height: 260px; /* Increase height slightly to accommodate all items */
}

.panel-inner {
  @apply p-4 h-full flex flex-col bg-white/5 rounded-xl border border-white/10;
  background: linear-gradient(165deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.panel-inner:hover {
  @apply border-green-500/30;
  background: linear-gradient(165deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
}

.panel-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

.panel-icon {
  @apply text-green-400 text-xl;
  filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
}

.panel-icon-lg {
  @apply text-6xl text-white/10;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));
}

/* Update scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-black/20 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-white/20 rounded-full hover:bg-white/30;
}

.scrollbar-thin {
  margin-right: -0.25rem;
  padding-right: 0.25rem;
}

/* Add these styles for better scrolling in trending panel */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
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

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

</style>
