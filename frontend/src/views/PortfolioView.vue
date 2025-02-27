<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FadeIn from '@/components/FadeIn.vue'
import HeaderLink from '@/components/HeaderLink.vue'

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
const error = ref<string | null>(null)

const calculateReturn = (current: number, avg: number) => {
  const returnPct = ((current - avg) / avg) * 100
  return {
    value: returnPct,
    isPositive: returnPct >= 0
  }
}

const totalPositions = computed(() => portfolioData.value.assets.length)

const fetchPortfolioData = async () => {
  if (!userStore.user?.id) {
    error.value = 'User not authenticated'
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
      const errorData = await response.json()
      console.error('Portfolio error data:', errorData)
      
      if (response.status === 404) {
        error.value = 'Portfolio not found: ' + (errorData.message || '')
      } else {
        error.value = `Error: ${errorData.message || 'Unknown error'}`
      }
      return
    }
    
    const data = await response.json()
    console.log('Portfolio data received:', data)
    portfolioData.value = data
  } catch (err) {
    console.error('Portfolio error:', err)
    error.value = 'Failed to load portfolio data: ' + (err.message || '')
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
</script>

<template>
  <div>
    <PageHeader>
      <template #left>
        <h1 class="text-2xl font-bold">Portfolio</h1>
      </template>
      <template #right>
        <HeaderLink to="/trade">Trade</HeaderLink>
      </template>
    </PageHeader>
    
    <PageMain>
      <FadeIn>
        <div v-if="loading" class="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
        
        <div v-else-if="error" class="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {{ error }}
        </div>
        
        <div v-else class="space-y-6">
          <!-- Portfolio Summary -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Portfolio Summary</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${{ portfolioData.totalValue.toLocaleString() }}
                </p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${{ portfolioData.balance.toLocaleString() }}
                </p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">Total Positions</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalPositions }}</p>
              </div>
            </div>
          </div>

          <!-- Holdings List -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Holdings</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th class="text-left py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Symbol</th>
                    <th class="text-right py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Shares</th>
                    <th class="text-right py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Price</th>
                    <th class="text-right py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Current</th>
                    <th class="text-right py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Value</th>
                    <th class="text-right py-3 px-4 text-gray-500 dark:text-gray-400 text-sm font-medium">Return</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-if="portfolioData.assets.length === 0">
                    <td colspan="6" class="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                      No holdings found
                    </td>
                  </tr>
                  <tr v-for="asset in portfolioData.assets" :key="asset.assetId" 
                      class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="py-4 px-4">
                      <div class="flex items-center">
                        <div>
                          <div class="font-medium text-gray-900 dark:text-gray-100">{{ asset.symbol }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{{ asset.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      {{ asset.quantity }}
                    </td>
                    <td class="py-4 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      ${{ asset.averagePrice.toLocaleString() }}
                    </td>
                    <td class="py-4 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      ${{ asset.currentPrice.toLocaleString() }}
                    </td>
                    <td class="py-4 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      ${{ (asset.quantity * asset.currentPrice).toLocaleString() }}
                    </td>
                    <td class="py-4 px-4 text-right">
                      <span :class="[
                        calculateReturn(asset.currentPrice, asset.averagePrice).isPositive ? 
                        'text-green-600 dark:text-green-400' : 
                        'text-red-600 dark:text-red-400',
                        'font-medium'
                      ]">
                        {{ calculateReturn(asset.currentPrice, asset.averagePrice).value.toFixed(2) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </FadeIn>
    </PageMain>
  </div>
</template>
