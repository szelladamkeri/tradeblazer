<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FadeIn from '@/components/FadeIn.vue'
import { ref, onMounted } from 'vue'

interface Asset {
  id: number
  name: string
  type: string //using /api/types
  symbol: string
  price: number
}

const assets = ref<Asset[]>([])
const types = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const trendingAsset = ref<Asset | null>(null)

const fetchData = async (): Promise<void> => {
  try {
    loading.value = true
    const [assetsResponse, typesResponse, trendingResponse] = await Promise.all([
      fetch('http://localhost:3000/api/assets/data'),        // Changed from /api/data
      fetch('http://localhost:3000/api/assets/types'),       // Changed from /api/types
      fetch('http://localhost:3000/api/assets/trending')     // Changed from /api/trending-asset
    ])

    if (!assetsResponse.ok) {
      throw new Error(`Server returned ${assetsResponse.status}: ${await assetsResponse.text()}`)
    }
    if (!typesResponse.ok) {
      throw new Error(`Server returned ${typesResponse.status}: ${await typesResponse.text()}`)
    }
    if (!trendingResponse.ok) {
      throw new Error(
        `Server returned ${trendingResponse.status}: ${await trendingResponse.text()}`,
      )
    }

    const assetsData = await assetsResponse.json()
    const typesData = await typesResponse.json()
    const trendingData = await trendingResponse.json()

    assets.value = assetsData
    types.value = typesData
    trendingAsset.value = trendingData
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      error.value = 'Error fetching data: Server is not running'
    } else {
      error.value = `Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

const getTrendingAsset = () => {
  return trendingAsset.value
}

// Price formatting
const formatPrice = (price: number): string => {
  return price % 1 === 0 ? price.toString() : price.toFixed(2)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="flex flex-col">
    <PageHeader />
    <PageMain>
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
        <div v-else-if="error" class="text-red-500 text-center py-4 animate-bounce-slow">
          {{ error }}
        </div>
        <div v-else class="space-y-6">
          <FadeIn>
            <div v-if="getTrendingAsset()" class="w-full">
              <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                <font-awesome-icon icon="fire" class="text-orange-500 mr-2" />
                Trending Now on TradeBlazer
                <span class="text-gray-400 animate-pulse-slow">(last 7 days)</span>
              </h2>
              <div
                class="bg-white/10 p-4 rounded-xl transition-all duration-300 hover:bg-white/20 hover:shadow-xl cursor-pointer"
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <h3 class="text-white text-2xl sm:text-3xl font-bold">
                      {{ getTrendingAsset()?.name }}
                    </h3>
                    <span class="text-gray-300 text-lg sm:text-xl mt-1 block">
                      {{ getTrendingAsset()?.symbol }}
                    </span>
                    <span class="text-gray-400 uppercase text-base mt-1 block">
                      {{ getTrendingAsset()?.type }}
                    </span>
                  </div>
                  <div class="text-left sm:text-right">
                    <span class="text-green-400 text-2xl sm:text-3xl font-bold block">
                      ${{ formatPrice(getTrendingAsset()?.price || 0) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div class="w-full">
              <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                <font-awesome-icon icon="coins" class="text-yellow-500 mr-2" />
                All Assets
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                <div
                  v-for="asset in assets"
                  :key="asset.id"
                  class="bg-white/10 p-4 rounded-xl transition-all duration-300 hover:bg-white/20 hover:shadow-xl cursor-pointer flex flex-col"
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
</style>
