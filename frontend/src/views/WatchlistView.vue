<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FadeIn from '@/components/FadeIn.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { usePagination } from '@/composables/usePagination'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { handleApiError } from '@/utils/errorHandler'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import FullPageError from '@/components/FullPageError.vue'
import { useI18n } from 'vue-i18n'

interface WatchlistItem {
  watchlistId: number
  id: number
  name: string
  symbol: string
  type: string
  price: number
  alert_price: number | null
  alert_type: string | null
  alert_triggered: boolean
  created_at: string
}

interface WatchlistData {
  items: WatchlistItem[]
}

interface ErrorType {
  message: string
  type: string
}

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const watchlistData = ref<WatchlistData>({
  items: []
})
const error = ref<ErrorType | null>(null)

// Search functionality
const searchQuery = ref('')
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return watchlistData.value.items
  
  const query = searchQuery.value.toLowerCase()
  return watchlistData.value.items.filter(item => 
    item.name.toLowerCase().includes(query) || 
    item.symbol.toLowerCase().includes(query)
  )
})

// Sorting
const currentSort = ref('recent')
const sortedItems = computed(() => {
  const items = [...filteredItems.value]
  
  switch (currentSort.value) {
    case 'price':
      return items.sort((a, b) => b.price - a.price)
    case 'name':
      return items.sort((a, b) => a.symbol.localeCompare(b.symbol))
    case 'change':
      // Would sort by change if data was available
      return items
    case 'recent':
    default:
      return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
})

const totalWatchlistItems = computed(() => watchlistData.value.items.length)

const fetchWatchlistData = async () => {
  if (!userStore.user?.id) {
    error.value = {
      message: 'User not authenticated',
      type: 'auth'
    }
    return
  }

  try {
    loading.value = true
    const userId = userStore.user.id
    console.log('Fetching watchlist for user:', userId)

    const response = await fetch(`http://localhost:3000/api/watchlist/user/${userId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Watchlist response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: 'Failed to parse server response' }
      }

      if (response.status === 404) {
        error.value = {
          message: 'Watchlist not found: ' + (errorData.message || ''),
          type: 'notFound'
        }
      } else {
        throw new Error(`Error: ${errorData.message || 'Unknown error'}`)
      }
      return
    }

    const data = await response.json()
    console.log('Watchlist data received:', data)
    
    // Ensure we have the correct data format
    if (Array.isArray(data)) {
      watchlistData.value = {
        items: data
      }
    } else {
      watchlistData.value = {
        items: []
      }
      console.warn('Expected array of watchlist items but got:', typeof data)
    }
  } catch (err) {
    console.error('Watchlist error:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

// Remove from watchlist function
const removeFromWatchlist = async (watchlistId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/watchlist/${watchlistId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to remove from watchlist')
    }

    // Remove item from local state 
    watchlistData.value.items = watchlistData.value.items.filter(item => item.watchlistId !== watchlistId)
  } catch (err) {
    console.error('Error removing from watchlist:', err)
    // Show error message to user using the handleApiError utility
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message || 'Error removing from watchlist',
      type: processedError.type || 'error'
    }
  }
}

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await fetchWatchlistData()
})

// Price formatting to match HomeView
const formatPrice = (price: number | string): string => {
  // Ensure price is a valid number before formatting
  if (price === null || price === undefined || isNaN(Number(price))) {
    return '0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price));
}

// Use pagination from the same composable as PortfolioView
const {
  tableContainer,
  currentPage,
  paginatedItems,
  totalPages,
  nextPage,
  prevPage,
  visibleItems
} = usePagination(computed(() => sortedItems.value || []))

// Asset type icon mapping
const getAssetTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'crypto':
      return 'coins'
    case 'stock':
      return 'chart-line'
    default:
      return 'question-circle'
  }
}

// API heartbeat check
const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()

// Add mouse move tracking for the header gradient effect - just like in PortfolioView
const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

const { t } = useI18n()

// Navigation to find assets
const goToMarkets = () => {
  router.push('/markets')
}
</script>

<template>
  <!-- API checks and errors -->
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />
  <FullPageError v-else-if="error" :message="error.message" :error-type="error.type" @retry="fetchWatchlistData" />

  <!-- Main content - using the same structure as PortfolioView -->
  <div v-else class="watchlist-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />

    <PageMain>
      <div ref="tableContainer" class="w-full h-full overflow-auto px-2 sm:px-4 py-4">
        <div class="h-full" :class="{ 'overflow-y-auto': watchlistData.items.length > 10 }">
          <div v-if="loading" class="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>

          <div v-else-if="error" class="p-4 bg-red-500/20 rounded-lg border border-red-500/30 text-white mb-4">
            <div class="flex items-center">
              <font-awesome-icon icon="exclamation-circle" class="text-red-400 mr-2 text-xl" />
              <p class="font-medium">{{ error.message || 'An error occurred' }}</p>
            </div>
            <div class="mt-3 flex justify-end">
              <button 
                @click="fetchWatchlistData" 
                class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm flex items-center"
              >
                <font-awesome-icon icon="sync" class="mr-1" />
                Retry
              </button>
            </div>
          </div>

          <div v-else class="space-y-6">
            <!-- Watchlist Summary -->
            <FadeIn>
              <div class="w-full">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <div class="flex items-center gap-3 w-full md:w-auto">
                    <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <font-awesome-icon icon="star" class="text-2xl text-green-400" />
                    </div>
                    <div class="flex-1">
                      <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('watchlist.title') }}</h1>
                      <p class="text-gray-400 mt-1">{{ t('watchlist.subtitle') }}</p>
                    </div>
                  </div>
                  
                  <!-- Controls - improved responsive layout -->
                  <div class="flex flex-col w-full md:w-auto gap-3">
                    <!-- Search and filter row -->
                    <div class="flex flex-col sm:flex-row gap-3 w-full">
                      <div class="relative flex-grow">
                        <input type="text" v-model="searchQuery" placeholder="Search by name or symbol"
                          class="w-full bg-black/40 backdrop-blur-xl text-white border border-white/10 rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none focus:bg-black/60 transition-all duration-200" />
                        <font-awesome-icon icon="search"
                          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <!-- Sort buttons in container - improved for responsiveness -->
                    <div class="flex flex-wrap bg-black/40 backdrop-blur-xl p-1.5 rounded-lg border border-white/10">
                      <button 
                        @click="currentSort = 'name'" 
                        class="sort-btn"
                        :class="currentSort === 'name' ? 'active-sort' : ''"
                      >
                        <font-awesome-icon icon="font" class="mr-1 text-xs" />
                        Name
                      </button>
                      <button 
                        @click="currentSort = 'price'" 
                        class="sort-btn"
                        :class="currentSort === 'price' ? 'active-sort' : ''"
                      >
                        <font-awesome-icon icon="dollar-sign" class="mr-1 text-xs" />
                        Price
                      </button>
                      <button 
                        @click="currentSort = 'recent'" 
                        class="sort-btn"
                        :class="currentSort === 'recent' ? 'active-sort' : ''"
                      >
                        <font-awesome-icon icon="clock" class="mr-1 text-xs" />
                        Recent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <!-- Watchlist Table -->
            <FadeIn>
              <div class="w-full">
                <div class="overflow-x-auto bg-white/5 rounded-xl p-4 border border-white/10">
                  <table class="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr>
                        <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">Asset</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">Price</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">24h Change</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">Alert</th>
                        <th class="text-center py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                      <tr v-if="sortedItems.length === 0">
                        <td colspan="5" class="py-4 px-4 text-center text-gray-400">
                          {{ searchQuery ? 'No assets match your search' : t('watchlist.empty') || 'Your watchlist is empty' }}
                        </td>
                      </tr>
                      <tr v-for="item in paginatedItems" :key="item.watchlistId"
                        class="hover:bg-white/5 transition-colors">
                        <td class="py-4 px-4">
                          <div class="flex items-center">
                            <div class="mr-3 text-green-400">
                              <font-awesome-icon :icon="getAssetTypeIcon(item.type)" />
                            </div>
                            <div>
                              <div class="font-medium text-white">{{ item.symbol }}</div>
                              <div class="text-sm text-gray-400">{{ item.name }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          ${{ formatPrice(item.price) }}
                        </td>
                        <td class="py-4 px-4 text-right text-gray-400">
                          N/A
                        </td>
                        <td class="py-4 px-4 text-right">
                          <span v-if="item.alert_price" :class="item.alert_triggered ? 'text-red-400' : 'text-green-400'">
                            {{ item.alert_type === 'above' ? '>' : '<' }} ${{ formatPrice(item.alert_price) }}
                          </span>
                          <span v-else class="text-gray-400">None</span>
                        </td>
                        <td class="py-4 px-4 text-center">
                          <div class="flex justify-center gap-2">
                            <router-link :to="`/trade/${item.id}`" 
                              class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm flex items-center">
                              <font-awesome-icon icon="exchange-alt" class="mr-1" />
                              Trade
                            </router-link>
                            <button @click="removeFromWatchlist(item.watchlistId)"
                              class="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors text-sm flex items-center">
                              <font-awesome-icon icon="trash" class="mr-1" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Pagination section - exactly like PortfolioView -->
                  <div class="mt-4 flex items-center justify-between px-4">
                    <div class="text-sm text-gray-400">
                      Showing {{ sortedItems.length ? ((currentPage - 1) * visibleItems) + 1 : 0 }} -
                      {{ Math.min(currentPage * visibleItems, sortedItems.length) }} of
                      {{ sortedItems.length }} items
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click="prevPage" :disabled="currentPage === 1"
                        class="px-3 py-1 rounded-lg transition-colors" :class="[
                          currentPage === 1
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        ]">
                        <font-awesome-icon icon="chevron-left" />
                      </button>

                      <span class="text-gray-400">
                        Page {{ currentPage }} of {{ totalPages }}
                      </span>

                      <button @click="nextPage" :disabled="currentPage === totalPages || totalPages === 0"
                        class="px-3 py-1 rounded-lg transition-colors" :class="[
                          currentPage === totalPages
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        ]">
                        <font-awesome-icon icon="chevron-right" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
/* Ensure scrollbar only shows when needed */
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
    min-height: 44px;
  }
}

/* Add table hover effect */
tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Update background opacity to match AdminView */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Clean up table borders */
.border-collapse {
  border-collapse: collapse;
}

/* Update empty state and error state backgrounds to match */
.bg-black\/40 {
  background-color: rgba(0, 0, 0, 0.4) !important;
}

/* Add pagination specific styles */
tr {
  height: 72px;
}

/* Ensure PageMain has consistent height */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important;
}

/* Set explicit sizing for main container */
.watchlist-view {
  padding-top: 0 !important;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: auto !important;
}

/* Fix scrolling container */
[ref="tableContainer"] {
  height: auto !important;
  min-height: 200px;
  overflow: auto !important;
  flex: 1;
}

/* Add sort buttons styling */
.sort-btn {
  @apply flex items-center justify-center px-2 sm:px-3 py-1.5 mx-0.5 my-0.5 rounded transition-colors text-sm;
  flex: 1 1 auto;
  min-width: 60px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
}

.sort-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.active-sort {
  background-color: rgba(34, 197, 94, 0.6);
  color: white;
  border-color: rgba(74, 222, 128, 0.6);
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
}

/* Add enhanced blur effects */
.bg-white\/10 {
  background-color: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(8px);
}

.bg-black\/40 {
  backdrop-filter: blur(8px);
}

/* Responsive styles for sort buttons */
@media (max-width: 640px) {
  .sort-btn {
    min-width: calc(33% - 8px);
    margin: 2px;
    padding: 6px 8px;
    font-size: 0.8rem;
  }
}

@media (max-width: 350px) {
  .sort-btn {
    min-width: calc(50% - 6px);
    padding: 5px 6px;
  }
}
</style> 