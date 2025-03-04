<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

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
const error = ref<string | null>(null)
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
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    assets.value = data
  } catch (err) {
    console.error('Error fetching assets:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load market data'
  } finally {
    loading.value = false
  }
}

// Add missing formatting functions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

onMounted(() => {
  fetchAssets()
})
</script>

<template>
  <div class="flex flex-col">
    <PageHeader class="mb-4" />
    <PageMain>
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <!-- Replace the content-container with updated styling that matches PageMain -->
        <div class="h-full" :class="{'overflow-y-auto': needsScrolling}">
          <!-- Header section -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-white">Markets</h1>
              <p class="text-gray-400 mt-1">Browse and trade available assets on our platform</p>
            </div>
            
            <!-- Controls -->
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div class="relative w-full sm:w-auto">
                <input
                  type="text"
                  v-model="searchTerm"
                  placeholder="Search assets..."
                  class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 sm:py-2 px-4 pl-10 focus:ring-2 focus:ring-green-400 focus:bg-black/60"
                />
                <font-awesome-icon icon="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <select
                  v-model="selectedType"
                  class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 sm:py-2 px-4 focus:ring-2 focus:ring-green-400 focus:bg-black/60"
                >
                  <option value="all">All Assets</option>
                  <option value="stock">Stocks</option>
                  <option value="crypto">Crypto</option>
                  <option value="forex">Forex</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>

          <!-- Error state -->
          <div v-else-if="error" 
               class="flex justify-center py-12">
            <div class="bg-black/40 backdrop-blur-xl rounded-xl p-8 max-w-md text-center border border-red-500/20">
              <font-awesome-icon icon="triangle-exclamation" class="text-3xl text-red-400 mb-4" />
              <p class="text-red-400">{{ error }}</p>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredAssets.length === 0" 
               class="flex justify-center py-12">
            <div class="bg-black/40 backdrop-blur-xl rounded-xl p-8 max-w-md text-center border border-white/10">
              <font-awesome-icon icon="search" class="text-3xl text-gray-400 mb-4" />
              <p class="text-gray-400">No assets found matching your search criteria.</p>
            </div>
          </div>

          <!-- Content state -->
          <div v-else>
            <div class="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10">Asset</th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">Price</th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">24h Change</th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">Market Cap</th>
                      <th class="py-4 px-4 font-medium text-gray-300 border-b border-white/10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/10">
                    <tr v-for="asset in filteredAssets" 
                        :key="asset.id"
                        class="hover:bg-white/5 transition-colors">
                      <td class="py-4 px-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <font-awesome-icon :icon="asset.type === 'crypto' ? 'coins' : 'chart-line'" 
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
                        <span :class="getChangeClass(asset.change_24h)">
                          {{ formatChange(asset.change_24h) }}
                        </span>
                      </td>
                      <td class="py-4 px-4 text-right text-gray-300">{{ formatMarketCap(asset.market_cap) }}</td>
                      <td class="py-4 px-4 text-right">
                        <div class="flex gap-2 justify-end">
                          <button @click="goToTrade(asset.id)"
                                  class="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                            Trade
                          </button>
                          <button v-if="isLoggedIn" 
                                  @click="addToWatchlist(asset.id)"
                                  class="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                            <font-awesome-icon icon="star" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
</style>
