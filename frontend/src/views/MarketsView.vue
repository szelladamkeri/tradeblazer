<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { usePagination } from '@/composables/usePagination'
import { handleApiError } from '@/utils/errorHandler'
import FullPageError from '@/components/FullPageError.vue'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'

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

// Initialize reactive refs
const assets = ref<Asset[]>([])
const loading = ref(true)
const error = ref<{ message: string; type: string } | null>(null)
const searchTerm = ref('')
const selectedType = ref('all')

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

async function fetchAssets() {
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

// Add missing formatting functions
const formatPrice = (price: number): string => {
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

// Add watchlist functionality
const addToWatchlist = async (assetId: number) => {
  // Implementation to be added later
  console.log('Adding to watchlist:', assetId)
}

// Remove the existing pagination refs and computation
// Remove tableContainer, rowHeight, headerHeight, tableHeaderHeight, visibleItems, currentPage

const { 
  tableContainer,
  currentPage,
  paginatedItems: paginatedAssets,
  totalPages,
  nextPage,
  prevPage,
  visibleItems // Add this
} = usePagination(filteredAssets)

// Remove the old paginatedAssets computed property

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

</script>

<template>
  <!-- First check API heartbeat status -->
  <FullPageError
    v-if="!isApiAvailable && apiError"
    :message="apiError.message"
    :error-type="apiError.type"
    @retry="checkApiHeartbeat"
  />
  
  <!-- Then check for other errors -->
  <FullPageError
    v-else-if="error"
    :message="error.message"
    :error-type="error.type"
    @retry="fetchAssets"
  />
  
  <!-- Only render normal page when there's no error -->
  <div v-else class="flex flex-col markets-view">
    <PageHeader />
    <PageMain>
      <!-- Add ref to the container -->
      <div ref="tableContainer" class="w-full h-full px-2 sm:px-4 py-4">
        <div class="h-full">
          <!-- Header section with improved icons - hide when error is present -->
          <div v-if="!error && !loading" class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <font-awesome-icon icon="chart-pie" class="text-2xl text-green-400" />
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-white">Markets</h1>
                <p class="text-gray-400 mt-1">Browse and trade available assets on our platform</p>
              </div>
            </div>
            
            <!-- Controls -->
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div class="relative w-full sm:w-auto">
                <input
                  type="text"
                  v-model="searchTerm"
                  placeholder="Search assets..."
                  class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 sm:py-2 px-4 pl-10 focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none focus:bg-black/60 transition-all duration-200"
                />
                <font-awesome-icon icon="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <!-- Improved custom dropdown -->
              <div class="relative flex items-center gap-2 w-full sm:w-auto">
                <div class="custom-select-wrapper w-full">
                  <select
                    v-model="selectedType"
                    class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 sm:py-2 px-4 pr-10 focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none focus:bg-black/60 appearance-none transition-all duration-200"
                  >
                    <option value="all">
                      <font-awesome-icon icon="layer-group" /> All Assets
                    </option>
                    <option value="stock">
                      <font-awesome-icon icon="chart-line" /> Stocks
                    </option>
                    <option value="crypto">
                      <font-awesome-icon icon="coins" /> Crypto
                    </option>
                    <option value="forex">
                      <font-awesome-icon icon="exchange-alt" /> Forex
                    </option>
                  </select>
                  <span class="custom-select-icon">
                    <font-awesome-icon icon="chevron-down" class="text-gray-400" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredAssets.length === 0" 
               class="flex justify-center py-12">
            <div class="bg-black/40 backdrop-blur-xl rounded-xl p-8 max-w-md text-center border border-white/10">
              <font-awesome-icon icon="search" class="text-3xl text-gray-400 mb-4" />
              <p class="text-gray-400">No assets found matching your search criteria.</p>
            </div>
          </div>

          <!-- Content state - Updated to use paginatedAssets -->
          <div v-if="!loading && !error && filteredAssets.length > 0">
            <div class="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10">
                        <div class="flex items-center gap-2">
                          <font-awesome-icon icon="coins" class="text-green-400" />
                          Asset
                        </div>
                      </th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                        <div class="flex items-center gap-2 justify-end">
                          <font-awesome-icon icon="dollar-sign" class="text-green-400" />
                          Price
                        </div>
                      </th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                        <div class="flex items-center gap-2 justify-end">
                          <font-awesome-icon icon="chart-line" class="text-green-400" />
                          24h Change
                        </div>
                      </th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">
                        <div class="flex items-center gap-2 justify-end">
                          <font-awesome-icon icon="sack-dollar" class="text-green-400" />
                          Market Cap
                        </div>
                      </th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10">
                    <tr v-for="asset in paginatedAssets" 
                        :key="asset.id"
                        class="hover:bg-white/5 transition-colors group">
                      <td class="py-4 px-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                            <font-awesome-icon :icon="getAssetTypeIcon(asset.type)" 
                                            class="text-green-400" />
                          </div>
                          <div>
                            <div class="font-medium text-white">{{ asset.name }}</div>
                            <div class="text-sm text-gray-400">{{ asset.symbol }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-4 text-right font-medium text-white">{{ formatPrice(asset.price) }}</td>
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
                            Trade
                          </button>
                          <button v-if="isLoggedIn" 
                                  @click="addToWatchlist(asset.id)"
                                  class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                                  :title="'Add ' + asset.symbol + ' to watchlist'">
                            <font-awesome-icon icon="star" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Replace the existing indicator with pagination controls -->
            <div class="mt-4 flex items-center justify-between px-4">
              <div class="text-sm text-gray-400">
                Showing {{ filteredAssets.length ? ((currentPage - 1) * visibleItems) + 1 : 0 }} to 
                {{ Math.min((currentPage * visibleItems), filteredAssets.length) }} of 
                {{ filteredAssets.length }} assets
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded-lg transition-colors"
                  :class="[
                    currentPage === 1
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  ]"
                >
                  <font-awesome-icon icon="chevron-left" />
                </button>
                
                <span class="text-gray-400">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>

                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded-lg transition-colors"
                  :class="[
                    currentPage === totalPages
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  ]"
                >
                  <font-awesome-icon icon="chevron-right" />
                </button>
              </div>
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
  button, input, select {
    min-height: 44px;
  }
}

/* Add table hover effect */
tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Clean up table borders */
.border-collapse {
  border-collapse: collapse;
}

/* Improve table cell spacing */
td, th {
  white-space: nowrap;
}

/* Update background opacity */
.bg-black\/40 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Update background opacity to match AdminView */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Ensure consistent hover states */
tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Update empty state and error state backgrounds to match */
.bg-black\/40 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Fix dropdown visibility */
.custom-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.custom-select-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 10;
}

/* Add explicit styling for dropdown options */
select option {
  background-color: #1f2937;
  color: white;
  padding: 8px;
}

/* Fix dropdown appearance in different browsers */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none;
  cursor: pointer;
}

/* Handle select styles in Firefox */
@-moz-document url-prefix() {
  select {
    color: white;
    background-color: rgba(0, 0, 0, 0.4);
    text-indent: 0.01px;
    text-overflow: '';
    padding-right: 2rem;
  }
  
  select:focus {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  }
  
  select option {
    background-color: #1f2937;
    color: white;
  }
}

/* Handle select styles in Chrome/Safari */
@media screen and (-webkit-min-device-pixel-ratio:0) {
  select {
    padding-right: 2rem;
  }
  
  select:focus {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  }
  
  select option {
    background-color: #1f2937;
    color: white;
  }
}

/* Consistent focus states across browsers */
select:focus, input:focus {
  border-color: #22c55e !important; /* green-500 */
  --tw-ring-color: rgba(34, 197, 94, 0.5) !important; /* green-500 with opacity */
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
}

/* Mobile optimization for dropdown */
@media (max-width: 640px) {
  select, input, button {
    font-size: 16px; /* Prevents iOS zoom */
    height: 44px; /* Larger touch target */
    width: 100%;
  }
  
  .custom-select-wrapper {
    width: 100%;
  }
  
  .custom-select-icon {
    right: 16px;
  }
}

/* Safari-specific fixes */
@media not all and (min-resolution:.001dpcm) { 
  @supports (-webkit-appearance:none) {
    select {
      background-color: rgba(0, 0, 0, 0.4);
      color: white;
    }
  }
}

/* Remove overflow styles since we don't need them anymore */
.overflow-y-auto {
  overflow: hidden !important;
}

/* Ensure consistent row heights */
tr {
  height: 72px; /* Match the rowHeight constant */
}

/* Remove scrollbar styles since we don't need them */
::-webkit-scrollbar {
  display: none;
}

.overflow-x-auto {
  scrollbar-width: none;
}

/* Add styles for pagination buttons */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
