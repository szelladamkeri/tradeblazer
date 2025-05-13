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
          <!-- Asset header -->
          <div class="dashboard-panel">
            <div class="panel-inner">
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
            <div class="corner-decor top-left"></div>
            <div class="corner-decor top-right"></div>
            <div class="corner-decor bottom-left"></div>
            <div class="corner-decor bottom-right"></div>
          </div>

          <!-- Price Chart -->
          <div class="dashboard-panel">
            <div class="panel-inner">
              <PriceChart v-if="asset" :asset-id="asset.id" @chart-error="handleChartError" />
              <div v-if="chartError" class="text-red-400 text-sm mt-2">Chart error: {{ chartError }}</div>
            </div>
            <div class="corner-decor top-left"></div>
            <div class="corner-decor top-right"></div>
            <div class="corner-decor bottom-left"></div>
            <div class="corner-decor bottom-right"></div>
          </div>

          <!-- Trading Panel -->
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
                  class="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white">
                <div v-if="tradeType === 'sell'" class="text-xs text-gray-400 mt-1">
                  You own: {{ ownedQuantity }} {{ asset.symbol }}
                </div>
              </div>

              <div class="p-4 bg-black/30 rounded-lg mt-6">
                <div class="flex justify-between items-center">
                  <span class="text-gray-300">Total Value:</span>
                  <span class="text-green-400 text-xl font-bold">
                    ${{ formatPrice(quantity * asset.price) }}
                  </span>
                </div>
              </div>

              <!-- Display order error message -->
              <div v-if="orderError" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div class="text-red-400 text-sm">{{ orderError }}</div>
              </div>

              <!-- Display order success message -->
              <div v-if="orderSuccess" class="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div class="text-green-400 text-sm">Trade executed successfully!</div>
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

                <div v-if="alertError" 
                     class="mt-2 p-2 bg-red-500/20 text-red-400 rounded-lg text-center">
                  {{ alertError }}
                </div>

                <div v-if="alertSuccess" 
                     class="mt-2 p-2 bg-green-500/20 text-green-400 rounded-lg text-center">
                  Price alert set successfully!
                </div>

                <button @click="handleSetAlert"
                  class="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                  Set Alert
                </button>
              </div>

              <button @click="handleTrade" :disabled="!canTrade"
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
import PriceChart from '@/components/PriceChart.vue'

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
  watchlistId?: number
}

// Update refs with proper typing
const asset = ref<Asset | null>(null)
const loading = ref(true)
const error = ref<{ message: string; type: string } | null>(null)

// Add chart error handling
const chartError = ref<string | null>(null)
const handleChartError = (error: string) => {
  console.error('Chart error details:', error)
  chartError.value = error
}

// Trade form data
const quantity = ref(1)
const tradeType = ref('buy') // buy or sell

// Trading form state
const orderSubmitting = ref(false)
const orderSuccess = ref(false)
const orderError = ref<string | null>(null)

// Watchlist state
const isInWatchlist = ref(false)
const watchlistLoading = ref(false)

// Add user's owned quantity of this asset
const ownedQuantity = ref(0)

// Add price alert state
const showAlertForm = ref(false)
const alertPrice = ref(0)
const alertType = ref('above')
const alertSuccess = ref(false)
const alertError = ref<string | null>(null) // Add this

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
    // Check if the user has enough of the asset to sell
    return quantity.value <= ownedQuantity.value
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
  chartError.value = null // Reset chart error on new fetch

  try {
    const response = await fetch(`http://localhost:3000/api/assets/${route.params.id}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Asset fetch response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error('Failed to fetch asset details')
    }

    const data = await response.json()
    asset.value = data
    console.log('Asset details loaded:', data)

    // Check if the user is logged in, then check if asset is in watchlist
    if (isLoggedIn.value && userStore.user) {
      await checkWatchlistStatus(data.id)
      
      // Fetch user's owned quantity of this asset
      await fetchOwnedQuantity(data.id)
    } else {
      isInWatchlist.value = false
      ownedQuantity.value = 0
    }
  } catch (err) {
    console.error('Error fetching asset details:', err)
    if (err instanceof Error) {
      console.error('Error name:', err.name)
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
    } else {
      console.error('Unknown error type:', err)
    }

    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

// Add function to fetch user's owned quantity of this asset
const fetchOwnedQuantity = async (assetId: number) => {
  if (!isLoggedIn.value || !userStore.user) {
    ownedQuantity.value = 0
    return
  }
  
  try {
    // Fetch the user's portfolio
    const response = await fetch(`http://localhost:3000/api/portfolio/${userStore.user.id}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (!response.ok) {
      console.error('Error fetching portfolio data')
      return
    }
    
    const portfolioData = await response.json()
    
    // Find this asset in the portfolio
    const assetInfo = portfolioData.assets.find((a: any) => a.assetId === assetId)
    ownedQuantity.value = assetInfo ? assetInfo.quantity : 0
    
    console.log(`User owns ${ownedQuantity.value} of asset ${assetId}`)
  } catch (err) {
    console.error('Error fetching user asset quantity:', err)
    ownedQuantity.value = 0
  }
}

// Add a new function to check watchlist status
const checkWatchlistStatus = async (assetId) => {
  try {
    console.log('Checking watchlist status for asset:', assetId)
    const response = await fetch(
      `http://localhost:3000/api/watchlist/check/${userStore.user.id}/${assetId}`,
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Watchlist check response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      console.warn('Failed to check watchlist status')
      isInWatchlist.value = false
      return
    }

    const data = await response.json()
    console.log('Watchlist check result:', data)
    isInWatchlist.value = data.isInWatchlist

    // Store the watchlist ID if the asset is in the watchlist
    if (data.isInWatchlist && asset.value) {
      console.log('Asset is in watchlist with ID:', data.watchlistId)
      asset.value.watchlistId = data.watchlistId
    }
  } catch (err) {
    console.error('Error checking watchlist status:', err)
    isInWatchlist.value = false
  }
}

// Handle trade submission
const handleTrade = async () => {
  if (!isLoggedIn.value || !asset.value) return

  // Validation before API call
  if (tradeType.value === 'sell' && quantity.value > ownedQuantity.value) {
    orderError.value = `You only own ${ownedQuantity.value} units of this asset. You cannot sell more than you own.`
    return
  }

  orderSubmitting.value = true
  orderError.value = null

  try {
    console.log('Submitting trade:', {
      assetId: asset.value.id,
      quantity: quantity.value,
      tradeType: tradeType.value,
      userId: userStore.user!.id,
      orderType: 'market'
    })

    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({
        userId: userStore.user!.id,
        assetId: asset.value.id,
        quantity: quantity.value,
        tradeType: tradeType.value,
        orderType: 'market' // Default to market order
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Trade response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      // Try to parse the error response for more details
      try {
        const errorData = JSON.parse(errorText)
        console.error('Parsed error details:', errorData)
        throw new Error(errorData.details || errorData.message || 'Failed to place order')
      } catch (parseError) {
        console.error('Could not parse error response:', parseError)
        throw new Error(`Failed to place order: ${errorText}`)
      }
    }

    const data = await response.json()
    console.log('Trade success:', data)
    orderSuccess.value = true
    
    // Refresh user data
    try {
      await userStore.refreshUser()
    } catch (refreshError) {
      console.error('Failed to refresh user data:', refreshError)
      // Don't cancel the order success message, just show a warning
    }
    
    // Wait briefly to ensure the refreshUser() call completes
    setTimeout(() => {
      // Refresh asset details to show updated price/market data
      fetchAssetDetails()
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        orderSuccess.value = false
      }, 3000)
    }, 500)
  } catch (err) {
    console.error('Trade error details:', err)
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
    const userId = userStore.user!.id

    if (isInWatchlist.value && asset.value) {
      // For DELETE, use the watchlistId we got from checkWatchlistStatus
      const watchlistId = asset.value.watchlistId

      if (!watchlistId) {
        console.log('No watchlist ID found, attempting to fetch it')
        await checkWatchlistStatus(asset.value.id)

        // If still no watchlist ID, reset state and return
        if (!asset.value.watchlistId) {
          console.warn('Still no watchlist ID found after check, resetting state')
          isInWatchlist.value = false
          watchlistLoading.value = false
          return
        }
      }

      console.log('Removing from watchlist, ID:', asset.value.watchlistId)
      const deleteResponse = await fetch(`http://localhost:3000/api/watchlist/${asset.value.watchlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text()
        console.error('Watchlist delete response error:', {
          status: deleteResponse.status,
          statusText: deleteResponse.statusText,
          body: errorText
        })
        throw new Error('Failed to remove from watchlist')
      }

      console.log('Successfully removed from watchlist')
      delete asset.value.watchlistId
    } else {
      console.log('Adding to watchlist, asset ID:', asset.value?.id)
      const addResponse = await fetch(`http://localhost:3000/api/watchlist/${asset.value?.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userStore.user!.id
        })
      })

      if (!addResponse.ok) {
        const errorText = await addResponse.text()
        console.error('Watchlist add response error:', {
          status: addResponse.status,
          statusText: addResponse.statusText,
          body: errorText
        })
        throw new Error('Failed to add to watchlist')
      }

      const data = await addResponse.json()
      console.log('Successfully added to watchlist, new ID:', data?.id)
      if (data && data.id && asset.value) {
        asset.value.watchlistId = data.id
      }
    }

    isInWatchlist.value = !isInWatchlist.value
  } catch (err) {
    console.error('Watchlist toggle error details:', err)
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

const handleSetAlert = async () => {
  if (!isLoggedIn.value || !asset.value) return
  alertSuccess.value = false
  alertError.value = null // Reset error state

  // Validate price is set
  if (!alertPrice.value || alertPrice.value <= 0) {
    alertError.value = 'Please enter a valid price'
    return
  }

  // Validate price is reasonable compared to current price
  if (alertPrice.value > asset.value.price * 10) {
    alertError.value = 'Alert price cannot be more than 1000% of current price'
    return
  }

  try {
    if (!asset.value.watchlistId) {
      await toggleWatchlist()
      if (!asset.value.watchlistId) throw new Error('Failed to add to watchlist')
    }

    const response = await fetch(`http://localhost:3000/api/watchlist/${asset.value.watchlistId}/alert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alertPrice: alertPrice.value,
        alertType: alertType.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to set alert')
    }

    alertSuccess.value = true
    setTimeout(() => {
      showAlertForm.value = false
      alertSuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Alert setting error:', err)
    alertError.value = err instanceof Error ? err.message : 'Failed to set alert'
  }
}

const setAlertButton = () => {
  alertPrice.value = asset.value?.price || 0
  showAlertForm.value = true
}

onMounted(fetchAssetDetails)
</script>

<style scoped>
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
</style>
