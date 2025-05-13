<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import { ref, onMounted } from 'vue'
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

// Import dashboard components
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import MarketStatsPanel from '@/components/dashboard/MarketStatsPanel.vue'
import TrendingAssetsPanel from '@/components/dashboard/TrendingAssetsPanel.vue'
import WatchlistPanel from '@/components/dashboard/WatchlistPanel.vue'
import PositionsPanel from '@/components/dashboard/PositionsPanel.vue'
import ActivityPanel from '@/components/dashboard/ActivityPanel.vue'
import ChartsPanel from '@/components/dashboard/ChartsPanel.vue'

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

// Add new refs for panel data

// Each dashboard component now handles its own data fetching

// No need to fetch dashboard data here since components handle it themselves
onMounted(() => {
  // Nothing to do - each dashboard component handles its own data fetching
})

// Format price with commas and decimals
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
  const { clientX, clientY } = event
  const targetElement = event.currentTarget as HTMLElement
  
  if (!targetElement) return
  
  const rect = targetElement.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  
  targetElement.style.setProperty('--mouse-x', `${x}px`)
  targetElement.style.setProperty('--mouse-y', `${y}px`)
}

// Components now handle their own sorting
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
          <div class="max-w-7xl mx-auto w-full">
            <!-- Panels Grid -->
            <div class="dashboard-grid">
              <!-- Market Stats Panel -->
              <div class="dashboard-grid-item">
                <DashboardPanel title="Market Statistics" icon="chart-pie">
                  <MarketStatsPanel />
                </DashboardPanel>
              </div>

              <!-- Trending Assets Panel -->
              <div class="dashboard-grid-item">
                <DashboardPanel title="Trending Assets" icon="fire">
                  <TrendingAssetsPanel />
                </DashboardPanel>
              </div>

              <!-- Watchlist Panel -->
              <div class="dashboard-grid-item">
                <DashboardPanel title="Watchlist" icon="eye">
                  <WatchlistPanel />
                </DashboardPanel>
              </div>

              <!-- Active Positions Panel -->
              <div class="dashboard-grid-item">
                <DashboardPanel title="Active Positions" icon="list-check">
                  <PositionsPanel />
                </DashboardPanel>
              </div>

              <!-- Recent Activity Panel -->
              <div class="dashboard-grid-item">
                <DashboardPanel title="Recent Activity" icon="clock-rotate-left">
                  <ActivityPanel />
                </DashboardPanel>
              </div>

              <!-- Charts Panel -->
              <div class="dashboard-grid-item">
                <DashboardPanel title="Charts" icon="chart-line">
                  <ChartsPanel />
                </DashboardPanel>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PageMain>
  </div>
</template>

<style scoped>
/* Minimal scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Scrollable containers */
.overflow-y-auto, .scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.scrollbar-thin {
  margin-right: -0.25rem;
  padding-right: 0.25rem;
}

/* Text effects */
.glow-text {
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
}

/* Animation */
.pulse-animate {
  animation: pulse 4s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

/* Landing page */
.landing-page {
  @apply w-full;
  min-height: 100%;
}

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
  pointer-events: none;
}

/* Layout fixes */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: visible !important;
}

.hero-section {
  isolation: isolate;
}

.hero-section > * {
  position: relative;
}

.hero-section .max-w-7xl {
  position: relative;
  z-index: 2;
}

/* Dashboard grid layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
}

.dashboard-grid-item {
  width: 100%;
  min-width: 0; /* Important for preventing grid item overflow */
}

/* Small screens (tablets) */
@media (min-width: 640px) and (max-width: 1023px) {
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-flow: row;
    grid-auto-rows: auto;
    gap: 12px;
  }
  
  /* Fix for panels on tablet view */
  .dashboard-grid-item {
    width: 100%;
    overflow: hidden;
  }
}

/* Medium screens */
@media (min-width: 1024px) and (max-width: 1279px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

/* Large screens (desktops) */
@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
