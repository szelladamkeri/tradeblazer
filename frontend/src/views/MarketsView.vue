<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FadeIn from '@/components/FadeIn.vue'

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
const assets = ref<Asset[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')
const selectedType = ref('all')
const isLoaded = ref(false)

// Filter assets by search term and type
const filteredAssets = computed(() => {
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

const isLoggedIn = computed(() => userStore.isLoggedIn)

async function fetchAssets() {
  loading.value = true
  error.value = null
  isLoaded.value = false
  
  try {
    // Changed API endpoint from '/api/assets' to '/api/assets/data' to match the backend route
    const response = await fetch('http://localhost:3000/api/assets/data')
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    assets.value = await response.json()
    isLoaded.value = true
  } catch (err) {
    console.error('Error fetching assets:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load market data'
    isLoaded.value = true
  } finally {
    loading.value = false
  }
}

async function addToWatchlist(assetId: number) {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userStore.user.id}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ assetId })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to add to watchlist')
    }
    
    alert('Asset added to watchlist')
  } catch (err) {
    console.error('Error adding to watchlist:', err)
    alert(err instanceof Error ? err.message : 'Failed to add asset to watchlist')
  }
}

function formatChange(change: number | undefined | null): string {
  if (change === undefined || change === null) {
    return 'N/A';
  }
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}%`;
}

function goToTrade(assetId: number) {
  router.push(`/trade/${assetId}`)
}

onMounted(() => {
  fetchAssets()
})

// Add a computed property to check if scrolling is needed
const needsScrolling = computed(() => {
  if (!filteredAssets.value.length) return false;
  return filteredAssets.value.length > 10; // Only show scrollbar if more than 10 assets
})
</script>

<template>
  <div class="flex flex-col h-full w-full items-center">
    <PageHeader class="page-header mb-4" /> 
    <PageMain class="relative z-[1]">
      <div class="content-container w-full h-full px-2 sm:px-4 py-4" :class="{'overflow-y-auto': needsScrolling}">
        <!-- Header section with improved clarity -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 class="text-white text-2xl sm:text-3xl font-bold">Markets</h1>
            <p class="text-gray-400 mt-1">Browse and trade available assets on our platform</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <!-- Search with clearer placeholder -->
            <div class="relative w-full sm:w-auto">
              <input
                type="text"
                v-model="searchTerm"
                placeholder="Search assets..."
                class="w-full bg-white/10 text-white border-0 rounded-lg py-3 sm:py-2 px-4 pl-10 focus:ring-2 focus:ring-green-400 focus:bg-white/20"
                aria-label="Search assets"
              />
              <font-awesome-icon
                icon="search"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            
            <!-- Filter dropdown with label -->
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <label for="asset-type-filter" class="text-gray-400 hidden sm:inline">Filter:</label>
              <select
                id="asset-type-filter"
                v-model="selectedType"
                class="option-dark w-full bg-white/10 text-white border-0 rounded-lg py-3 sm:py-2 px-4 focus:ring-2 focus:ring-green-400 focus:bg-white/20"
                aria-label="Filter by asset type"
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
        <div v-else-if="error" class="flex justify-center py-12">
          <div class="bg-black/40 backdrop-blur-xl backdrop-saturate-150 rounded-xl p-8 max-w-md text-center border border-red-500/20">
            <font-awesome-icon icon="triangle-exclamation" class="text-red-500 text-4xl mb-4" />
            <h3 class="text-xl text-white mb-2">{{ error }}</h3>
            <p class="text-gray-400 mb-6">Please try again later or contact support.</p>
            <button
              @click="fetchAssets"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 sm:py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="filteredAssets.length === 0" class="flex justify-center py-12">
          <div class="bg-black/40 backdrop-blur-xl backdrop-saturate-150 rounded-xl p-8 max-w-md text-center border border-white/10">
            <font-awesome-icon icon="search" class="text-gray-500 text-4xl mb-4" />
            <h3 class="text-xl text-white mb-2">No assets found</h3>
            <p class="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        </div>
        
        <!-- Content state - without FadeIn -->
        <div v-else class="space-y-6">
          <div class="p-6 sm:p-8"> <!-- Add the padding to match AdminView -->
            <!-- Desktop Table View - match AdminView exactly -->
            <div class="hidden sm:block bg-white/5 rounded-xl p-4 sm:p-6 overflow-hidden">
              <div class="flex items-center gap-3 mb-4">
                <font-awesome-icon icon="chart-line" class="text-green-400" />
                <h2 class="text-xl text-white font-semibold">Available Assets</h2>
              </div>
              
              <div class="overflow-x-auto">
                <div class="min-w-[700px]"> <!-- Add min-width container like AdminView -->
                  <table class="w-full text-gray-300"> <!-- Match AdminView table classes -->
                    <thead class="text-left border-b border-white/10">
                      <tr>
                        <th class="py-3 px-4 text-gray-400 text-sm font-medium whitespace-nowrap">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="coins" class="text-green-400" />
                            Asset
                          </div>
                        </th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium">
                          <div class="flex items-center justify-end gap-2">
                            <font-awesome-icon icon="dollar-sign" class="text-green-400" />
                            Price
                          </div>
                        </th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium">
                          <div class="flex items-center justify-end gap-2">
                            <font-awesome-icon icon="chart-bar" class="text-green-400" />
                            24h Change
                          </div>
                        </th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium hidden md:table-cell">
                          <div class="flex items-center justify-end gap-2">
                            <font-awesome-icon icon="building" class="text-green-400" />
                            Market Cap
                          </div>
                        </th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium hidden lg:table-cell">
                          <div class="flex items-center justify-end gap-2">
                            <font-awesome-icon icon="exchange-alt" class="text-green-400" />
                            Volume (24h)
                          </div>
                        </th>
                        <th class="text-center py-3 px-4 text-gray-400 text-sm font-medium">
                          <div class="flex items-center justify-center gap-2">
                            <font-awesome-icon icon="wrench" class="text-green-400" />
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="asset in filteredAssets"
                        :key="asset.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td class="py-4 px-4">
                          <div class="flex items-center">
                            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                              <span class="text-white font-semibold">{{ asset.symbol.charAt(0) }}</span>
                            </div>
                            <div>
                              <div class="font-medium text-white">{{ asset.symbol }}</div>
                              <div class="text-sm text-gray-400">{{ asset.name }}</div>
                            </div>
                            <span
                              :class="`ml-3 px-2 py-0.5 rounded-full text-xs ${
                                asset.type === 'crypto'
                                  ? 'bg-green-500/20 text-green-400'
                                  : asset.type === 'stock'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                              }`"
                            >
                              {{ asset.type }}
                            </span>
                          </div>
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          ${{ asset.price.toLocaleString() }}
                        </td>
                        <td class="py-4 px-4 text-right">
                          <span
                            :class="[
                              asset.change_24h === undefined || asset.change_24h === null ? 'text-gray-400' : 
                              asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400',
                              'font-medium'
                            ]"
                          >
                            {{ formatChange(asset.change_24h) }}
                          </span>
                        </td>
                        <td class="py-4 px-4 text-right text-gray-300 hidden md:table-cell">
                          {{ asset.market_cap ? '$' + asset.market_cap.toLocaleString() : 'N/A' }}
                        </td>
                        <td class="py-4 px-4 text-right text-gray-300 hidden lg:table-cell">
                          {{ asset.volume_24h ? '$' + asset.volume_24h.toLocaleString() : 'N/A' }}
                        </td>
                        <td class="py-4 px-4">
                          <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <button
                              @click="addToWatchlist(asset.id)"
                              class="w-full sm:w-auto px-3 py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                              :title="isLoggedIn ? 'Add to Watchlist' : 'Login to add to Watchlist'"
                            >
                              <font-awesome-icon icon="star" class="text-yellow-400" />
                              <span class="text-xs whitespace-nowrap">Watchlist</span>
                            </button>
                            <button
                              @click="goToTrade(asset.id)"
                              class="w-full sm:w-auto px-3 py-1.5 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                              title="Trade this asset"
                            >
                              <font-awesome-icon icon="exchange-alt" class="text-green-400" />
                              <span class="text-xs whitespace-nowrap">Trade</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Mobile Card View -->
            <div class="sm:hidden space-y-3">
              <div 
                v-for="asset in filteredAssets" 
                :key="asset.id"
                class="bg-white/5 backdrop-blur-xl rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span class="text-white font-semibold">{{ asset.symbol.charAt(0) }}</span>
                    </div>
                    <div>
                      <div class="font-medium text-white text-lg">{{ asset.symbol }}</div>
                      <div class="text-sm text-gray-400 truncate max-w-[150px]">{{ asset.name }}</div>
                    </div>
                  </div>
                  <span
                    :class="`px-2 py-0.5 rounded-full text-xs ${
                      asset.type === 'crypto'
                        ? 'bg-green-500/20 text-green-400'
                        : asset.type === 'stock'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`"
                  >
                    {{ asset.type }}
                  </span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-4">
                  <div class="bg-black/30 p-2 rounded">
                    <div class="text-xs text-gray-400">Price</div>
                    <div class="text-white font-medium">${{ asset.price.toLocaleString() }}</div>
                  </div>
                  <div class="bg-black/30 p-2 rounded">
                    <div class="text-xs text-gray-400">24h Change</div>
                    <div
                      :class="[
                        asset.change_24h === undefined || asset.change_24h === null ? 'text-gray-400' : 
                        asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400',
                        'font-medium'
                      ]"
                    >
                      {{ formatChange(asset.change_24h) }}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between gap-3">
                  <button
                    @click="addToWatchlist(asset.id)"
                    class="flex-1 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    :title="isLoggedIn ? 'Add to Watchlist' : 'Login to add to Watchlist'"
                  >
                    <font-awesome-icon icon="star" class="text-yellow-400" />
                    <span class="text-sm whitespace-nowrap">Watchlist</span>
                  </button>
                  <button
                    @click="goToTrade(asset.id)"
                    class="flex-1 py-2.5 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    title="Trade this asset"
                  >
                    <font-awesome-icon icon="exchange-alt" class="text-green-400" />
                    <span class="text-sm whitespace-nowrap">Trade</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Footer information -->
            <div class="flex justify-between items-center mt-4 px-2 text-sm text-gray-400 flex-wrap gap-2">
              <span>Showing {{ filteredAssets.length }} assets</span>
              <div class="flex items-center">
                <span>Need help? </span>
                <a href="#" class="text-green-400 ml-1 hover:text-green-300">Trading Guide</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
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

/* Improve focus visibility for accessibility */
button:focus, a:focus, input:focus, select:focus {
  outline: 2px solid rgba(34, 197, 94, 0.5);
  outline-offset: 2px;
}

/* Add button hover effect */
button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

button:hover::after {
  opacity: 1;
}

/* Make touch targets larger on mobile */
@media (max-width: 640px) {
  button {
    min-height: 42px;
  }
  
  input, select {
    min-height: 48px;
  }
}

/* Fix dropdown option colors */
.option-dark {
  background-color: rgba(30, 30, 30, 0.9);
  color: white;
}

/* Fix select dropdown options */
select option {
  background-color: #1e1e1e !important;
  color: white !important;
}

/* Override browser styles for select options */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
  padding-right: 2rem !important;
}

/* Add bottom spacing */
.markets-content {
  padding-bottom: 0;
}

/* Ensure mobile view has enough bottom padding */
@media (max-width: 640px) {
  .markets-content {
    padding-bottom: 0;
  }
  
  .overflow-y-auto {
    padding-bottom: 0;
  }
  
  /* Add bottom margin to the last card in mobile view */
  .sm\:hidden > div:last-child {
    margin-bottom: 0;
  }
}

/* Fix mobile responsiveness */
@media (max-width: 640px) {
  .overflow-y-auto {
    height: 100% !important;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure buttons have proper sizing */
  button, input, select {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  /* Optimize grids for mobile */
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
  }
  
  /* Fix table view on small screens */
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Fix select dropdown options */
select option {
  background-color: #1e1e1e !important;
  color: white !important;
  padding: 0.5rem;
  font-size: 1rem;
}

/* Fix scrolling issues */
.content-container {
  scrollbar-gutter: stable; /* Prevent layout shifts when scrollbar appears */
}

/* Fixed width header to match wider PageMain with proper spacing */
.page-header {
  height: 4rem;
  width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto;
  margin-bottom: 1rem !important; /* Ensure consistent spacing between header and main */
}

/* Media query adjustments for smaller screens */
@media (max-width: 1400px) {
  .page-header {
    width: 95vw !important;
    max-width: 1366px !important;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 90vw !important;
    max-width: 1024px !important;
  }
}

@media (max-width: 640px) {
  .page-header {
    height: 3.5rem;
    width: calc(100vw - 2rem) !important;
  }
}

/* Add consistent z-index layering from AdminView */
.z-base {
  z-index: 0;
}
.z-blur {
  z-index: 100;
}
.z-modal {
  z-index: 150;
}
.z-dialog {
  z-index: 200;
}

/* Add proper backdrop styles matching AdminView */
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
}

/* Proper background colors matching AdminView */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05);
}

.bg-black\/40 {
  background-color: rgba(0, 0, 0, 0.4);
}

/* Background color transitions */
.transition-colors {
  transition: background-color 0.15s ease;
}

/* Fix background consistency issues to match AdminView exactly */
.bg-white\/10 {
  background-color: rgba(255, 255, 255, 0.05) !important;
  transition: background-color 0.15s ease;
}

/* Make hover effects consistent */
.hover\:bg-white\/5:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.hover\:bg-white\/10:hover, 
.hover\:bg-white\/15:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Override any Tailwind classes with more specific selectors */
.overflow-x-auto.bg-white\/5,
.overflow-x-auto.backdrop-blur-xl,
.bg-white\/5.backdrop-blur-xl,
.bg-black\/40.backdrop-blur-xl {
  background-color: rgba(255, 255, 255, 0.05) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
}

/* Ensure consistent styles for mobile cards */
.sm\:hidden .bg-white\/5.backdrop-blur-xl {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Ensure mobile info boxes have same background */
.grid-cols-2 .bg-black\/40 {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

/* Fix search input background */
input.bg-white\/10,
select.bg-white\/10 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Update background colors to match AdminView exactly */
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
}

/* Override all Tailwind background classes */
.bg-white\/5, 
.bg-white\/10, 
.bg-white\/20,
[class*="bg-white"] {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Force the same background as AdminView */
.overflow-x-auto {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Override any table background */
table, 
thead, 
tbody,
tr {
  background-color: transparent !important;
}

/* Override hover states */
tr:hover,
.hover\:bg-white\/5:hover,
.hover\:bg-white\/10:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Mobile cards */
.sm\:hidden .bg-white\/5,
.sm\:hidden [class*="bg-white"] {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Force all background elements to use the same style */
div[class*="bg-white"],
.backdrop-blur-xl,
.rounded-xl {
  background-color: rgba(255, 255, 255, 0.05) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
}

/* Match AdminView table styling */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Fix the duplicate table header problem */
.markets-content > .flex.items-center.gap-3.mb-4 {
  display: none;
}

/* Reset any previously added styles that might interfere */
table, thead, tbody, tr {
  background-color: initial;
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Add AdminView specific styles */
.rounded-xl.overflow-hidden {
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Add missing AdminView table styling */
.min-w-\[700px\] {
  min-width: 700px;
}

.whitespace-nowrap {
  white-space: nowrap;
}
</style>
