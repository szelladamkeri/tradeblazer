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

interface PortfolioData {
  assets: Array<{
    assetId: number
    name: string
    symbol: string
    type: string
    currentPrice: number
    quantity: number
    averagePrice: number
  }>
  balance: number
  totalValue: number
}

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const portfolioData = ref<PortfolioData>({
  assets: [],
  balance: 0,
  totalValue: 0
})
const error = ref<{ message: string; type: string } | null>(null)

const calculateReturn = (current: number, avg: number) => {
  const returnPct = ((current - avg) / avg) * 100
  return {
    value: returnPct,
    isPositive: returnPct >= 0
  }
}

// Update the percentage calculation function to handle division by zero
function calculateReturnPercentage(initialValue, currentValue) {
  // Check if initial value is zero or extremely small
  if (!initialValue || initialValue < 0.0001) {
    return 'N/A'; // Return "N/A" instead of infinity
  }

  const percentage = ((currentValue - initialValue) / initialValue) * 100;
  return `${percentage.toFixed(2)}%`;
}

const totalPositions = computed(() => portfolioData.value.assets.length)

const fetchPortfolioData = async () => {
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
    console.log('Fetching portfolio for user:', userId)

    const response = await fetch(`http://localhost:3000/api/portfolio/${userId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Portfolio response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: 'Failed to parse server response' }
      }

      if (response.status === 404) {
        error.value = {
          message: 'Portfolio not found: ' + (errorData.message || ''),
          type: 'notFound'
        }
      } else {
        throw new Error(`Error: ${errorData.message || 'Unknown error'}`)
      }
      return
    }

    const data = await response.json()
    console.log('Portfolio data received:', data)
    portfolioData.value = data
  } catch (err) {
    console.error('Portfolio error:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await fetchPortfolioData()
})

// Price formatting to match HomeView
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const {
  tableContainer,
  currentPage,
  paginatedItems: paginatedAssets,
  totalPages,
  nextPage,
  prevPage,
  visibleItems
} = usePagination(computed(() => portfolioData.value?.assets || []))

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

</script>

<template>
  <!-- First check API heartbeat status -->
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />

  <!-- Then check for other errors -->
  <FullPageError v-else-if="error" :message="error.message" :error-type="error.type" @retry="fetchPortfolioData" />

  <!-- Only render normal page when there's no error -->
  <div v-else class="portfolio-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />

    <PageMain>
      <div ref="tableContainer" class="w-full h-full overflow-auto px-2 sm:px-4 py-4">
        <!-- Add the conditional overflow container to match MarketsView -->
        <div class="h-full" :class="{ 'overflow-y-auto': portfolioData.assets.length > 10 }">
          <div v-if="loading" class="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>

          <ErrorDisplay v-else-if="error" :message="error.message" :error-type="error.type"
            @retry="fetchPortfolioData" />

          <div v-else class="space-y-6">
            <!-- Portfolio Summary -->
            <FadeIn>
              <div class="w-full">
                <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                  <font-awesome-icon icon="wallet" class="text-green-400 mr-2" />
                  Portfolio Summary
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Total Value</p>
                    <p class="text-green-400 text-2xl font-bold">
                      ${{ formatPrice(portfolioData.totalValue) }}
                    </p>
                  </div>
                  <div
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Available Balance</p>
                    <p class="text-green-400 text-2xl font-bold">
                      ${{ formatPrice(portfolioData.balance) }}
                    </p>
                  </div>
                  <div
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Total Positions</p>
                    <p class="text-green-400 text-2xl font-bold">{{ totalPositions }}</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <!-- Holdings List -->
            <FadeIn>
              <div class="w-full">
                <div class="flex items-center mb-4">
                  <font-awesome-icon icon="wallet" class="mr-2 text-green-400" />
                  <h1 class="text-2xl font-bold">Holdings</h1>
                </div>
                <div class="overflow-x-auto bg-white/5 rounded-xl p-4 border border-white/10">
                  <table class="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr>
                        <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          Symbol</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          Shares</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">Avg
                          Price</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          Current</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          Value</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          Return</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                      <tr v-if="portfolioData.assets.length === 0">
                        <td colspan="6" class="py-4 px-4 text-center text-gray-400">
                          No holdings found
                        </td>
                      </tr>
                      <tr v-for="asset in paginatedAssets" :key="asset.assetId"
                        class="hover:bg-white/5 transition-colors">
                        <td class="py-4 px-4">
                          <div class="flex items-center">
                            <div>
                              <div class="font-medium text-white">{{ asset.symbol }}</div>
                              <div class="text-sm text-gray-400">{{ asset.name }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          {{ asset.quantity }}
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          ${{ formatPrice(asset.averagePrice) }}
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          ${{ formatPrice(asset.currentPrice) }}
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          ${{ formatPrice(asset.quantity * asset.currentPrice) }}
                        </td>
                        <td class="py-4 px-4 text-right">
                          <span :class="[
                            calculateReturnPercentage(asset.averagePrice, asset.currentPrice) === 'N/A' ? 'text-gray-400' :
                              parseFloat(calculateReturnPercentage(asset.averagePrice, asset.currentPrice)) >= 0 ? 'text-green-400' : 'text-red-400'
                          ]">
                            {{ calculateReturnPercentage(asset.averagePrice, asset.currentPrice) === 'N/A' ? 'N/A' :
                              calculateReturnPercentage(asset.averagePrice, asset.currentPrice) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Replace the pagination section -->
                  <div class="mt-4 flex items-center justify-between px-4">
                    <div class="text-sm text-gray-400">
                      Showing {{ portfolioData.assets?.length ? ((currentPage - 1) * visibleItems) + 1 : 0 }} to
                      {{ Math.min(currentPage * visibleItems, portfolioData.assets?.length || 0) }} of
                      {{ portfolioData.assets?.length || 0 }} positions
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

                      <button @click="nextPage" :disabled="currentPage === totalPages"
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

/* Remove any conflicting page-header styles */

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
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Add pagination specific styles */
tr {
  height: 72px;
}

.overflow-y-auto {
  overflow: hidden !important;
}

::-webkit-scrollbar {
  display: none;
}

.overflow-x-auto {
  scrollbar-width: none;
}

/* Ensure PageMain has consistent height */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important;
  /* Contain overflow */
}

/* Set explicit sizing for main container */
.portfolio-view {
  padding-top: 0 !important;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: auto !important;
  /* Remove fixed height */
}

/* Fix scrolling container */
[ref="tableContainer"] {
  height: auto !important;
  min-height: 200px;
  overflow: auto !important;
  flex: 1;
}
</style>
