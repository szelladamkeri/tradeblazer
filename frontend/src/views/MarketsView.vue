<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { usePriceStore } from '@/stores/priceStore' // Import the price store
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { usePagination } from '@/composables/usePagination'
import { handleApiError } from '@/utils/errorHandler'
import FullPageError from '@/components/FullPageError.vue'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import { useI18n } from 'vue-i18n'

interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: string;
  price: number;
  change_24h: number;
  market_cap?: number;
  volume_24h?: number;
}

const router = useRouter()
const userStore = useUserStore()
const priceStore = usePriceStore() // Initialize the price store

// Initialize reactive refs
const assets = ref<Asset[]>([])
const loading = ref(true)
const error = ref<{ message: string; type: string } | null>(null)
const searchTerm = ref('')
const selectedType = ref('all')

const { t } = useI18n()

// Add computed property for filtered assets
const filteredAssets = computed(() => {
  if (!assets.value) return []

  let filtered = assets.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(asset =>
      asset.name.toLowerCase().includes(term) ||
      asset.symbol.toLowerCase().includes(term)
    )
  }

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(asset => asset.type.toLowerCase() === selectedType.value)
  }

  return filtered
})

// Add needsScrolling computed property
const needsScrolling = computed(() => {
  if (!filteredAssets.value?.length) return false
  return filteredAssets.value.length > 10
})

const isLoggedIn = computed(() => userStore.isAuthenticated)

const fetchAssets = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('http://localhost:3000/api/assets/data')

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }
      throw new Error(`Error ${response.status}: ${errorData.message || errorData}`)
    }

    const data = await response.json()
    assets.value = data
    
    // If the user is logged in, check watchlist status for all assets
    if (userStore.isAuthenticated && assets.value) {
      // Use Promise.all to run multiple checks in parallel
      await Promise.all(assets.value.map(asset => checkWatchlistStatus(asset.id)))
    }
  } catch (err) {
    console.error('Error fetching assets:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

// Update formatPrice to handle potential null/undefined gracefully
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) {
    return 'N/A'; // Or loading indicator, or '-'
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const getChangeClass = (change: number) => {
  return change >= 0 ? 'text-green-400' : 'text-red-400'
}

const formatChange = (change: number | undefined | null): string => {
  if (change === undefined || change === null) return 'N/A'
  const prefix = change >= 0 ? '+' : ''
  return `${prefix}${change.toFixed(2)}%`
}

const formatMarketCap = (marketCap: number | undefined): string => {
  if (!marketCap) return 'N/A'
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return formatPrice(marketCap)
}

// Add a computed property to get the latest price for an asset
const getLatestPrice = (asset: Asset): number | null => {
  return priceStore.prices[asset.symbol] ?? asset.price ?? null;
};

// Add asset type icons mapping
const typeIcons = {
  crypto: 'coins',
  stock: 'chart-line',
  forex: 'exchange-alt'
}

// Add function to get appropriate icon for asset type
const getAssetTypeIcon = (type: string) => {
  return typeIcons[type as keyof typeof typeIcons] || 'question'
}

// Add goToTrade function
const goToTrade = (assetId: number) => {
  router.push(`/trade/${assetId}`)
}

// Add watchlist state
const watchlistLoadingStates = ref<{ [key: number]: boolean }>({})
const watchlistStatuses = ref<{ [key: number]: boolean }>({})

// Keep track of watchlist IDs for deletion
const watchlistIds = ref<Record<number, number>>({})

// Add watchlist check function
const checkWatchlistStatus = async (assetId: number) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/watchlist/check/${userStore.user?.id}/${assetId}`,
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )

    if (!response.ok) {
      console.warn('Failed to check watchlist status')
      watchlistStatuses.value[assetId] = false
      return
    }

    const data = await response.json()
    watchlistStatuses.value[assetId] = data.isInWatchlist
    if (data.watchlistId) {
      watchlistIds.value[assetId] = data.watchlistId
    }
  } catch (err) {
    console.error('Error checking watchlist status:', err)
    watchlistStatuses.value[assetId] = false
  }
}

// Replace existing toggleWatchlist with updated version
const toggleWatchlist = async (assetId: number) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  watchlistLoadingStates.value[assetId] = true
  
  try {
    const isInWatchlist = watchlistStatuses.value[assetId]

    if (isInWatchlist) {
      // Use the stored watchlist ID for deletion
      const watchlistId = watchlistIds.value[assetId]
      if (!watchlistId) {
        throw new Error('Watchlist ID not found')
      }
      
      const response = await fetch(`http://localhost:3000/api/watchlist/${watchlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
        }
      })

      if (!response.ok) throw new Error('Failed to remove from watchlist')
      // Clean up stored watchlist ID after successful deletion
      delete watchlistIds.value[assetId]
    } else {
      const response = await fetch(`http://localhost:3000/api/watchlist/${assetId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userStore.user!.id
        })
      })

      if (!response.ok) throw new Error('Failed to add to watchlist')
      
      // Store the new watchlist ID
      const data = await response.json()
      if (data.id) {
        watchlistIds.value[assetId] = data.id
      }
    }

    watchlistStatuses.value[assetId] = !isInWatchlist
  } catch (err) {
    console.error('Watchlist toggle error:', err)
  } finally {
    watchlistLoadingStates.value[assetId] = false
  }
}

// Update onMounted to check watchlist status
onMounted(async () => {
  await fetchAssets()
  if (isLoggedIn.value && assets.value) {
    assets.value.forEach(asset => checkWatchlistStatus(asset.id))
  }
})

// Add responsive pagination handling
const isMobile = ref(false)

const checkMobileSize = () => {
  isMobile.value = window.innerWidth < 768
}

// Call once on mount
onMounted(() => {
  checkMobileSize()
  window.addEventListener('resize', checkMobileSize)
})

// Clean up on unmount
onUnmounted(() => {
  window.removeEventListener('resize', checkMobileSize)
})

// Get correct maxItems based on screen size
const paginationMaxItems = computed(() => isMobile.value ? 3 : 5)

const {
  tableContainer,
  currentPage,
  paginatedItems: paginatedAssets,
  totalPages,
  nextPage,
  prevPage,
  visibleItems // Add this
} = usePagination(filteredAssets, {
  rowHeight: 72, // Keep default or adjust if needed
  headerHeight: 180, // Keep default or adjust if needed
  tableHeaderHeight: 56, // Keep default or adjust if needed
  maxItems: paginationMaxItems.value // Use the responsive value
})

// Keep the filter reset
watch([searchTerm, selectedType], () => {
  currentPage.value = 1
})

// Simplified onMounted
onMounted(() => {
  fetchAssets()
})

// Add API heartbeat check
const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()

// Add mouse move tracking for the header gradient effect
const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

// Update onMounted to ensure assets reload when the user logs in
watch(() => userStore.isAuthenticated, (newValue) => {
  if (newValue) {
    // User just logged in, refresh assets and watchlist status
    fetchAssets()
  } else {
    // User logged out, clear watchlist status
    watchlistStatuses.value = {}
    watchlistIds.value = {}
  }
})

</script>

<template>
  <!-- First check API heartbeat status -->
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />

  <!-- Then check for other errors -->
  <FullPageError v-else-if="error" :message="error.message" :error-type="error.type" @retry="fetchAssets" />

  <!-- Only render normal page when there's no error -->
  <div v-else class="markets-view view-container flex flex-col">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />

    <PageMain @mousemove="handleHeaderMouseMove">
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div class="max-w-7xl mx-auto">
          <!-- Header section with improved icons -->
          <div v-if="!error && !loading"
            class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div class="flex items-center gap-3 w-full md:w-auto">
              <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <font-awesome-icon icon="chart-pie" class="text-2xl text-green-400" />
              </div>
              <div class="flex-1">
                <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('markets.title') }}</h1>
                <p class="text-gray-400 mt-1">{{ t('markets.subtitle') }}</p>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div class="relative w-full sm:w-64">
                <input type="text" v-model="searchTerm" :placeholder="t('markets.search')"
                  class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none focus:bg-black/60 transition-all duration-200" />
                <font-awesome-icon icon="search"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <!-- Improved custom dropdown -->
              <div class="relative w-full sm:w-44">
                <div class="custom-select-wrapper">
                  <select v-model="selectedType"
                    class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 px-4 pr-10 focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none focus:bg-black/60 appearance-none transition-all duration-200">
                    <option value="all">{{ t('common.all') }}</option>
                    <option value="stock">{{ t('markets.stocks') }}</option> <!-- Changed key from markets.stock to markets.stocks -->
                    <option value="crypto">{{ t('markets.crypto') }}</option>
                    <option value="forex">{{ t('markets.forex') }}</option>
                  </select>
                  <div class="custom-select-icon">
                    <font-awesome-icon icon="chevron-down" class="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredAssets.length === 0" class="grid grid-cols-1 gap-6">
            <div class="dashboard-panel">
              <div class="panel-inner flex items-center justify-center p-8 max-w-md text-center">
                <div class="flex flex-col items-center">
                  <font-awesome-icon icon="search" class="text-3xl text-gray-400 mb-4 panel-icon-lg" />
                  <p class="text-gray-400">{{ t('markets.noAssetsFound') }}</p>
                </div>
              </div>
              <div class="corner-decor top-left"></div>
              <div class="corner-decor top-right"></div>
              <div class="corner-decor bottom-left"></div>
              <div class="corner-decor bottom-right"></div>
            </div>
          </div>

          <!-- Content state - Using grid layout like HomeView -->
          <div v-if="!loading && !error && filteredAssets.length > 0" class="grid grid-cols-1 gap-6">
            <div class="dashboard-panel">
              <div class="panel-inner">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-medium text-white flex items-center gap-2 glow-text">
                    <font-awesome-icon icon="list" class="panel-icon" />
                    {{ t('markets.marketAssets') }}
                  </h2>
                </div>

                <div class="overflow-x-auto">
                  <!-- Desktop table view (hidden on small screens) -->
                  <table class="w-full text-left border-collapse hidden md:table">
                    <thead>
                      <tr>
                        <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="coins" class="text-green-400" />
                            {{ t('markets.type') }}
                          </div>
                        </th>
                        <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                          <div class="flex items-center gap-2 justify-end">
                            <font-awesome-icon icon="dollar-sign" class="text-green-400" />
                            {{ t('markets.price') }}
                          </div>
                        </th>
                        <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                          <div class="flex items-center gap-2 justify-end">
                            <font-awesome-icon icon="chart-line" class="text-green-400" />
                            {{ t('markets.change') }}
                          </div>
                        </th>
                        <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                          <div class="flex items-center gap-2 justify-end">
                            <font-awesome-icon icon="sack-dollar" class="text-green-400" />
                            {{ t('markets.marketCap') }}
                          </div>
                        </th>
                        <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                          {{ t('markets.actions') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                      <tr v-for="asset in paginatedAssets" :key="asset.id"
                        class="hover:bg-white/5 transition-colors group">
                        <td class="py-4 px-4">
                          <div class="flex items-center gap-3">
                            <div
                              class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                              <font-awesome-icon :icon="getAssetTypeIcon(asset.type)" class="text-green-400" />
                            </div>
                            <div>
                              <div class="font-medium text-white">{{ asset.name }}</div>
                              <div class="text-sm text-gray-400">{{ asset.symbol }}</div>
                            </div>
                          </div>
                        </td>
                        <!-- Use getLatestPrice helper -->
                        <td class="py-4 px-4 text-right font-medium text-white">{{ formatPrice(getLatestPrice(asset)) }}</td>
                        <td class="py-4 px-4 text-right">
                          <span :class="getChangeClass(asset.change_24h)" class="flex items-center justify-end gap-1">
                            <font-awesome-icon :icon="asset.change_24h >= 0 ? 'caret-up' : 'caret-down'" />
                            {{ formatChange(asset.change_24h) }}
                          </span>
                        </td>
                        <td class="py-4 px-4 text-right text-gray-300">{{ formatMarketCap(asset.market_cap) }}</td>
                        <td class="py-4 px-4 text-right">
                          <div class="flex gap-2 justify-end">
                            <button @click="goToTrade(asset.id)"
                              class="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2">
                              <font-awesome-icon icon="exchange-alt" />
                              {{ t('markets.trade') }}
                            </button>
                            <button v-if="isLoggedIn" 
                                    @click="toggleWatchlist(asset.id)"
                                    class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                                    :class="{ 'text-green-400': watchlistStatuses[asset.id] }"
                                    :title="(watchlistStatuses[asset.id] ? 'Remove from' : 'Add to') + ' watchlist'">
                              <font-awesome-icon icon="star" 
                                                :class="{ 'animate-pulse': watchlistLoadingStates[asset.id] }" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Mobile card view (shown only on small and medium screens) -->
                  <div class="md:hidden space-y-4">
                    <div v-for="asset in paginatedAssets" :key="asset.id" 
                         class="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors shadow-md border border-white/5">
                      <!-- Asset Header -->
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                          <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <font-awesome-icon :icon="getAssetTypeIcon(asset.type)" class="text-green-400 text-xl" />
                          </div>
                          <div>
                            <div class="font-medium text-white text-base">{{ asset.name }}</div>
                            <div class="text-sm text-gray-400">{{ asset.symbol }}</div>
                          </div>
                        </div>
                        <span :class="getChangeClass(asset.change_24h)" class="flex items-center gap-1 text-base font-medium">
                          <font-awesome-icon :icon="asset.change_24h >= 0 ? 'caret-up' : 'caret-down'" />
                          {{ formatChange(asset.change_24h) }}
                        </span>
                      </div>
                      
                      <!-- Asset Details -->
                      <div class="grid grid-cols-2 gap-3 mb-5">
                        <div class="bg-black/20 p-4 rounded-lg">
                          <div class="text-sm text-gray-400 mb-1">{{ t('markets.price') }}</div>
                          <div class="font-medium text-white text-lg">{{ formatPrice(getLatestPrice(asset)) }}</div>
                        </div>
                        <div class="bg-black/20 p-4 rounded-lg">
                          <div class="text-sm text-gray-400 mb-1">{{ t('markets.marketCap') }}</div>
                          <div class="font-medium text-white text-lg">{{ formatMarketCap(asset.market_cap) }}</div>
                        </div>
                      </div>
                      
                      <!-- Asset Actions -->
                      <div class="flex gap-3">
                        <button @click="goToTrade(asset.id)"
                          class="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                          <font-awesome-icon icon="exchange-alt" />
                          {{ t('markets.trade') }}
                        </button>
                        <button v-if="isLoggedIn" 
                                @click="toggleWatchlist(asset.id)"
                                class="w-14 py-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                                :class="{ 'text-green-400': watchlistStatuses[asset.id] }">
                          <font-awesome-icon icon="star" :class="{ 'animate-pulse': watchlistLoadingStates[asset.id] }" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Pagination controls moved INSIDE panel-inner to match PortfolioView -->
                <div class="mt-4 flex flex-col sm:flex-row items-center justify-between px-4 border-t border-white/10 pt-4 gap-4">
                  <div class="text-sm text-gray-400 text-center sm:text-left">
                    {{ t('markets.pagination.showing') }} {{ filteredAssets.length ? ((currentPage - 1) * visibleItems) + 1 : 0 }}
                    <!-- {{ t('markets.pagination.to') }} -->
                    -
                    {{ Math.min(currentPage * visibleItems, filteredAssets.length) }} {{ t('markets.pagination.of') }}
                    {{ filteredAssets.length }} {{ t('markets.pagination.assets') }}
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="prevPage" :disabled="currentPage === 1" 
                      class="w-10 h-10 rounded-lg transition-colors flex items-center justify-center"
                      :class="[
                        currentPage === 1
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      ]">
                      <font-awesome-icon icon="chevron-left" />
                    </button>

                    <span class="text-gray-400">
                      {{ t('markets.pagination.page') }} {{ currentPage }} {{ t('markets.pagination.of') }} {{ totalPages }}
                    </span>

                    <button @click="nextPage" :disabled="currentPage === totalPages"
                      class="w-10 h-10 rounded-lg transition-colors flex items-center justify-center" 
                      :class="[
                        currentPage === totalPages
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      ]">
                      <font-awesome-icon icon="chevron-right" />
                    </button>
                  </div>
                </div>
              </div>
              <div class="corner-decor top-left"></div>
              <div class="corner-decor top-right"></div>
              <div class="corner-decor bottom-left"></div>
              <div class="corner-decor bottom-right"></div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
/* Base styles */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Add smooth scrolling */
.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Table styles */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

/* Mobile optimization */
@media (max-width: 640px) {
  button,
  input,
  select {
    min-height: 44px; /* Improve touch targets */
  }
  
  /* Improved mobile card styling */
  .bg-white\/5 {
    background-color: rgba(255, 255, 255, 0.03);
  }
  
  .bg-white\/5:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  /* Make touch targets bigger */
  .flex-1.py-4, .w-14.py-4 {
    min-height: 52px;
  }
  
  /* Ensure pagination is easy to tap */
  .px-3.py-1 {
    padding: 0.625rem 0.75rem;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Improve table spacing on tablets */
  th, td {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Ensure action buttons are properly sized */
  .px-4.py-2 {
    padding: 0.5rem 1rem;
  }
  
  /* Ensure pagination controls are easy to tap */
  .px-3.py-1 {
    padding: 0.5rem 0.75rem;
    min-width: 40px;
  }
}

/* Controls optimization for tablet */
@media (max-width: 768px) {
  /* Improved controls layout for small devices */
  .flex-col.sm\:flex-row.gap-3.w-full.md\:w-auto {
    width: 100%;
  }
  
  .sm\:w-64, .sm\:w-44 {
    width: 100%;
  }
}

/* Update panel styling to match TutorialView */
.dashboard-panel {
  @apply relative overflow-hidden;
  border-radius: 0.75rem;
  height: auto !important;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.panel-inner {
  @apply p-4 h-full flex flex-col border border-white/10 rounded-xl relative z-10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Futuristic border/line effects just like in TutorialView */
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

/* Fix layout issues */
.markets-view {
  padding-top: 0 !important;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Override height constraints */
.dashboard-panel {
  height: auto !important;
  /* Let content determine height */
  min-height: 200px;
  /* Provide a sensible minimum */
}

/* Ensure padding is consistent */
.markets-view>.w-full {
  padding-top: 1rem !important;
}

/* Ensure content overflow is handled properly */
.view-content {
  flex: 1;
  overflow: visible;
}

/* Remove any conflicting style overrides */
.markets-view {
  padding-top: 0 !important;
}

/* Ensure padding is consistent */
.markets-view>.w-full {
  padding-top: 1rem !important;
}

/* Custom select styling */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Ensure consistent heights between inputs and selects */
input,
select {
  height: 42px;
}

@media (max-width: 640px) {

  input,
  select {
    height: 48px;
  }
}
</style>