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
import ActivityPanel from '@/components/dashboard/ActivityPanel.vue'

interface PortfolioData {
  assets: Array<{
    assetId: number
    name: string
    symbol: string
    type: string
    currentPrice: number
    quantity: number
    averagePrice: number
    previousDayPrice?: number
  }>
  balance: number
  totalValue: number
  _debug?: {
    backendReportedTotal: number
    calculatedAssetsValue: number
    calculatedBalance: number
  }
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
function calculateReturnPercentage(initialValue: number, currentValue: number): string {
  // Check if initial value is zero or extremely small or if values aren't valid numbers
  if (!initialValue || initialValue < 0.0001 || isNaN(initialValue) || isNaN(currentValue)) {
    return 'N/A';
  }

  // Calculate percentage change
  const percentage = ((currentValue - initialValue) / initialValue) * 100;
  
  // Format to 2 decimal places and add % sign
  return (percentage >= 0 ? '+' : '') + percentage.toFixed(2) + '%';
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
    console.log('Portfolio data received (raw):', JSON.stringify(data));
    
    // Additional debugging for asset structure
    if (data.assets) {
      console.log('Assets array type:', Object.prototype.toString.call(data.assets));
      console.log('Assets length:', data.assets.length);
      
      // Check first asset in detail
      if (data.assets.length > 0) {
        const firstAsset = data.assets[0];
        console.log('First asset detailed:', {
          assetId: firstAsset.assetId,
          name: firstAsset.name,
          symbol: firstAsset.symbol,
          quantity: firstAsset.quantity,
          quantityType: typeof firstAsset.quantity,
          currentPrice: firstAsset.currentPrice,
          priceType: typeof firstAsset.currentPrice,
          calculatedValue: Number(firstAsset.quantity) * Number(firstAsset.currentPrice)
        });
      }
    }
    
    // Filter out assets with 0 quantity
    if (data.assets && Array.isArray(data.assets)) {
      data.assets = data.assets.filter(asset => Number(asset.quantity) > 0);
      console.log('Assets after filtering zero quantities:', data.assets.length);
    }
    
    // Calculate total value manually to ensure correctness
    let manualTotalValue = Number(data.balance) || 0;
    console.log('Starting with balance:', manualTotalValue, '(type:', typeof data.balance, ')');
    
    // Add up all asset values
    if (data.assets && Array.isArray(data.assets)) {
      console.log('Asset count:', data.assets.length);
      data.assets.forEach((asset, index) => {
        // Explicitly convert to numbers to avoid string concatenation
        const quantity = Number(asset.quantity || 0);
        const price = Number(asset.currentPrice || 0);
        const assetValue = quantity * price;
        
        console.log(`Asset ${index+1} (${asset.symbol}):`, 
          `Quantity: ${quantity} (${typeof asset.quantity})`, 
          `Price: ${price} (${typeof asset.currentPrice})`, 
          `Value: ${assetValue}`);
        
        manualTotalValue += assetValue;
        console.log(`Running total after asset ${index+1}: ${manualTotalValue}`);
      });
    }
    
    console.log('Backend reported total value:', data.totalValue, '(type:', typeof data.totalValue, ')');
    console.log('Manually calculated total value:', manualTotalValue);
    
    // Force the value to be set
    console.log('EXPLICITLY SETTING TOTAL VALUE TO:', manualTotalValue);
    data.totalValue = manualTotalValue;
    
    // Force Vue reactivity by creating a new object
    portfolioData.value = { 
      assets: [...data.assets], 
      balance: Number(data.balance) || 0,
      totalValue: manualTotalValue,
      // Add diagnostic info
      _debug: {
        backendReportedTotal: data.totalValue,
        calculatedAssetsValue: manualTotalValue - Number(data.balance || 0),
        calculatedBalance: Number(data.balance || 0)
      }
    };
    console.log('Final portfolioData.value:', portfolioData.value);
    
    // Log asset price details for debugging P/L issues
    if (portfolioData.value.assets && portfolioData.value.assets.length > 0) {
      console.log('Asset price details:');
      portfolioData.value.assets.forEach(asset => {
        console.log(`${asset.symbol}: Current=${asset.currentPrice}, Average=${asset.averagePrice}, Diff=${asset.currentPrice - asset.averagePrice}`);
        console.log(`Exact same? ${asset.currentPrice === asset.averagePrice}, Difference: ${Math.abs(asset.currentPrice - asset.averagePrice)}`);
      });
    }
    
    // Update userStore balance to ensure consistency across components
    if (userStore.user) {
      userStore.user.balance = data.balance
      localStorage.setItem('user', JSON.stringify({ 
        user: userStore.user,
        token: userStore.token 
      }));
    }
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

// Add asset type detection function
const isForexPair = (symbol: string): boolean => {
  // Check if symbol contains a currency pair pattern (XXX/YYY)
  return symbol?.includes('/') || false;
}

// Add crypto detection
const isCrypto = (symbol: string): boolean => {
  // Most crypto symbols end with USD
  return symbol?.endsWith('USD') || false;
}

// Get appropriate decimal places based on asset type
const getDecimalPlaces = (symbol: string): number => {
  if (isForexPair(symbol)) {
    return 5; // Forex pairs typically need 5 decimal places
  } else if (isCrypto(symbol)) {
    // Smaller value cryptos need more decimals
    if (symbol === 'BTCUSD' || symbol === 'ETHUSD') {
      return 2;
    }
    return 4;
  }
  return 2; // Default for stocks and most assets
}

// Price formatting to match HomeView
const formatPrice = (price: number | string, symbol?: string): string => {
  // Ensure price is a valid number before formatting
  if (price === null || price === undefined || isNaN(Number(price))) {
    return '0.00';
  }
  
  // Determine decimal places based on asset type if symbol is provided
  const decimalPlaces = symbol ? getDecimalPlaces(symbol) : 2;
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(Number(price));
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

const { t } = useI18n()

// Add helper to calculate total assets value only
const calculateAssetsValue = () => {
  let total = 0;
  if (portfolioData.value?.assets && Array.isArray(portfolioData.value.assets)) {
    portfolioData.value.assets.forEach(asset => {
      total += Number(asset.quantity || 0) * Number(asset.currentPrice || 0);
    });
  }
  return total;
};

// Add an alert to explain the discrepancy
const showTotalExplanation = ref(false);

// Add a button to toggle the explanation
const toggleExplanation = () => {
  showTotalExplanation.value = !showTotalExplanation.value;
};

// Add a function to navigate to asset detail page
const goToAssetDetail = (assetId: number) => {
  router.push(`/asset/${assetId}`);
};

// Calculate P/L in dollars with improved precision
const calculateTotalPL = (currentPrice: number, avgPrice: number, quantity: number, symbol?: string) => {
  // Get appropriate precision threshold based on asset type
  const precisionThreshold = isForexPair(symbol || '') ? 0.00001 : 0.0001;
  
  // If prices are nearly identical (using appropriate precision), return exactly zero
  if (Math.abs(currentPrice - avgPrice) < precisionThreshold) {
    return 0;
  }
  return (currentPrice - avgPrice) * quantity;
}

// Format P/L with color and sign, with optional symbol parameter
const formatPL = (value: number | null, symbol?: string): { text: string, isPositive: boolean } => {
  if (value === null || value === undefined) return { text: 'N/A', isPositive: true }
  
  // If value is extremely close to zero (accounting for floating point precision), treat as zero
  if (Math.abs(value) < 0.001) {
    return { text: '$0.00', isPositive: true }
  }
  
  const isPositive = value > 0
  const sign = isPositive ? '+' : ''
  const formattedValue = formatPrice(Math.abs(value), symbol)
  
  return {
    text: `${sign}$${formattedValue}`,
    isPositive
  }
}

// Calculate total portfolio P/L - handles zero average price cases
const calculateTotalPortfolioPL = () => {
  let total = 0;
  if (portfolioData.value?.assets && Array.isArray(portfolioData.value.assets)) {
    portfolioData.value.assets.forEach(asset => {
      // Skip assets with zero or near-zero average price
      if (!asset.averagePrice || asset.averagePrice < 0.0001) {
        return;
      }
      
      // Use appropriate precision for comparison based on asset type
      const precisionThreshold = isForexPair(asset.symbol) ? 0.00001 : 0.0001;
      
      // If prices are nearly identical, skip (zero P/L)
      if (Math.abs(asset.currentPrice - asset.averagePrice) < precisionThreshold) {
        return;
      }
      
      // Otherwise calculate normally
      total += (asset.currentPrice - asset.averagePrice) * asset.quantity;
    });
  }
  return total;
};

// Calculate performance percentages for each asset
const getAssetPerformances = () => {
  if (!portfolioData.value.assets || portfolioData.value.assets.length === 0) return [];
  
  return portfolioData.value.assets.map(asset => {
    const percentChange = asset.averagePrice > 0 ? 
      ((asset.currentPrice - asset.averagePrice) / asset.averagePrice) * 100 : 0;
    
    return {
      ...asset,
      percentChange: parseFloat(percentChange.toFixed(2))
    };
  });
};

// Get best performing asset
const getBestPerformingAsset = () => {
  const assets = getAssetPerformances();
  if (assets.length === 0) return null;
  
  const filtered = assets.filter(asset => asset.percentChange !== 0);
  if (filtered.length === 0) return null;
  
  return filtered.reduce((best, asset) => 
    asset.percentChange > best.percentChange ? asset : best, filtered[0]);
};

// Get worst performing asset
const getWorstPerformingAsset = () => {
  const assets = getAssetPerformances();
  if (assets.length === 0) return null;
  
  const filtered = assets.filter(asset => asset.percentChange !== 0);
  if (filtered.length === 0) return null;
  
  return filtered.reduce((worst, asset) => 
    asset.percentChange < worst.percentChange ? asset : worst, filtered[0]);
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
                  {{ t('portfolio.summary') }}
                  <button @click="fetchPortfolioData" class="ml-2 text-sm text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                    <font-awesome-icon icon="sync" :class="{ 'animate-spin': loading }" />
                  </button>
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">{{ t('portfolio.totalValue') }}
                      <button @click="toggleExplanation" class="ml-1 text-xs text-white/50 hover:text-white">
                        <font-awesome-icon icon="circle-question" />
                      </button>
                    </p>
                    <p class="text-green-400 text-2xl font-bold">
                      ${{ formatPrice(portfolioData.totalValue || 0) }}
                    </p>
                    
                    <!-- Explanation alert -->
                    <div v-if="showTotalExplanation" class="mt-2 p-2 bg-green-900/30 rounded text-xs text-green-300 border border-green-800">
                      Your total value includes your account balance (${{ formatPrice(portfolioData.balance) }}) plus your asset value (${{ formatPrice(calculateAssetsValue()) }}).
                    </div>
                  </div>
                  <div
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">{{ t('portfolio.availableBalance') }}</p>
                    <p class="text-green-400 text-2xl font-bold">
                      ${{ formatPrice(portfolioData.balance || 0) }}
                    </p>
                  </div>
                  <div
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Total Asset Value</p>
                    <p class="text-green-400 text-2xl font-bold">
                      ${{ formatPrice(calculateAssetsValue()) }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">{{ totalPositions }} position{{ totalPositions !== 1 ? 's' : '' }}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <!-- P/L Statistics Summary -->
            <FadeIn>
              <div class="w-full">
                <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                  <font-awesome-icon icon="chart-line" class="text-green-400 mr-2" />
                  Performance Stats
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Total P/L Card -->
                  <div class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Total P/L</p>
                    <p v-if="portfolioData.assets.length > 0" 
                       :class="[calculateTotalPortfolioPL() >= 0 ? 'text-green-400' : 'text-red-400']" 
                       class="text-2xl font-bold">
                      {{ formatPL(calculateTotalPortfolioPL(), portfolioData.assets[0]?.symbol).text }}
                    </p>
                    <p v-else class="text-2xl font-bold text-gray-400">$0.00</p>
                  </div>
                  
                  <!-- Best Performing Asset -->
                  <div class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Best Performer</p>
                    <p v-if="getBestPerformingAsset()?.symbol" class="text-2xl font-bold text-green-400">
                      {{ getBestPerformingAsset()?.symbol }}
                    </p>
                    <p v-else class="text-2xl font-bold text-gray-400">N/A</p>
                    <p v-if="getBestPerformingAsset()?.percentChange" class="text-sm text-green-400">
                      +{{ getBestPerformingAsset()?.percentChange }}%
                    </p>
                  </div>
                  
                  <!-- Worst Performing Asset -->
                  <div class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
                    <p class="text-sm text-gray-400">Worst Performer</p>
                    <p v-if="getWorstPerformingAsset()?.symbol" class="text-2xl font-bold text-red-400">
                      {{ getWorstPerformingAsset()?.symbol }}
                    </p>
                    <p v-else class="text-2xl font-bold text-gray-400">N/A</p>
                    <p v-if="getWorstPerformingAsset()?.percentChange" class="text-sm text-red-400">
                      {{ getWorstPerformingAsset()?.percentChange }}%
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <!-- Quick Actions -->
            <FadeIn>
              <div class="w-full">
                <h2 class="text-white text-xl sm:text-2xl font-bold mb-4 px-1">
                  <font-awesome-icon icon="bolt" class="text-yellow-400 mr-2" />
                  Quick Actions
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <router-link to="/markets" 
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl flex items-center">
                    <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <font-awesome-icon icon="search-dollar" class="text-blue-400" />
                    </div>
                    <div>
                      <h3 class="font-bold text-white">Discover Assets</h3>
                      <p class="text-sm text-gray-400">Find new investment opportunities</p>
                    </div>
                  </router-link>
                  
                  <router-link to="/watchlist" 
                    class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl flex items-center">
                    <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <font-awesome-icon icon="star" class="text-green-400" />
                    </div>
                    <div>
                      <h3 class="font-bold text-white">Watchlist</h3>
                      <p class="text-sm text-gray-400">Track your favorite assets</p>
                    </div>
                  </router-link>
                  
                  <div class="grid grid-cols-2 gap-2">
                    <router-link to="/deposit" 
                      class="bg-white/10 p-3 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl flex items-center">
                      <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                        <font-awesome-icon icon="money-bill-wave" class="text-purple-400" />
                      </div>
                      <div>
                        <h3 class="font-bold text-white text-sm">Deposit</h3>
                        <p class="text-xs text-gray-400">Add funds</p>
                      </div>
                    </router-link>
                    
                    <router-link to="/withdraw" 
                      class="bg-white/10 p-3 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl flex items-center">
                      <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-2">
                        <font-awesome-icon icon="money-bill-transfer" class="text-red-400" />
                      </div>
                      <div>
                        <h3 class="font-bold text-white text-sm">Withdraw</h3>
                        <p class="text-xs text-gray-400">Cash out</p>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </FadeIn>

            <!-- Holdings List -->
            <FadeIn>
              <div class="w-full">
                <div class="flex items-center mb-4">
                  <font-awesome-icon icon="wallet" class="mr-2 text-green-400" />
                  <h1 class="text-2xl font-bold">{{ t('portfolio.holdings') }}</h1>
                </div>
                <div class="overflow-x-auto bg-white/5 rounded-xl p-4 border border-white/10">
                  <table class="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr>
                        <th class="text-left py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          {{ t('portfolio.table.symbol') }}</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          {{ t('portfolio.table.shares') }}</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          {{ t('portfolio.table.current') }}</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          {{ t('portfolio.table.value') }}</th>
                        <th class="text-right py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          P/L</th>
                        <th class="text-center py-3 px-4 text-gray-400 text-sm font-medium border-b border-white/10">
                          Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                      <tr v-if="portfolioData.assets.length === 0">
                        <td colspan="6" class="py-4 px-4 text-center text-gray-400">
                          {{ t('portfolio.table.noHoldings') }}
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
                          ${{ formatPrice(asset.currentPrice || 0, asset.symbol) }}
                        </td>
                        <td class="py-4 px-4 text-right font-medium text-white">
                          ${{ formatPrice((asset.quantity || 0) * (asset.currentPrice || 0), asset.symbol) }}
                        </td>
                        <!-- P/L Column -->
                        <td class="py-4 px-4 text-right">
                          <span v-if="!asset.averagePrice || asset.averagePrice < 0.0001" class="text-gray-400">
                            $0.00
                          </span>
                          <span v-else-if="Math.abs(asset.currentPrice - asset.averagePrice) < (isForexPair(asset.symbol) ? 0.00001 : 0.0001)" class="text-gray-400">
                            $0.00
                          </span>
                          <span v-else :class="[
                            (asset.currentPrice > asset.averagePrice) ? 'text-green-400' : 'text-red-400'
                          ]">
                            {{ formatPL((asset.currentPrice - asset.averagePrice) * asset.quantity, asset.symbol).text }}
                          </span>
                          <div class="text-xs text-gray-600 mt-1">
                            (C: {{ isForexPair(asset.symbol) ? asset.currentPrice.toFixed(5) : 
                                   isCrypto(asset.symbol) && asset.symbol !== 'BTCUSD' && asset.symbol !== 'ETHUSD' ? asset.currentPrice.toFixed(4) : 
                                   asset.currentPrice.toFixed(2) }}, 
                             A: {{ isForexPair(asset.symbol) ? (asset.averagePrice ? asset.averagePrice.toFixed(5) : '0.00000') : 
                                   isCrypto(asset.symbol) && asset.symbol !== 'BTCUSD' && asset.symbol !== 'ETHUSD' ? (asset.averagePrice ? asset.averagePrice.toFixed(4) : '0.0000') : 
                                   (asset.averagePrice ? asset.averagePrice.toFixed(2) : '0.00') }})
                          </div>
                        </td>
                        <td class="py-4 px-4 text-center">
                          <div class="flex justify-center gap-2">
                            <router-link :to="`/trade/${asset.assetId}`" 
                              class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm flex items-center">
                              <font-awesome-icon icon="exchange-alt" class="mr-1" />
                              {{ t('portfolio.table.trade') }}
                            </router-link>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Replace the pagination section -->
                  <div class="mt-4 flex items-center justify-between px-4">
                    <div class="text-sm text-gray-400">
                      {{ t('portfolio.pagination.showing') }} {{ portfolioData.assets?.length ? ((currentPage - 1) * visibleItems) + 1 : 0 }} -
                      {{ Math.min(currentPage * visibleItems, portfolioData.assets?.length || 0) }} {{ t('portfolio.pagination.of') }}
                      {{ portfolioData.assets?.length || 0 }} {{ t('portfolio.pagination.positions') }}
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
                        {{ t('portfolio.pagination.page') }} {{ currentPage }} {{ t('portfolio.pagination.of') }} {{ totalPages }}
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

            <!-- Activity Panel -->
            <FadeIn>
              <div class="w-full">
                <div class="flex items-center mb-4">
                  <font-awesome-icon icon="chart-bar" class="mr-2 text-green-400" />
                  <h1 class="text-2xl font-bold">{{ t('portfolio.activity') }}</h1>
                </div>
                <ActivityPanel />
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
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
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
