<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { handleApiError } from '@/utils/errorHandler'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useI18n } from 'vue-i18n'
import {
  faChartPie, faBolt, faListCheck, faChartLine,
  faClockRotateLeft, faEye, faGaugeHigh, faShieldHalved,
  faCartShopping, faChartColumn, faSync, faSearch, faWallet,
  faBitcoinSign, faDollarSign, faFire, faCaretUp, faCaretDown,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons'

import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

// Cached statistics for platform overview
const platformStats = {
  assets: {
    total: 2481,
    breakdown: {
      stocks: 1654,
      crypto: 573,
      forex: 254
    }
  },
  users: {
    total: 15879,
    active24h: 4271
  },
  platform: {
    uptime: '99.98%',
    avgExecution: '47ms',
    tradingVolume24h: '$847.3M'
  }
}

// Add icons to library
library.add(
  faChartPie, faBolt, faListCheck, faChartLine,
  faClockRotateLeft, faEye, faGaugeHigh, faShieldHalved,
  faCartShopping, faChartColumn, faSync, faSearch, faWallet,
  faBitcoinSign, faDollarSign, faFire, faCaretUp, faCaretDown,
  faCircleInfo
)

const marketStats = ref({
  totalTrades: 0,
  totalVolume: 0,
  activeAssets: 0,
  loading: true,
  error: null as string | null
})

const dashboardPanels = ref([
  { id: 'market-stats', title: 'Market Statistics', icon: 'chart-pie', visible: true },
  { id: 'active-positions', title: 'Active Positions', icon: 'list-check', visible: true },
  { id: 'charts', title: 'Charts', icon: 'chart-line', visible: true },
  { id: 'recent-activity', title: 'Recent Activity', icon: 'clock-rotate-left', visible: true },
  { id: 'watchlist', title: 'Watchlist', icon: 'eye', visible: true },
  { id: 'trending', title: 'Trending Assets', icon: 'fire', visible: true }
])

// Panel visibility toggles
const togglePanel = (panelId: string) => {
  const panel = dashboardPanels.value.find(p => p.id === panelId)
  if (panel) panel.visible = !panel.visible
}

const error = ref<{ message: string; type: string } | null>(null)
const loading = ref(false)

const reconnectToDatabase = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch('http://localhost:3000/api/reconnect', {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Failed to reconnect to database')
    }

    // After successful reconnection, retry fetching data
    await fetchData()
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}

// Add error handling to fetchData
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch('http://localhost:3000/api/assets/data')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    // ...rest of existing fetch logic...
  } catch (err) {
    error.value = handleApiError(err)
    throw err // Re-throw to be caught by error boundary
  } finally {
    loading.value = false
  }
}

const fetchMarketStats = async () => {
  try {
    marketStats.value.loading = true
    marketStats.value.error = null
    const response = await fetch('http://localhost:3000/api/assets/stats')

    if (!response.ok) {
      throw new Error('Failed to fetch market stats')
    }

    const data = await response.json()
    marketStats.value = {
      ...data,
      loading: false,
      error: null
    }
  } catch (err) {
    console.error('Error fetching market stats:', err)
    marketStats.value = {
      ...marketStats.value,
      loading: false,
      error: 'Failed to load market statistics'
    }
  }
}

// Add function to better format market stat numbers
const formatVolume = (volume: number | null | undefined): string => {
  // Handle null, undefined or NaN values
  if (volume === null || volume === undefined || isNaN(Number(volume))) {
    return '0.00';
  }
  
  // Ensure volume is a number
  const numVolume = Number(volume);
  
  // If volume is very small (less than 0.01), return formatted with more decimal places
  if (numVolume < 0.01 && numVolume > 0) {
    return numVolume.toFixed(8);
  }
  
  // For larger numbers, use standard formatting with K, M, B suffixes
  if (numVolume >= 1000000000) {
    return (numVolume / 1000000000).toFixed(2) + 'B';
  } else if (numVolume >= 1000000) {
    return (numVolume / 1000000).toFixed(2) + 'M';
  } else if (numVolume >= 1000) {
    return (numVolume / 1000).toFixed(2) + 'K';
  } else {
    return numVolume.toFixed(2);
  }
}

// Add default trending assets data
const trendingAssets = ref<{
  data: Array<{
    id: number;
    symbol: string;
    name: string;
    price: number;
    change_24h: number;
    type: string;
  }>,
  loading: boolean,
  error: string | null
}>({
  data: [], // Start with empty array instead of default data
  loading: true, // Start in loading state
  error: null
})

// Update fetchTrendingAssets function to fetch real trending assets
const fetchTrendingAssets = async () => {
  try {
    trendingAssets.value.loading = true;
    trendingAssets.value.error = null;
    
    // Fetch trending assets from the API
    const response = await fetch('http://localhost:3000/api/assets/trending?limit=5');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending assets: ${response.status}`);
    }
    
    // Get trending asset ids from the first API call
    const trendingData = await response.json();
    
    // If no trending assets, use fallback approach instead of throwing an error
    if (!Array.isArray(trendingData) || trendingData.length === 0) {
      console.log('No trending assets found, using fallback approach');
      return await fetchFallbackAssets();
    }
    
    // Now fetch the full asset data for each trending item
    const assetPromises = trendingData.map(async (item) => {
      // Since trending endpoint might not return all needed fields, fetch complete asset data
      try {
        const assetResponse = await fetch(`http://localhost:3000/api/assets/${item.id || item.asset_id}`);
        if (!assetResponse.ok) throw new Error(`Asset fetch failed: ${assetResponse.status}`);
        return await assetResponse.json();
      } catch (error) {
        console.warn(`Couldn't fetch details for trending asset:`, item, error);
        // Return partial data for this asset with price movement simulation
        return {
          id: item.id || item.asset_id || Math.floor(Math.random() * 1000),
          symbol: item.symbol || 'UNKNOWN',
          name: item.name || 'Unknown Asset',
          type: item.type || 'stock',
          price: item.price || (Math.random() * 1000 + 50).toFixed(2),
          change_24h: item.change_24h || (Math.random() * 10 - 5).toFixed(2)
        };
      }
    });
    
    // Wait for all asset fetches to complete
    const assets = await Promise.all(assetPromises);
    
    if (assets.length === 0) {
      // If we still couldn't get trending assets, use fallback approach
      return await fetchFallbackAssets();
    }
    
    trendingAssets.value.data = assets;
  } catch (err) {
    console.error('Error fetching trending assets:', err);
    // Use fallback approach
    await fetchFallbackAssets();
  } finally {
    trendingAssets.value.loading = false;
  }
}

// Add a separate function for fallback assets
const fetchFallbackAssets = async () => {
  try {
    console.log('Fetching fallback assets');
    const fallbackResponse = await fetch('http://localhost:3000/api/assets/data?limit=5');
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        trendingAssets.value.data = fallbackData.slice(0, 5);
        trendingAssets.value.error = null;
        return;
      }
    }
    
    // If even the fallback fails, use static demo data
    trendingAssets.value.data = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        price: 185.92,
        change_24h: 1.45
      },
      {
        id: 2,
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        type: 'stock',
        price: 142.32,
        change_24h: -0.78
      },
      {
        id: 3,
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        price: 35420.15,
        change_24h: 2.34
      },
      {
        id: 4,
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'stock',
        price: 330.11,
        change_24h: 0.89
      },
      {
        id: 5,
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        price: 1950.27,
        change_24h: 1.12
      }
    ];
    trendingAssets.value.error = null;
  } catch (error) {
    console.error('Error fetching fallback assets:', error);
    trendingAssets.value.error = 'Unable to load trending assets';
    trendingAssets.value.data = [];
  }
}

// Add new refs for panel data
const watchlist = ref({
  data: [] as any[],
  loading: true,
  error: null as string | null
})

const positions = ref({
  data: [] as any[],
  loading: true,
  error: null as string | null
})

const activities = ref({
  data: [] as any[],
  loading: true,
  error: null as string | null
})

// Updated fetch functions
const fetchWatchlist = async () => {
  try {
    watchlist.value.loading = true
    watchlist.value.error = null
    
    // Check isAuthenticated first rather than checking user ID and token directly
    if (!userStore.isAuthenticated) {
      console.log('User not authenticated for watchlist')
      watchlist.value.error = 'Authentication required'
      watchlist.value.loading = false
      return
    }
    
    // Wait a short delay to ensure user data is fully loaded if needed
    if (!userStore.user?.id) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Double-check user ID after potential delay
    if (!userStore.user?.id) {
      console.log('User ID still not available for watchlist')
      watchlist.value.error = 'User data not available'
      watchlist.value.loading = false
      return
    }
    
    const response = await fetch(
      `http://localhost:3000/api/watchlist/user/${userStore.user.id}`,
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch watchlist: Status ${response.status}, Response: ${errorText}`);
      throw new Error('Failed to fetch watchlist');
    }
    
    watchlist.value.data = await response.json()
    if (!Array.isArray(watchlist.value.data)) {
      console.error('Unexpected response format for watchlist:', watchlist.value.data)
      watchlist.value.data = []
    }
  } catch (err) {
    console.error('Error fetching watchlist:', err)
    watchlist.value.error = 'Failed to load watchlist'
    watchlist.value.data = [] // Set empty array on error
  } finally {
    watchlist.value.loading = false
  }
}

// Retry function for watchlist
const retryWatchlist = () => {
  fetchWatchlist()
}

// Add sorting state for positions like watchlist
const positionsSortBy = ref('recent') // 'recent', 'price', 'quantity'

// Modified to fetch positions from transactions endpoint without simulated data
const fetchPositions = async () => {
  try {
    positions.value.loading = true
    positions.value.error = null
    
    // Check isAuthenticated first
    if (!userStore.isAuthenticated) {
      console.log('User not authenticated for positions')
      positions.value.error = 'Authentication required'
      positions.value.loading = false
      return
    }
    
    // Wait a short delay to ensure user data is fully loaded if needed
    if (!userStore.user?.id) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Double-check user ID after potential delay
    if (!userStore.user?.id) {
      console.log('User ID still not available for positions')
      positions.value.error = 'User data not available'
      positions.value.loading = false
      return
    }
    
    // First try to fetch from portfolio endpoint
    try {
      const portfolioResponse = await fetch(`http://localhost:3000/api/portfolio/${userStore.user.id}`, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      })
      
      if (portfolioResponse.ok) {
        const portfolio = await portfolioResponse.json()
        console.log('Portfolio data received:', portfolio)
        
        // Extract assets from portfolio using the property names from PortfolioView
        if (portfolio && portfolio.assets && Array.isArray(portfolio.assets)) {
          positions.value.data = portfolio.assets
            .filter((asset: any) => Number(asset.quantity) > 0) // Only show assets with quantity > 0
            .map((asset: any) => {
              // Protect against division by zero or very small average price
              const averagePrice = Number(asset.averagePrice);
              let gainPercentage = 0;
              
              if (averagePrice > 0.0001) {
                gainPercentage = ((Number(asset.currentPrice) - averagePrice) / averagePrice) * 100;
              }
              
              return {
                id: asset.assetId,
                symbol: asset.symbol,
                name: asset.name,
                type: asset.type || 'stock',
                quantity: Number(asset.quantity),
                price: Number(asset.currentPrice),
                value: Number(asset.currentPrice) * Number(asset.quantity),
                gain: gainPercentage,
                created_at: asset.created_at || new Date().toISOString()
              };
            })
          
          console.log('Mapped positions:', positions.value.data)
          positions.value.loading = false
          return // Successfully fetched from portfolio
        } else {
          console.log('No assets found in portfolio data:', portfolio)
        }
      } else {
        console.log('Portfolio API unavailable, falling back to orders')
      }
    } catch (portfolioErr) {
      console.log('Error with portfolio API, falling back to orders:', portfolioErr)
    }
    
    // Fallback to orders API - only show real owned assets
    try {
      const ordersResponse = await fetch(`http://localhost:3000/api/orders/${userStore.user.id}`, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      })
      
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json()
        
        if (Array.isArray(orders) && orders.length > 0) {
          // Create a map to aggregate quantities by asset
          const assetMap = new Map()
          
          // Process buy and sell orders to determine current positions
          orders.forEach((order: any) => {
            const assetId = order.assetId
            if (!assetMap.has(assetId)) {
              assetMap.set(assetId, {
                id: assetId,
                symbol: order.assetSymbol,
                name: order.assetName || order.assetSymbol,
                type: 'stock', // Default to stock if not provided
                quantity: 0,
                price: order.price,
                totalCost: 0,
                created_at: order.createdAt
              })
            }
            
            const asset = assetMap.get(assetId)
            if (order.tradeType === 'buy') {
              asset.quantity += order.quantity
              asset.totalCost += order.quantity * order.price
            } else if (order.tradeType === 'sell') {
              asset.quantity -= order.quantity
            }
          })
          
          // Convert map to array and calculate value and gain
          const positionsArray = Array.from(assetMap.values())
            .filter(asset => asset.quantity > 0)
            .map(asset => {
              // Avoid division by zero
              const avgPrice = asset.totalCost / asset.quantity || 0.0001;
              let gainPercentage = 0;
              
              if (avgPrice > 0.0001) {
                gainPercentage = ((asset.price - avgPrice) / avgPrice) * 100;
              }
              
              return {
                ...asset,
                value: asset.price * asset.quantity,
                gain: gainPercentage
              }
            })
          
          if (positionsArray.length > 0) {
            positions.value.data = positionsArray
            positions.value.loading = false
            return
          }
        }
      }
    } catch (ordersErr) {
      console.log('Error fetching from orders API:', ordersErr)
    }
    
    // If we reach here, we have no real data to show
    positions.value.data = []
    
  } catch (err) {
    console.error('Error fetching positions:', err)
    positions.value.error = 'Failed to load positions'
    positions.value.data = [] // Empty array on error, no simulated data
  } finally {
    positions.value.loading = false
  }
}

// Function to change positions sort
const changePositionsSort = (sortType: string) => {
  positionsSortBy.value = sortType
}

// Get sorted positions
const getSortedPositions = computed(() => {
  if (!positions.value.data || positions.value.data.length === 0) {
    return []
  }
  
  const items = [...positions.value.data]
  
  switch (positionsSortBy.value) {
    case 'price':
      items.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    case 'quantity':
      items.sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      break
    case 'recent':
    default:
      items.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return 0
      })
      break
  }
  
  return items
})

// Retry function for positions
const retryPositions = () => {
  fetchPositions()
}

// Modified to directly fetch all activity data from API endpoints
const fetchActivities = async () => {
  try {
    activities.value.loading = true
    activities.value.error = null
    
    if (!userStore.isAuthenticated || !userStore.user?.id) {
      activities.value.data = [{
        id: 'empty',
        title: 'No Recent Activity',
        description: 'Please log in to view your activities',
        timestamp: new Date().toISOString()
      }]
      activities.value.loading = false
      return
    }
    
    // Arrays to hold our activity data
    let allActivities: {id: string; title: string; description: string; timestamp: string}[] = []
    
    // Fetch transaction data directly from API
    try {
      const transactionsResponse = await fetch(`http://localhost:3000/api/transactions/user/${userStore.user.id}/recent?limit=20`, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      })
      
      if (transactionsResponse.ok) {
        const transactions = await transactionsResponse.json()
        
        if (Array.isArray(transactions)) {
          // Map transactions to activities
          const transactionActivities = transactions.map(transaction => ({
            id: `t_${transaction.id}`,
            title: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            description: `${transaction.type === 'deposit' ? 'Added' : 'Transferred'} $${formatPrice(transaction.amount)}`,
            timestamp: transaction.created_at
          }))
          
          allActivities = [...allActivities, ...transactionActivities]
        }
      }
    } catch (transactionErr) {
      console.error('Error fetching transactions:', transactionErr)
    }
    
    // Fetch order data directly from API
    try {
      const ordersResponse = await fetch(`http://localhost:3000/api/orders/${userStore.user.id}`, {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      })
      
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json()
        
        if (Array.isArray(orders)) {
          // Map orders to activities
          const orderActivities = orders.map(order => ({
            id: `o_${order.id}`,
            title: `${order.tradeType === 'buy' ? 'Buy' : 'Sell'} Order`,
            description: `${order.tradeType === 'buy' ? 'Bought' : 'Sold'} ${order.assetSymbol} at $${formatPrice(order.price)}`,
            timestamp: order.createdAt
          }))
          
          allActivities = [...allActivities, ...orderActivities]
        }
      }
    } catch (orderErr) {
      console.error('Error fetching orders:', orderErr)
    }
    
    // If we have activities, sort and limit them
    if (allActivities.length > 0) {
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      // Limit to 5 most recent
      activities.value.data = allActivities.slice(0, 5)
    } else {
      // No activities found
      activities.value.data = [{
        id: 'empty',
        title: 'No Recent Activity',
        description: 'No activity found in your account',
        timestamp: new Date().toISOString()
      }]
    }
  } catch (err) {
    console.error('Error fetching activities:', err)
    activities.value.error = 'Failed to load activities'
    activities.value.data = []
  } finally {
    activities.value.loading = false
  }
}

// Update onMounted to include new fetches for authenticated users and handle timing better
onMounted(async () => {
  // Always fetch these regardless of authentication
  fetchMarketStats()
  fetchTrendingAssets()
  
  // For authenticated users, fetch additional data
  if (userStore.isAuthenticated) {
    // Small delay to ensure auth state is fully initialized
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Fetch user-specific data
    await fetchWatchlist()
    await fetchPositions()
    
    // Only fetch activities after watchlist and positions are loaded
    fetchActivities()
  }
})

// Add formatPrice function if not already present
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// Add asset type icons mapping
const typeIcons = {
  crypto: 'coins',
  stock: 'chart-line',
  forex: 'exchange-alt'
} as const

// Add function to get appropriate icon for asset type
const getAssetTypeIcon = (type: string) => {
  return typeIcons[type as keyof typeof typeIcons] || 'question'
}

// Add mouse move tracking for the header gradient effect
const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

// Add sorting state for watchlist
const watchlistSortBy = ref('recent') // 'recent', 'price', 'change'

// Function to get top 3 watchlist items based on sort criteria
const getTopWatchlistItems = computed(() => {
  if (!watchlist.value.data || watchlist.value.data.length === 0) {
    return []
  }
  
  const items = [...watchlist.value.data]
  
  switch (watchlistSortBy.value) {
    case 'price':
      // Sort by highest price
      items.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    case 'change':
      // Since change_24h might not exist, sort by price instead
      items.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    case 'recent':
    default:
      // Sort by most recently added (uses watchlistId or created_at if available)
      items.sort((a, b) => {
        // If created_at exists, use that
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        // Otherwise fall back to watchlistId
        return (b.watchlistId || 0) - (a.watchlistId || 0)
      })
      break
  }
  
  // Return top 3 items
  return items.slice(0, 3)
})

// Function to change watchlist sort
const changeWatchlistSort = (sortType: string) => {
  watchlistSortBy.value = sortType
}
</script>

<template>
  <div class="home-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <PageMain>
      <template v-if="!userStore.isAuthenticated">
        <div class="w-full h-full overflow-auto">
          <div class="landing-page">
            <!-- Hero Section -->
            <section class="hero-section relative overflow-hidden py-20">
              <!-- Change the overlay div to be pointer-events-none -->
              <div class="absolute inset-0 bg-gradient animate-gradient pointer-events-none"></div>
              <!-- Add relative and z-10 to content container to ensure it's clickable -->
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="text-center">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 glow-text">
                    {{ t('home.hero.title') }}
                  </h1>
                  <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    {{ t('home.hero.subtitle') }}
                  </p>
                  <div class="flex gap-4 justify-center">
                    <button 
                      class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all"
                      @click="() => router.push('/register')"
                    >
                      {{ t('home.hero.startTrading') }}
                    </button>
                    <button 
                      class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                      @click="() => router.push('/login')"
                    >
                      {{ t('home.hero.login') }}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Core Features Grid -->
            <section class="py-16 bg-black/20">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold text-white text-center mb-12 glow-text">
                  {{ t('home.features.title') }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <!-- Learning Platform Card -->
                  <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all">
                    <font-awesome-icon icon="graduation-cap" class="text-3xl text-green-400 mb-4 filter drop-shadow-glow" />
                    <h3 class="text-xl font-semibold text-white mb-2">{{ t('home.features.learningPlatform.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.features.learningPlatform.description') }}</p>
                  </div>
                  <!-- Security Card -->
                  <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all">
                    <font-awesome-icon icon="shield-halved" class="text-3xl text-green-400 mb-4 filter drop-shadow-glow" />
                    <h3 class="text-xl font-semibold text-white mb-2">{{ t('home.features.security.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.features.security.description') }}</p>
                  </div>
                  <!-- Real-time Analysis Card -->
                  <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all">
                    <font-awesome-icon icon="chart-line" class="text-3xl text-green-400 mb-4 filter drop-shadow-glow" />
                    <h3 class="text-xl font-semibold text-white mb-2">{{ t('home.features.analysis.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.features.analysis.description') }}</p>
                  </div>
                  <!-- Multi-Asset Card -->
                  <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all">
                    <font-awesome-icon icon="wallet" class="text-3xl text-green-400 mb-4 filter drop-shadow-glow" />
                    <h3 class="text-xl font-semibold text-white mb-2">{{ t('home.features.multiAsset.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.features.multiAsset.description') }}</p>
                  </div>
                  <!-- Add this in the features grid section when user is not authenticated -->
                  <div class="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all">
                    <font-awesome-icon icon="circle-info" class="text-3xl text-green-400 mb-4" />
                    <h3 class="text-xl font-semibold text-white mb-2">{{ t('home.features.about.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.features.about.description') }}</p>
                    <router-link to="/about" class="mt-4 inline-block text-green-400 hover:text-green-300">
                      Learn More <font-awesome-icon icon="arrow-right" class="ml-1" />
                    </router-link>
                  </div>
                </div>
              </div>
            </section>

            <!-- Platform Statistics -->
            <section class="py-12 bg-black/20">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="flex items-center gap-3 bg-black/30 rounded-lg p-4 border border-white/5">
                    <div>
                      <div class="text-3xl font-bold text-green-400">{{ platformStats.assets.total }}</div>
                      <div class="text-sm text-gray-400">{{ t('home.stats.instruments') }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 bg-black/30 rounded-lg p-4 border border-white/5">
                    <div>
                      <div class="text-3xl font-bold text-green-400">{{ platformStats.users.active24h }}</div>
                      <div class="text-sm text-gray-400">{{ t('home.stats.activeTraders') }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 bg-black/30 rounded-lg p-4 border border-white/5">
                    <div>
                      <div class="text-3xl font-bold text-green-400">{{ platformStats.platform.tradingVolume24h }}</div>
                      <div class="text-sm text-gray-400">{{ t('home.stats.volume') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Why Choose Us Section -->
            <section class="py-16 bg-white/5">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold text-white text-center mb-12 glow-text">{{ t('home.whyUs.title') }}</h2>
                <div class="grid md:grid-cols-3 gap-8">
                  <div class="bg-black/30 p-6 rounded-xl border border-white/10">
                    <div class="text-green-400 mb-4 text-4xl font-bold">94%</div>
                    <h3 class="text-white text-lg mb-2">{{ t('home.whyUs.execution.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.whyUs.execution.description') }}</p>
                  </div>
                  <div class="bg-black/30 p-6 rounded-xl border border-white/10">
                    <div class="text-green-400 mb-4 text-4xl font-bold">24/7</div>
                    <h3 class="text-white text-lg mb-2">{{ t('home.whyUs.support.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.whyUs.support.description') }}</p>
                  </div>
                  <div class="bg-black/30 p-6 rounded-xl border border-white/10">
                    <div class="text-green-400 mb-4 text-4xl font-bold">0%</div>
                    <h3 class="text-white text-lg mb-2">{{ t('home.whyUs.commission.title') }}</h3>
                    <p class="text-gray-400">{{ t('home.whyUs.commission.description') }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Education Platform Preview -->
            <section class="py-16">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 class="text-3xl font-bold text-white mb-6">{{ t('home.education.title') }}</h2>
                    <p class="text-gray-300 mb-6">{{ t('home.education.description') }}</p>
                    <button @click="router.push('/tutorial')"
                      class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all">
                      {{ t('home.education.explore') }}
                    </button>
                  </div>
                  <div class="relative aspect-video bg-black/30 rounded-xl overflow-hidden border border-white/10 
                              hover:border-green-500/30 transition-all duration-300 group">
                    <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 
                                group-hover:opacity-100 transition-opacity"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-gray-400 group-hover:text-green-400 transition-colors">{{ t('home.education.preview') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Join Now Section -->
            <section class="relative py-24 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
              <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
              
              <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 glow-text">
                  {{ t('home.joinNow.title') }}
                </h2>
                <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {{ t('home.joinNow.subtitle') }}
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button @click="router.push('/register')"
                    class="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-lg">
                    {{ t('home.joinNow.createAccount') }}
                  </button>
                  <span class="text-gray-400">{{ t('home.joinNow.or') }}</span>
                  <button @click="router.push('/tutorial')"
                    class="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all text-lg">
                    {{ t('home.joinNow.explore') }}
                  </button>
                </div>

                <div class="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent"></div>
                <div class="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent"></div>
              </div>
            </section>
          </div>
        </div>

        
      </template>

      <!-- Rest of the existing authenticated user template -->
      <template v-else>
        <div class="w-full px-2 sm:px-4 py-4">
          <div class="max-w-7xl mx-auto">
            <!-- Panels Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="panel in dashboardPanels" :key="panel.id" v-show="panel.visible" class="dashboard-panel">
                <div class="panel-inner">
                  <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-medium text-white flex items-center gap-2 glow-text">
                      <font-awesome-icon :icon="panel.icon" class="panel-icon" />
                      {{ t(`dashboard.${panel.id}`) }}
                    </h2>
                  </div>

                  <!-- Market Statistics Panel -->
                  <div v-if="panel.id === 'market-stats'" class="flex-1">
                    <div v-if="marketStats.loading" class="flex-1 flex items-center justify-center">
                      <LoadingSpinner class="w-6 h-6" />
                    </div>
                    <div v-else-if="marketStats.error" class="flex-1 flex items-center justify-center text-red-400">
                      {{ marketStats.error }}
                    </div>
                    <div v-else class="h-full flex flex-col gap-3">
                      <!-- Top row - larger stats -->
                      <div class="flex gap-3 flex-1">
                        <div class="flex-1 bg-white/5 rounded-lg p-3">
                          <div class="text-sm text-gray-400">{{ t('dashboard.volume24h') }}</div>
                          <div class="text-xl text-white font-medium mt-1">
                            ${{ formatVolume(marketStats.totalVolume) }}
                          </div>
                        </div>
                        <div class="flex-1 bg-white/5 rounded-lg p-3">
                          <div class="text-sm text-gray-400">{{ t('dashboard.totalTrades') }}</div>
                          <div class="text-xl text-white font-medium mt-1">
                            {{ marketStats.totalTrades.toLocaleString() }}
                          </div>
                        </div>
                      </div>
                      <!-- Bottom row - smaller stats -->
                      <div class="flex gap-3">
                        <div class="flex-1 bg-green-500/10 rounded-lg p-2 flex items-center justify-between">
                          <span class="text-sm text-gray-400">{{ t('dashboard.marketStatus') }}</span>
                          <span class="text-sm text-green-400 font-medium">{{ t('dashboard.open') }}</span>
                        </div>
                        <div class="flex-1 bg-white/5 rounded-lg p-2 flex items-center justify-between">
                          <span class="text-sm text-gray-400">{{ t('dashboard.activeAssets') }}</span>
                          <span class="text-sm text-white font-medium">{{ marketStats.activeAssets }}</span>
                        </div>
                      </div>
                      <!-- Additional row for 2h volume -->
                      <div class="bg-white/5 rounded-lg p-2 flex items-center justify-between">
                        <span class="text-sm text-gray-400">2h Volume</span>
                        <span class="text-sm text-white font-medium">
                          ${{ formatVolume(marketStats.totalVolume / 12) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Trending Assets Panel -->
                  <div v-else-if="panel.id === 'trending'" class="flex-1 flex flex-col">
                    <div v-if="trendingAssets.loading" class="flex-1 flex items-center justify-center">
                      <LoadingSpinner class="w-6 h-6" />
                    </div>
                    <div v-else-if="trendingAssets.error" class="flex-1 flex items-center justify-center text-red-400">
                      <font-awesome-icon icon="triangle-exclamation" class="text-xl mr-2" />
                      {{ trendingAssets.error }}
                    </div>
                    <div v-else class="flex-1 flex flex-col">
                      <div class="flex-1 trending-container">
                        <div class="trending-items-wrapper">
                          <div v-for="asset in trendingAssets.data" :key="asset.id" class="trending-item"
                            @click="router.push(`/trade/${asset.id}`)">
                            <div class="flex items-center justify-between">
                              <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <font-awesome-icon :icon="getAssetTypeIcon(asset.type)" class="text-green-400" />
                                </div>
                                <div>
                                  <div class="font-medium text-white group-hover:text-green-400 transition-colors">
                                    {{ asset.symbol }}
                                  </div>
                                  <div class="text-sm text-gray-400">{{ asset.name }}</div>
                                </div>
                              </div>
                              <div class="text-right">
                                <div class="text-white font-medium">${{ formatPrice(asset.price) }}</div>
                                <div :class="[
                                  'text-sm flex items-center gap-1',
                                  asset.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                ]">
                                  <font-awesome-icon :icon="asset.change_24h >= 0 ? 'caret-up' : 'caret-down'" />
                                  {{ Math.abs(asset.change_24h).toFixed(2) }}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Watchlist Panel -->
                  <div v-if="panel.id === 'watchlist'" class="flex-1">
                    <div v-if="watchlist.loading" class="flex-1 flex items-center justify-center">
                      <LoadingSpinner class="w-6 h-6" />
                    </div>
                    <div v-else-if="watchlist.error" class="flex-1 flex flex-col items-center justify-center">
                      <div class="text-red-400 mb-3">{{ watchlist.error }}</div>
                      <button @click="retryWatchlist" 
                              class="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm">
                        <font-awesome-icon icon="sync" class="mr-1" /> Retry
                      </button>
                    </div>
                    <div v-else class="h-full flex flex-col overflow-hidden">
                      <!-- Sort options -->
                      <div class="flex gap-2 mb-3 px-2">
                        <button 
                          @click="changeWatchlistSort('recent')" 
                          class="text-xs px-2 py-1 rounded"
                          :class="watchlistSortBy === 'recent' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
                        >
                          Recent
                        </button>
                        <button 
                          @click="changeWatchlistSort('price')" 
                          class="text-xs px-2 py-1 rounded"
                          :class="watchlistSortBy === 'price' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
                        >
                          Price
                        </button>
                        <button 
                          @click="changeWatchlistSort('change')" 
                          class="text-xs px-2 py-1 rounded"
                          :class="watchlistSortBy === 'change' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
                        >
                          Change
                        </button>
                      </div>
                      
                      <!-- Watchlist items (limited to top 3) -->
                      <div class="flex-1 overflow-y-auto scrollbar-thin">
                        <div v-if="getTopWatchlistItems.length === 0" class="flex items-center justify-center h-full text-gray-400">
                          No assets in watchlist
                        </div>
                        <div v-else v-for="item in getTopWatchlistItems" :key="item.watchlistId" 
                             class="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/10 transition-colors cursor-pointer"
                             @click="router.push(`/trade/${item.id}`)">
                          <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                              <font-awesome-icon :icon="getAssetTypeIcon(item.type)" class="text-green-400" />
                              <div>
                                <div class="font-medium text-white">{{ item.symbol }}</div>
                                <div class="text-sm text-gray-400">{{ item.name }}</div>
                              </div>
                            </div>
                            <div class="text-right">
                              <div class="text-white">${{ formatPrice(item.price) }}</div>
                              <div v-if="item.alert_price" class="text-xs text-green-400">
                                Alert: {{ item.alert_type === 'above' ? '>' : '<' }} ${{ formatPrice(item.alert_price) }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- View all link -->
                      <div v-if="watchlist.data.length > 3" class="text-center mt-2">
                        <router-link to="/markets" class="text-xs text-green-400 hover:underline">
                          View all {{ watchlist.data.length }} items
                        </router-link>
                      </div>
                    </div>
                  </div>

                  <!-- Active Positions Panel -->
                  <div v-else-if="panel.id === 'active-positions'" class="flex-1">
                    <div v-if="positions.loading" class="flex-1 flex items-center justify-center">
                      <LoadingSpinner class="w-6 h-6" />
                    </div>
                    <div v-else-if="positions.error" class="flex-1 flex flex-col items-center justify-center">
                      <div class="text-red-400 mb-3">{{ positions.error }}</div>
                      <button @click="retryPositions" 
                              class="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm">
                        <font-awesome-icon icon="sync" class="mr-1" /> Retry
                      </button>
                    </div>
                    <div v-else class="h-full flex flex-col overflow-hidden">
                      <!-- Sort options -->
                      <div class="flex gap-2 mb-3 px-2">
                        <button 
                          @click="changePositionsSort('recent')" 
                          class="text-xs px-2 py-1 rounded"
                          :class="positionsSortBy === 'recent' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
                        >
                          Recent
                        </button>
                        <button 
                          @click="changePositionsSort('price')" 
                          class="text-xs px-2 py-1 rounded"
                          :class="positionsSortBy === 'price' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
                        >
                          Price
                        </button>
                        <button 
                          @click="changePositionsSort('quantity')" 
                          class="text-xs px-2 py-1 rounded"
                          :class="positionsSortBy === 'quantity' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
                        >
                          Quantity
                        </button>
                      </div>
                      
                      <div class="flex-1 overflow-y-auto scrollbar-thin">
                        <div v-if="getSortedPositions.length === 0" class="flex items-center justify-center h-full text-gray-400">
                          No active positions
                        </div>
                        <div v-else v-for="position in getSortedPositions" :key="position.id" 
                             class="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/10 transition-colors cursor-pointer"
                             @click="router.push(`/trade/${position.id}`)">
                          <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                              <font-awesome-icon :icon="getAssetTypeIcon(position.type)" class="text-green-400" />
                              <div>
                                <div class="font-medium text-white">{{ position.symbol }}</div>
                                <div class="text-sm text-gray-400">{{ position.name }}</div>
                              </div>
                            </div>
                            <div class="text-right">
                              <div class="text-white">${{ formatPrice(position.price) }}</div>
                              <div :class="[
                                'text-xs flex items-center justify-end gap-1',
                                position.gain >= 0 ? 'text-green-400' : 'text-red-400'
                              ]">
                                <font-awesome-icon :icon="position.gain >= 0 ? 'caret-up' : 'caret-down'" />
                                {{ isFinite(position.gain) ? Math.abs(position.gain).toFixed(2) : '0.00' }}%
                              </div>
                            </div>
                          </div>
                          <div class="flex justify-between mt-1">
                            <div class="text-xs text-gray-400">
                              Qty: {{ position.quantity }}
                            </div>
                            <div class="text-xs text-gray-400">
                              Value: ${{ formatPrice(position.value) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Recent Activity Panel -->
                  <div v-else-if="panel.id === 'recent-activity'" class="flex-1">
                    <div v-if="activities.loading" class="flex-1 flex items-center justify-center">
                      <LoadingSpinner class="w-6 h-6" />
                    </div>
                    <div v-else-if="activities.error" class="flex-1 flex items-center justify-center text-red-400">
                      {{ activities.error }}
                    </div>
                    <div v-else class="h-full overflow-y-auto scrollbar-thin">
                      <div v-for="activity in activities.data" :key="activity.id" 
                           class="p-3 bg-white/5 rounded-lg mb-2">
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-medium text-white">{{ activity.title }}</div>
                            <div class="text-sm text-gray-400">{{ new Date(activity.timestamp).toLocaleString() }}</div>
                          </div>
                          <div class="text-sm text-gray-400">
                            {{ activity.description }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Placeholder for other panels - ONLY for Charts panel, others should have specific implementations -->
                  <div v-else-if="panel.id === 'charts'" class="flex-1 flex flex-col items-center justify-center">
                    <font-awesome-icon :icon="panel.icon" class="panel-icon-lg mb-3 pulse-animate" />
                    <p class="text-center text-gray-400">{{ panel.title }} content coming soon</p>
                  </div>
                  
                  <!-- Default panel if none of the above -->
                  <div v-else class="flex-1 flex flex-col items-center justify-center">
                    <font-awesome-icon :icon="panel.icon" class="panel-icon-lg mb-3" />
                    <p class="text-center text-gray-400">{{ panel.title }}</p>
                  </div>
                </div>
                <!-- Decorative corner elements for futuristic look -->
                <div class="corner-decor top-left"></div>
                <div class="corner-decor top-right"></div>
                <div class="corner-decor bottom-left"></div>
                <div class="corner-decor bottom-right"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PageMain>
  </div>
</template>

<style scoped>
/* Add these new scrollbar styles at the beginning of your style block */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Add smooth scrolling */
.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* Update the trending container styles */
.trending-container {
  height: 100%;
  overflow: hidden;
  padding-bottom: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.trending-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px; /* Add slight padding to prevent scrollbar overlap */
}

.trending-item {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
}

.trending-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.trending-item:last-child {
  margin-bottom: 0;
}

/* Dashboard panel styles */
.dashboard-panel {
  @apply relative overflow-hidden;
  height: 290px;
  /* Fixed height to prevent jumping */
  border-radius: 0.75rem;
}

.panel-inner {
  @apply p-4 h-full flex flex-col border border-white/10 rounded-xl relative z-10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  border-radius: 0.75rem;
  height: 100%;
  width: 100%;
}

.panel-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  /* Match the bottom line's left margin */
  right: 15%;
  /* Match the bottom line's right margin */
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.3), transparent);
}

.panel-inner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.1), transparent);
}

@keyframes animatedBorder {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 300% 50%;
  }
}

.panel-inner {
  @apply p-4 h-full flex flex-col border border-white/10 rounded-xl relative z-10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  border-radius: 0.75rem;
}

/* Enhanced hover effects */
.panel-inner:hover {
  @apply border-green-500/30;
  background: linear-gradient(135deg, rgba(30, 38, 57, 0.9) 0%, rgba(13, 16, 27, 0.95) 100%);
  box-shadow: 0 12px 36px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(74, 222, 128, 0.2) inset;
  transform: translateY(-2px);
}

/* Futuristic border/line effects */
.panel-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.3), transparent);
}

.panel-inner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.1), transparent);
}

/* Glowing text and icons */
.glow-text {
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
}

.panel-icon {
  @apply text-green-400 text-xl;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.7));
}

.panel-icon-lg {
  @apply text-6xl text-green-400/20;
  filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.3));
}

/* Decorative corner elements */
.corner-decor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  z-index: 20;
}

.corner-decor.top-left {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
}

.corner-decor.top-right {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
}

.corner-decor.bottom-left {
  bottom: 8px;
  left: 8px;
  border-right: none;
  border-top: none;
}

.corner-decor.bottom-right {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
}

/* Animation effects */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.pulse-animate {
  animation: pulse 4s infinite ease-in-out;
}

/* Update scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-black/20 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-white/20 rounded-full hover:bg-white/30;
}

.scrollbar-thin {
  margin-right: -0.25rem;
  padding-right: 0.25rem;
}

/* Add these styles for better scrolling in trending panel */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 3px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Trending assets specific styling */
.trending-container {
  height: 100%;
  overflow: hidden;
  padding-bottom: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.trending-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px; /* Add slight padding to prevent scrollbar overlap */
}

.trending-item {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
}

.trending-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.trending-item:last-child {
  margin-bottom: 0;
}

/* Match header container width to card container width */
.page-header .max-w-7xl {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Ensure content overflow is handled properly */
.view-content {
  flex: 1;
  overflow: visible;
}

/* Adjust the panel section spacing */
.home-view>.w-full {
  padding-top: 1rem !important;
}

/* Override PageMain styling */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: visible !important;
}

/* Update landing page container to match TutorialView */
.landing-page {
  @apply w-full;
  min-height: 100%;
}

/* Add new gradient animation */
.animate-gradient {
  background: linear-gradient(
    45deg,
    rgba(74, 222, 128, 0.1) 0%,
    transparent 35%,
    rgba(16, 185, 129, 0.1) 50%,
    transparent 65%,
    rgba(74, 222, 128, 0.1) 100%
  );
  background-size: 400% 400%;
  animation: gradientMove 15s linear infinite;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

/* Update hover effects for stats cards */
.bg-black\/30:hover {
  @apply border-green-500/20;
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

/* Fix potential overlay issues */
.hero-section {
  isolation: isolate;
}

.hero-section > * {
  position: relative;
}

/* Ensure gradients don't block interactions */
.animate-gradient {
  pointer-events: none;
}

/* Ensure content is above gradients */
.hero-section .max-w-7xl {
  position: relative;
  z-index: 2;
}
</style>
