<template>
  <!-- First check API heartbeat status -->
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />

  <!-- Then check for other errors -->
  <FullPageError v-else-if="error" :message="error.message" :error-type="error.type" @retry="fetchAssetDetails" />

  <!-- Only render normal page when there's no error -->
  <div v-else class="flex flex-col">
    <PageHeader class="mb-4" @mousemove="handleMouseMove" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>

        <div v-else-if="asset" class="space-y-6">

          <div class="bg-white/5 rounded-xl p-6 border border-white/10">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-white">{{ asset.name }}</h1>
                <p class="text-gray-400">{{ asset.symbol }}</p>
              </div>
              <div class="flex items-center gap-4">
                <!-- Watchlist Button -->
                <button @click="toggleWatchlist" :disabled="watchlistLoading"
                  class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  :class="isInWatchlist ? 'text-green-400' : 'text-gray-400'">
                  <font-awesome-icon :icon="['fas', 'star']" :class="{ 'animate-pulse': watchlistLoading }" />
                </button>
                <div class="text-green-400 text-3xl font-bold">
                  ${{ formatPrice(asset.price) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Chart Placeholder -->
          <div class="bg-white/5 rounded-xl p-6 border border-white/10 h-[400px] relative">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <font-awesome-icon icon="chart-line" class="text-4xl text-gray-600 mb-4" />
                <p class="text-gray-400">Chart integration coming soon</p>
              </div>
            </div>
            <canvas id="priceChart" class="w-full h-full"></canvas>
          </div>

          <div class="bg-white/10 p-6 rounded-xl border border-white/10" v-if="isLoggedIn">
            <h3 class="text-xl font-bold text-white mb-4">Trade Asset</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-200 text-sm font-medium mb-2">Quick Trade</label>
                <div class="flex gap-2">
                  <button v-for="preset in tradePresets" :key="preset.name" @click="applyPreset(preset.value)"
                    class="flex-1 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                    {{ preset.name }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-gray-200 text-sm font-medium mb-2">Trade Type</label>
                <div class="relative">
                  <select v-model="tradeType"
                    class="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white appearance-none pr-10 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20">
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <font-awesome-icon icon="chevron-down" class="text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-gray-200 text-sm font-medium mb-2">Quantity</label>
                <input type="number" v-model="quantity" min="0.00000001" step="0.00000001"
                  class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white">
              </div>

              <div class="p-4 bg-black/30 rounded-lg mt-6">
                <div class="flex justify-between items-center">
                  <span class="text-gray-300">Total Value:</span>
                  <span class="text-green-400 text-xl font-bold">
                    ${{ formatPrice(quantity * asset.price) }}
                  </span>
                </div>
              </div>

              <div class="pt-4 border-t border-white/10">
                <button @click="showAlertForm = !showAlertForm"
                  class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <font-awesome-icon icon="bell" />
                  Set Price Alert
                </button>
              </div>

              <div v-if="showAlertForm" class="space-y-4 p-4 bg-black/20 rounded-lg">
                <div class="flex gap-4">
                  <div class="flex-1">
                    <label class="block text-gray-200 text-sm font-medium mb-2">Alert Type</label>
                    <div class="relative">
                      <select v-model="alertType"
                        class="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white appearance-none pr-10">
                        <option value="above">Price Above</option>
                        <option value="below">Price Below</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <font-awesome-icon icon="chevron-down" class="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <label class="block text-gray-200 text-sm font-medium mb-2">Price</label>
                    <input v-model.number="alertPrice" type="number" min="0" step="0.01"
                      class="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white" />
                  </div>
                </div>
                <button
                  class="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                  Set Alert
                </button>
              </div>

              <button @click="executeTrade" :disabled="!canTrade"
                class="w-full mt-4 py-3 px-5 bg-green-600 disabled:bg-green-600/50 text-white rounded-lg">
                Execute Trade
              </button>
            </div>
          </div>

          <div v-else class="bg-white/10 p-6 rounded-xl border border-white/10 text-center">
            <p class="text-gray-300 mb-4">Please log in to trade this asset</p>
            <button @click="$router.push('/login')" class="py-3 px-6 bg-green-600 text-white rounded-lg">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { handleApiError } from '@/utils/errorHandler'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import FullPageError from '@/components/FullPageError.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Add isLoggedIn computed property
const isLoggedIn = computed(() => userStore.isAuthenticated)

// Strengthen type safety
interface Asset {
  id: number
  name: string
  symbol: string
  type: string
  price: number
  change_24h: number
  market_cap?: number
  volume_24h?: number
}

// Update refs with proper typing
const asset = ref<Asset | null>(null)
const loading = ref(true)
const error = ref<{ message: string; type: string } | null>(null)

// Trade form data
const quantity = ref(1)
const orderType = ref('market') // market or limit
const tradeType = ref('buy') // buy or sell
const limitPrice = ref(0)

// Trading form state
const orderSubmitting = ref(false)
const orderSuccess = ref(false)
const orderError = ref<string | null>(null)

// Watchlist state
const isInWatchlist = ref(false)
const watchlistLoading = ref(false)

// Add price alert state 
const showAlertForm = ref(false)
const alertPrice = ref(0)
const alertType = ref('above') // 'above' or 'below'

// Add quick trade presets
const tradePresets = [
  { name: '25%', value: 0.25 },
  { name: '50%', value: 0.5 },
  { name: '75%', value: 0.75 },
  { name: 'Max', value: 1 }
]

// Add transaction fee calculation
const transactionFee = computed(() => {
  if (!asset.value || !quantity.value) return 0
  return quantity.value * asset.value.price * 0.001 // 0.1% fee
})

// Update canTrade computed to include fees
const canTrade = computed(() => {
  if (!isLoggedIn.value || !asset.value || !quantity.value) return false

  const totalCost = quantity.value * asset.value.price + transactionFee.value
  const userBalance = userStore.user?.balance || 0

  if (tradeType.value === 'sell') {
    // Check user's asset holdings for sells
    return true // TODO: Implement holding check
  }

  return userBalance >= totalCost
})

// Price formatting
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// API heartbeat check
const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()

// Fetch asset details
const fetchAssetDetails = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:3000/api/assets/${route.params.id}`)
    if (!response.ok) throw new Error('Failed to fetch asset details')

    const data = await response.json()
    asset.value = data

    // Check if in watchlist (placeholder)
    isInWatchlist.value = false // TODO: Implement watchlist check
  } catch (err) {
    console.error('Error fetching asset:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

// Handle trade submission
const handleTrade = async () => {
  if (!isLoggedIn.value || !asset.value) return

  orderSubmitting.value = true
  orderError.value = null

  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({
        assetId: asset.value.id,
        quantity: quantity.value,
        orderType: orderType.value,
        tradeType: tradeType.value,
        limitPrice: orderType.value === 'limit' ? limitPrice.value : undefined
      })
    })

    if (!response.ok) throw new Error('Failed to place order')

    const data = await response.json()
    orderSuccess.value = true
    await userStore.refreshBalance() // Refresh user's balance

  } catch (err) {
    console.error('Trade error:', err)
    orderError.value = err instanceof Error ? err.message : 'Failed to place order'
  } finally {
    orderSubmitting.value = false
  }
}

// Handle watchlist toggle
const toggleWatchlist = async () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  watchlistLoading.value = true
  try {
    const endpoint = `http://localhost:3000/api/watchlist/${asset.value?.id}`
    const method = isInWatchlist.value ? 'DELETE' : 'POST'

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })

    if (!response.ok) throw new Error('Failed to update watchlist')
    isInWatchlist.value = !isInWatchlist.value
  } catch (err) {
    console.error('Watchlist error:', err)
  } finally {
    watchlistLoading.value = false
  }
}

// Handle preset selection
const applyPreset = (value: number) => {
  if (!asset.value || !userStore.user?.balance) return
  const maxQuantity = userStore.user.balance / asset.value.price
  quantity.value = Number((maxQuantity * value).toFixed(8))
}

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement
  const rect = main.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  main.style.setProperty('--mouse-x', `${x}%`)
  main.style.setProperty('--mouse-y', `${y}%`)
}

onMounted(fetchAssetDetails)
</script>

<style scoped>
.trade-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.asset-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.trade-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.trade-button {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.trade-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  padding: 20px;
  background: #ffebee;
  color: #d32f2f;
  border-radius: 8px;
  margin: 20px 0;
}

/* Add interactive gradient effect */
:deep(.page-main)::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(74, 222, 128, 0.08) 0%,
      transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 1;
  border-radius: 0.75rem;
}

:deep(.page-main):hover::after {
  opacity: 1;
}

/* Add consistent scrollbar styling */
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

/* Match styling with other views */
.trade-view {
  padding-top: 0 !important;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Ensure proper content height */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important;
}

/* Improve dropdown appearance */
select {
  background-image: none;
}

/* Add chart placeholder styling */
#priceChart {
  opacity: 0.1;
}
</style>
