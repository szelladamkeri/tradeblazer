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
  error: null as string | null
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
const trendingAssets = ref<{
  data: typeof defaultTrendingAssets,
  loading: boolean,
  error: string | null
}>({
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

// Add mouse move tracking for the header gradient effect
const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};
</script>

<template>
  <div class="home-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <div class="w-full pt-12 pb-8 px-4 view-content">
      <div class="max-w-7xl mx-auto">
        <!-- Main Content Wrapper -->
        <div
          class="bg-[rgba(18,24,38,0.95)] backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <font-awesome-icon icon="chart-pie" class="text-2xl text-green-400" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p class="text-gray-400 mt-1">Your financial overview at a glance</p>
            </div>
          </div>

          <!-- Panels Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="panel in dashboardPanels" :key="panel.id" v-show="panel.visible" class="dashboard-panel">
              <div class="panel-inner">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-medium text-white flex items-center gap-2 glow-text">
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
                    <div class="flex-1 trending-container">
                      <div class="trending-items-wrapper">
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
                  </div>
                </div>

                <!-- Placeholder for other panels -->
                <div v-else class="flex-1 flex flex-col items-center justify-center">
                  <font-awesome-icon :icon="panel.icon" class="panel-icon-lg mb-3 pulse-animate" />
                  <p class="text-center text-gray-400">{{ panel.title }} content coming soon</p>
                </div>
              </div>
              <!-- Decorative corner elements for futuristic look -->
              <div class="corner-decor top-left"></div>
              <div class="corner-decor top-right"></div>
              <div class="corner-decor bottom-left"></div>
              <div class="corner-decor bottom-right"></div>
            </div>
          </div>

          <!-- Add corner decorations to match other views -->
          <div class="corner-decor top-left"></div>
          <div class="corner-decor top-right"></div>
          <div class="corner-decor bottom-left"></div>
          <div class="corner-decor bottom-right"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dashboard Gradient Effect Implementation
 * This view serves as the reference implementation for the interactive gradient effect
 * used across all views in the application. Key features:
 * 
 * 1. Mouse tracking for dynamic gradient positioning
 * 2. Consistent z-index hierarchy (see App.vue for global z-index variables)
 * 3. Hardware-accelerated animations using transform and opacity
 * 4. Mobile optimization by disabling effects on smaller screens
 * 
 * Implementation pattern:
 * - Add mousemove event handlers to both PageHeader and PageMain
 * - Use CSS custom properties --mouse-x and --mouse-y for positioning
 * - Apply radial gradient with theme-consistent colors
 * - Handle z-index properly to avoid conflicts with dropdowns
 */

.dashboard-panel {
  @apply relative overflow-hidden;
  height: 290px;
  /* Fixed height to prevent jumping */
  border-radius: 0.75rem;
}

.panel-inner {
  @apply p-4 h-full flex flex-col border border-white/10 rounded-xl relative z-10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  border-radius: 0.75rem;
  height: 100%;
  width: 100%;
}

.panel-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  /* Match the bottom line's left margin */
  right: 15%;
  /* Match the bottom line's right margin */
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.3), transparent);
}

.panel-inner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.1), transparent);
}

@keyframes animatedBorder {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 300% 50%;
  }
}

.panel-inner {
  @apply p-4 h-full flex flex-col border border-white/10 rounded-xl relative z-10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  border-radius: 0.75rem;
}

/* Enhanced hover effects */
.panel-inner:hover {
  @apply border-green-500/30;
  background: linear-gradient(135deg, rgba(30, 38, 57, 0.9) 0%, rgba(13, 16, 27, 0.95) 100%);
  box-shadow: 0 12px 36px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(74, 222, 128, 0.2) inset;
  transform: translateY(-2px);
}

/* Futuristic border/line effects */
.panel-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.3), transparent);
}

.panel-inner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.1), transparent);
}

/* Glowing text and icons */
.glow-text {
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.panel-icon {
  @apply text-green-400 text-xl;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.7));
}

.panel-icon-lg {
  @apply text-6xl text-green-400/20;
  filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.3));
}

/* Decorative corner elements */
.corner-decor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  z-index: 20;
}

.corner-decor.top-left {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
}

.corner-decor.top-right {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
}

.corner-decor.bottom-left {
  bottom: 8px;
  left: 8px;
  border-right: none;
  border-top: none;
}

.corner-decor.bottom-right {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
}

/* Animation effects */
@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.pulse-animate {
  animation: pulse 4s infinite ease-in-out;
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

/* Trending assets specific styling */
.trending-container {
  height: 100%;
  overflow: hidden;
  padding-bottom: 4px;
  display: flex;
  flex-direction: column;
}

.trending-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.trending-item {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
}

.trending-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.trending-item:last-child {
  margin-bottom: 0;
}

/* Remove the existing scrollbar styles that might be causing issues */
.scrollbar-thin {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-thin::-webkit-scrollbar {
  display: none;
}

/* Add centering styles */
.max-w-7xl {
  max-width: 1280px;
}

/* Make the home view take the full browser height */
.home-view {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 0 !important;
  height: auto !important;
  /* Remove fixed height */
}

/* Match header container width to card container width */
.page-header .max-w-7xl {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Ensure content overflow is handled properly */
.view-content {
  flex: 1;
  overflow: visible;
}

/* Adjust the panel section spacing */
.home-view>.w-full {
  padding-top: 1rem !important;
}
</style>