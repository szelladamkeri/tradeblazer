<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FadeIn from '@/components/FadeIn.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { handleApiError } from '@/utils/errorHandler'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import FullPageError from '@/components/FullPageError.vue'

interface Asset {
  id: number
  name: string
  type: string //using /api/types
  symbol: string
  price: number
  trade_count?: number
}

const assets = ref<Asset[]>([])
const types = ref<string[]>([])
const loading = ref(true)
const error = ref<{ message: string; type: string } | null>(null)
const trendingAssets = ref<Asset[]>([])
const router = useRouter()

const fetchData = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    
    const [assetsResponse, typesResponse, trendingResponse] = await Promise.all([
      fetch('http://localhost:3000/api/assets/data'),        // Changed from /api/data
      fetch('http://localhost:3000/api/assets/types'),       // Changed from /api/types
      fetch('http://localhost:3000/api/assets/trending')     // Changed from /api/trending-asset
    ])

    // Check for HTTP error responses
    if (!assetsResponse.ok) {
      const errorData = await assetsResponse.text()
      throw new Error(`Server returned ${assetsResponse.status}: ${errorData}`)
    }
    if (!typesResponse.ok) {
      const errorData = await typesResponse.text()
      throw new Error(`Server returned ${typesResponse.status}: ${errorData}`)
    }
    if (!trendingResponse.ok) {
      const errorData = await trendingResponse.text()
      throw new Error(`Server returned ${trendingResponse.status}: ${errorData}`)
    }

    const assetsData = await assetsResponse.json()
    const typesData = await typesResponse.json()
    const trendingData = await trendingResponse.json()

    assets.value = assetsData
    types.value = typesData
    trendingAssets.value = Array.isArray(trendingData) ? trendingData : [trendingData]
  } catch (err) {
    console.error('Fetch error:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

const getMostTrendingAsset = () => trendingAssets.value[0]
const getOtherTrendingAssets = () => trendingAssets.value.slice(1)

// Price formatting
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()

onMounted(() => {
  fetchData()
})
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
    @retry="fetchData"
  />
  
  <!-- Only render normal page when there's no error -->
  <div v-else class="flex flex-col home-view">
    <PageHeader class="mb-4" />
    <PageMain>
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
        
        <ErrorDisplay
          v-else-if="error"
          :message="error.message"
          :error-type="error.type"
          @retry="fetchData"
        />
        
        <div v-else class="space-y-6">
          <FadeIn v-if="getMostTrendingAsset()">
            <div v-if="getMostTrendingAsset()" class="w-full">
              <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                <font-awesome-icon icon="fire" class="text-orange-500 mr-2" />
                Trending Now on TradeBlazer
                <span class="text-gray-400 animate-pulse-slow">(last 7 days)</span>
              </h2>
              <div
                class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl cursor-pointer"
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <h3 class="text-white text-2xl sm:text-3xl font-bold">
                      {{ getMostTrendingAsset()?.name }}
                    </h3>
                    <span class="text-gray-300 text-lg sm:text-xl mt-1 block">
                      {{ getMostTrendingAsset()?.symbol }}
                    </span>
                    <span class="text-gray-400 uppercase text-base mt-1 block">
                      {{ getMostTrendingAsset()?.type }}
                    </span>
                  </div>
                  <div class="text-left sm:text-right">
                    <span class="text-green-400 text-2xl sm:text-3xl font-bold block">
                      ${{ formatPrice(getMostTrendingAsset()?.price || 0) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn v-if="getOtherTrendingAssets().length > 0">
            <div class="w-full">
              <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                <font-awesome-icon icon="fire" class="text-orange-500 mr-2" />
                Top Trending Assets
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                <!-- Change from trendingAssets.slice(1, 7) to use getOtherTrendingAssets() -->
                <div
                  v-for="asset in getOtherTrendingAssets()"
                  :key="asset.id"
                  @click="router.push(`/markets/${asset.id}`)"
                  class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl cursor-pointer flex flex-col"
                >
                  <div class="flex items-center mb-2">
                    <font-awesome-icon icon="chart-line" class="text-green-400 mr-2" />
                    <h3 class="text-white text-lg sm:text-xl font-bold truncate">
                      {{ asset.name }}
                    </h3>
                  </div>
                  <div class="flex flex-col justify-between flex-grow">
                    <div>
                      <span class="text-gray-300 block truncate">{{ asset.symbol }}</span>
                      <span class="text-gray-400 uppercase block text-sm">{{ asset.type }}</span>
                    </div>
                    <span class="text-green-400 text-lg font-bold mt-2">
                      ${{ formatPrice(asset.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
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

/* Remove the duplicate page-header styles as they're now handled by the component */
/* 
.page-header {
  height: 4rem;
  width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto;
  margin-bottom: 1rem !important;
}

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
*/

/* Add pagination specific styles - same as PortfolioView */
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
</style>
