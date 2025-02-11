<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
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
      fetch('http://localhost:3000/api/data'),
      fetch('http://localhost:3000/api/types'),
      fetch('http://localhost:3000/api/trending-asset'),
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

// Add a new function for price formatting
const formatPrice = (price: number): string => {
  return price % 1 === 0 ? price.toString() : price.toFixed(2)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <PageHeader
    class="w-full flex flex-wrap h-16 bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center sm:justify-around max-w-7xl p-2 sm:p-4 mx-2 sm:mx-8 mb-2 gap-2"
  >
    <!-- existing HeaderLinks -->
  </PageHeader>

  <PageMain
    class="w-full flex flex-col h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-start max-w-7xl mx-2 sm:mx-8 overflow-hidden"
  >
    <div class="w-full h-full p-2 sm:p-4 overflow-y-auto">
      <div v-if="loading" class="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
      <div v-else-if="error" class="text-red-500 text-center py-4 animate-bounce-slow">
        {{ error }}
      </div>
      <div v-else class="space-y-6">
        <!-- Trending Asset Section with pulse effect on last 7 days-->
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

        <!-- Regular Assets Grid -->
        <div class="w-full">
          <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
            <font-awesome-icon icon="coins" class="text-yellow-500 mr-2" />
            All Assets
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="asset in assets"
              :key="asset.id"
              class="bg-white/10 p-4 rounded-xl transition-all duration-300 hover:bg-white/20 hover:shadow-xl cursor-pointer"
            >
              <div class="flex items-center">
                <font-awesome-icon icon="chart-line" class="text-green-400 mr-2" />
                <h3 class="text-white text-lg sm:text-xl font-bold">{{ asset.name }}</h3>
              </div>
              <div class="mt-2 space-y-1">
                <span class="text-gray-300 block">{{ asset.symbol }}</span>
                <span class="text-gray-400 uppercase block text-sm">{{ asset.type }}</span>
                <span class="text-green-400 text-lg font-bold block">
                  ${{ formatPrice(asset.price) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageMain>
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
</style>
