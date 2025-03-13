<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faChartPie, faBolt, faListCheck, faChartLine, 
  faClockRotateLeft, faEye, faGaugeHigh, faShieldHalved,
  faCartShopping, faChartColumn, faSync, faSearch, faWallet
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faChartPie, faBolt, faListCheck, faChartLine,
  faClockRotateLeft, faEye, faGaugeHigh, faShieldHalved,
  faCartShopping, faChartColumn, faSync, faSearch, faWallet
)

const router = useRouter()

const dashboardPanels = ref([
  { id: 'market-overview', title: 'Market Overview', icon: 'chart-pie', visible: true },
  { id: 'quick-actions', title: 'Quick Actions', icon: 'bolt', visible: true },
  { id: 'active-positions', title: 'Active Positions', icon: 'list-check', visible: true },
  { id: 'charts', title: 'Charts', icon: 'chart-line', visible: true },
  { id: 'recent-activity', title: 'Recent Activity', icon: 'clock-rotate-left', visible: true },
  { id: 'watchlist', title: 'Watchlist', icon: 'eye', visible: true }
])

// Panel visibility toggles
const togglePanel = (panelId: string) => {
  const panel = dashboardPanels.value.find(p => p.id === panelId)
  if (panel) panel.visible = !panel.visible
}

</script>

<template>
  <div class="flex flex-col h-full">
    <PageHeader>
      <!-- Dashboard controls -->
      <div class="flex-1 overflow-x-auto py-2">
        <div class="flex items-center gap-2 px-2 min-w-max">
          <button 
            v-for="panel in dashboardPanels"
            :key="panel.id"
            @click="togglePanel(panel.id)"
            class="px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="panel.visible ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
          >
            <font-awesome-icon :icon="panel.icon" class="mr-2" />
            {{ panel.title }}
          </button>
        </div>
      </div>
    </PageHeader>

    <PageMain>
      <div class="h-full overflow-y-auto">
        <div class="container mx-auto p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div 
              v-for="panel in dashboardPanels" 
              :key="panel.id"
              v-show="panel.visible" 
              class="dashboard-panel"
            >
              <div class="panel-content">
                <div class="panel-header">
                  <h2 class="panel-title">
                    <font-awesome-icon :icon="panel.icon" class="panel-icon" />
                    {{ panel.title }}
                  </h2>
                </div>
                
                <!-- Quick Actions Panel -->
                <div v-if="panel.id === 'quick-actions'" class="grid grid-cols-2 gap-3">
                  <button @click="router.push('/markets')" class="action-btn group">
                    <font-awesome-icon icon="search" class="mr-2 transform transition-transform group-hover:scale-110" />
                    Markets
                  </button>
                  <button @click="router.push('/portfolio')" class="action-btn group">
                    <font-awesome-icon icon="wallet" class="mr-2 transform transition-transform group-hover:scale-110" />
                    Portfolio
                  </button>
                </div>

                <!-- Placeholder for other panels -->
                <div v-else class="placeholder-content">
                  <font-awesome-icon :icon="panel.icon" class="text-4xl mb-3 text-white/10" />
                  <p>{{ panel.title }} content coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
.dashboard-panel {
  @apply bg-white/10 backdrop-blur-sm rounded-xl border border-white/10;
  height: 200px;
}

.panel-content {
  @apply p-4 h-full flex flex-col;
}

.panel-header {
  @apply flex justify-between items-center mb-4 flex-none;
}

.panel-title {
  @apply text-white text-lg font-medium flex items-center gap-2;
}

.panel-icon {
  @apply text-green-400;
}

.action-btn {
  @apply px-4 py-2.5 rounded-lg bg-white/5 text-white
         transition-colors flex items-center justify-center
         hover:bg-green-600;
}

.placeholder-content {
  @apply flex-1 flex flex-col items-center justify-center
         text-gray-400 rounded-lg border border-white/5;
}

/* Scrollbar styling */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-black/20;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-white/20 rounded-full hover:bg-white/30;
}

/* Remove duplicate animation properties and unused styles */
</style>
