<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import { useI18n } from 'vue-i18n'

// Add i18n support
const { t } = useI18n()

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement;
  const rect = main.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  
  main.style.setProperty('--mouse-x', `${x}%`);
  main.style.setProperty('--mouse-y', `${y}%`);
};

// Track the active tutorial section
const activeSection = ref('getting-started');
const setActiveSection = (section: string) => {
  activeSection.value = section;
};
</script>

<template>
  <div class="tutorial-view view-container">
    <PageHeader @mousemove="handleMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove" class="pb-4">
      <div class="w-full h-full overflow-auto px-2 sm:px-4 py-4">
        <div class="max-w-7xl mx-auto">
          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Sidebar Navigation -->
            <div class="md:col-span-1">
              <div class="dashboard-panel sticky top-4">
                <div class="panel-inner">
                  <h2 class="text-lg font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="graduation-cap" class="text-green-400" />
                    {{ t('tutorial.title') }}
                  </h2>
                  
                  <nav class="space-y-2">
                    <button 
                      @click="setActiveSection('getting-started')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'getting-started' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="play" class="text-xs" />
                      {{ t('tutorial.sections.gettingStarted') }}
                    </button>
                    <button 
                      @click="setActiveSection('website-tutorial')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'website-tutorial' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <div class="flex items-center gap-1">
                        <font-awesome-icon icon="compass" class="text-xs" />
                      </div>
                      {{ t('tutorial.sections.websiteNavigation') }}
                    </button>
                    <button 
                      @click="setActiveSection('trading-basics')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'trading-basics' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="book" class="text-xs" />
                      {{ t('tutorial.sections.tradingBasics') }}
                    </button>
                    <button 
                      @click="setActiveSection('advanced-tools')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'advanced-tools' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="chart-line" class="text-xs" />
                      {{ t('tutorial.sections.advancedTools') }}
                    </button>
                    <button 
                      @click="setActiveSection('portfolio-management')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'portfolio-management' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="wallet" class="text-xs" />
                      {{ t('tutorial.sections.portfolioManagement') }}
                    </button>
                    <button 
                      @click="setActiveSection('market-analysis')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'market-analysis' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="chart-pie" class="text-xs" />
                      {{ t('tutorial.sections.marketAnalysis') }}
                    </button>
                  </nav>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
                </div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="md:col-span-3">
              <!-- Getting Started Section -->
              <div v-if="activeSection === 'getting-started'" class="dashboard-panel animate-fadeIn">
                <div class="panel-inner">
                  <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="play" class="text-green-400" />
                    {{ t('tutorial.gettingStarted.title') }}
                  </h2>
                  
                  <div class="space-y-6">
                    <!-- Welcome Introduction -->
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-2 text-green-400">{{ t('tutorial.gettingStarted.welcome.title') }}</h3>
                      <p class="text-gray-300">
                        {{ t('tutorial.gettingStarted.welcome.description') }}
                      </p>
                    </div>
                    
                    <!-- Account Setup -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.gettingStarted.accountSetup.title') }}</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.gettingStarted.accountSetup.step1.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.gettingStarted.accountSetup.step1.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.gettingStarted.accountSetup.step2.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.gettingStarted.accountSetup.step2.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- What You Can Do -->
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 class="font-medium text-white mb-2">{{ t('tutorial.gettingStarted.whatYouCanDo.title') }}</h4>
                      <p class="text-sm text-gray-400 mb-3">
                        {{ t('tutorial.gettingStarted.whatYouCanDo.description') }}
                      </p>
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <font-awesome-icon icon="search" class="text-green-400 text-xl mb-2" />
                          <p class="text-white text-sm">{{ t('tutorial.gettingStarted.whatYouCanDo.exploreMarkets') }}</p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <div class="flex justify-center gap-2 mb-2">
                            <font-awesome-icon icon="circle-arrow-up" class="text-green-400 text-xl" />
                            <font-awesome-icon icon="circle-arrow-down" class="text-red-400 text-xl" />
                          </div>
                          <p class="text-white text-sm">{{ t('tutorial.gettingStarted.whatYouCanDo.buySell') }}</p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <font-awesome-icon icon="chart-line" class="text-green-400 text-xl mb-2" />
                          <p class="text-white text-sm">{{ t('tutorial.gettingStarted.whatYouCanDo.trackPerformance') }}</p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <font-awesome-icon icon="book" class="text-green-400 text-xl mb-2" />
                          <p class="text-white text-sm">{{ t('tutorial.gettingStarted.whatYouCanDo.learnGrow') }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Quick Tips -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">{{ t('tutorial.gettingStarted.quickTips.title') }}</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>{{ t('tutorial.gettingStarted.quickTips.tip1') }}</li>
                        <li>{{ t('tutorial.gettingStarted.quickTips.tip2') }}</li>
                        <li>{{ t('tutorial.gettingStarted.quickTips.tip3') }}</li>
                        <li>{{ t('tutorial.gettingStarted.quickTips.tip4') }}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
                </div>
              </div>
              
              <!-- Website Navigation Tutorial (NEW SECTION) -->
              <div v-if="activeSection === 'website-tutorial'" class="dashboard-panel animate-fadeIn">
                <div class="panel-inner">
                  <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="compass" class="text-green-400" />
                    {{ t('tutorial.websiteTutorial.title') }}
                  </h2>
                  
                  <div class="space-y-6">
                    <!-- Dashboard Overview -->
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-2 text-green-400">{{ t('tutorial.websiteTutorial.dashboard.title') }}</h3>
                      <p class="text-gray-300 mb-3">
                        {{ t('tutorial.websiteTutorial.dashboard.description') }}
                      </p>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.websiteTutorial.dashboard.marketOverview.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.websiteTutorial.dashboard.marketOverview.description') }}
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.websiteTutorial.dashboard.yourPortfolio.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.websiteTutorial.dashboard.yourPortfolio.description') }}
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.websiteTutorial.dashboard.watchlist.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.websiteTutorial.dashboard.watchlist.description') }}
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.websiteTutorial.dashboard.recentActivity.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.websiteTutorial.dashboard.recentActivity.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Main Navigation -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.websiteTutorial.mainMenu.title') }}</h3>
                      <p class="text-gray-300 mb-3">
                        {{ t('tutorial.websiteTutorial.mainMenu.description') }}
                      </p>
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-white/10">
                          <thead class="bg-white/5">
                            <tr>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('tutorial.websiteTutorial.mainMenu.table.menuItem') }}</th>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('tutorial.websiteTutorial.mainMenu.table.whatItDoes') }}</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-white/10">
                            <tr class="bg-white/5">
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.websiteTutorial.mainMenu.table.home') }}</td>
                              <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.websiteTutorial.mainMenu.table.homeDescription') }}</td>
                            </tr>
                            <tr>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.websiteTutorial.mainMenu.table.markets') }}</td>
                              <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.websiteTutorial.mainMenu.table.marketsDescription') }}</td>
                            </tr>
                            <tr class="bg-white/5">
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.websiteTutorial.mainMenu.table.portfolio') }}</td>
                              <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.websiteTutorial.mainMenu.table.portfolioDescription') }}</td>
                            </tr>
                            <tr>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.websiteTutorial.mainMenu.table.watchlist') }}</td>
                              <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.websiteTutorial.mainMenu.table.watchlistDescription') }}</td>
                            </tr>
                            <tr class="bg-white/5">
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.websiteTutorial.mainMenu.table.profile') }}</td>
                              <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.websiteTutorial.mainMenu.table.profileDescription') }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <!-- How to Trade -->
                    <div class="bg-white/5 p-5 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.websiteTutorial.howToTrade.title') }}</h3>
                      <div class="space-y-4">
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.websiteTutorial.howToTrade.step1.title') }}</h4>
                            <p class="text-sm text-gray-400">{{ t('tutorial.websiteTutorial.howToTrade.step1.description') }}</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.websiteTutorial.howToTrade.step2.title') }}</h4>
                            <p class="text-sm text-gray-400">{{ t('tutorial.websiteTutorial.howToTrade.step2.description') }}</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.websiteTutorial.howToTrade.step3.title') }}</h4>
                            <p class="text-sm text-gray-400">{{ t('tutorial.websiteTutorial.howToTrade.step3.description') }}</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.websiteTutorial.howToTrade.step4.title') }}</h4>
                            <p class="text-sm text-gray-400">{{ t('tutorial.websiteTutorial.howToTrade.step4.description') }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Account Management -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.websiteTutorial.accountManagement.title') }}</h3>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.websiteTutorial.accountManagement.depositingFunds.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.websiteTutorial.accountManagement.depositingFunds.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.websiteTutorial.accountManagement.withdrawingFunds.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.websiteTutorial.accountManagement.withdrawingFunds.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Getting Help -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">{{ t('tutorial.websiteTutorial.gettingHelp.title') }}</h4>
                      <p class="text-gray-300 mb-3">
                        {{ t('tutorial.websiteTutorial.gettingHelp.description') }}
                      </p>
                      <div class="grid md:grid-cols-1 gap-3">
                        <a href="mailto:support@tradeblazer.com" class="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors text-center">
                          <font-awesome-icon icon="envelope" class="text-green-400 mb-1" />
                          <p class="text-white text-sm">{{ t('tutorial.websiteTutorial.gettingHelp.emailSupport') }}</p>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
                </div>
              </div>
              
              <!-- Trading Basics Section -->
              <div v-if="activeSection === 'trading-basics'" class="dashboard-panel animate-fadeIn">
                <div class="panel-inner">
                  <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="book" class="text-green-400" />
                    {{ t('tutorial.tradingBasics.title') }}
                  </h2>
                  
                  <div class="space-y-6">
                    <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.tradingBasics.whatAreMarkets.title') }}</h3>
                    <p class="mb-4 text-gray-300">
                      {{ t('tutorial.tradingBasics.whatAreMarkets.description') }}
                    </p>
                    
                    <!-- Market Types Comparison -->
                    <div class="overflow-x-auto mb-6">
                      <table class="min-w-full divide-y divide-white/10">
                        <thead class="bg-white/5">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('tutorial.tradingBasics.marketTypes.table.marketType') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('tutorial.tradingBasics.marketTypes.table.whatItIs') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('tutorial.tradingBasics.marketTypes.table.example') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-white/10">
                          <tr class="bg-white/5">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.tradingBasics.marketTypes.table.stocks') }}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.tradingBasics.marketTypes.table.stocksDescription') }}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.tradingBasics.marketTypes.table.stocksExample') }}</td>
                          </tr>
                          <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.tradingBasics.marketTypes.table.cryptocurrencies') }}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.tradingBasics.marketTypes.table.cryptocurrenciesDescription') }}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.tradingBasics.marketTypes.table.cryptocurrenciesExample') }}</td>
                          </tr>
                          <tr class="bg-white/5">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ t('tutorial.tradingBasics.marketTypes.table.forex') }}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.tradingBasics.marketTypes.table.forexDescription') }}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">{{ t('tutorial.tradingBasics.marketTypes.table.forexExample') }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Basic Trading Concepts -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.tradingBasics.basicConcepts.title') }}</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-6">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.tradingBasics.basicConcepts.buyingSelling.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.tradingBasics.basicConcepts.buyingSelling.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.tradingBasics.basicConcepts.priceMovements.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.tradingBasics.basicConcepts.priceMovements.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.tradingBasics.basicConcepts.orderTypes.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.tradingBasics.basicConcepts.orderTypes.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.tradingBasics.basicConcepts.riskManagement.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.tradingBasics.basicConcepts.riskManagement.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Understanding Profit and Loss -->
                    <div class="bg-white/5 p-5 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.tradingBasics.profitLoss.title') }}</h3>
                      <div class="flex flex-col md:flex-row gap-4">
                        <div class="bg-white/10 p-4 rounded-lg md:w-1/2">
                          <h4 class="font-medium text-green-400 mb-2">{{ t('tutorial.tradingBasics.profitLoss.profitExample.title') }}</h4>
                          <p class="text-gray-300 text-sm mb-2">{{ t('tutorial.tradingBasics.profitLoss.profitExample.step1') }}</p>
                          <p class="text-gray-300 text-sm mb-2">{{ t('tutorial.tradingBasics.profitLoss.profitExample.step2') }}</p>
                          <p class="text-gray-300 text-sm mb-2">{{ t('tutorial.tradingBasics.profitLoss.profitExample.step3') }}</p>
                          <p class="text-white font-medium">{{ t('tutorial.tradingBasics.profitLoss.profitExample.result') }}</p>
                        </div>
                        <div class="bg-white/10 p-4 rounded-lg md:w-1/2">
                          <h4 class="font-medium text-red-400 mb-2">{{ t('tutorial.tradingBasics.profitLoss.lossExample.title') }}</h4>
                          <p class="text-gray-300 text-sm mb-2">{{ t('tutorial.tradingBasics.profitLoss.lossExample.step1') }}</p>
                          <p class="text-gray-300 text-sm mb-2">{{ t('tutorial.tradingBasics.profitLoss.lossExample.step2') }}</p>
                          <p class="text-gray-300 text-sm mb-2">{{ t('tutorial.tradingBasics.profitLoss.lossExample.step3') }}</p>
                          <p class="text-white font-medium">{{ t('tutorial.tradingBasics.profitLoss.lossExample.result') }}</p>
                        </div>
                      </div>
                      <p class="text-gray-300 mt-4">
                        {{ t('tutorial.tradingBasics.profitLoss.reminder') }}
                      </p>
                    </div>
                    
                    <!-- Beginner's FAQ -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">{{ t('tutorial.tradingBasics.faq.title') }}</h4>
                      <div class="space-y-3">
                        <div>
                          <p class="text-white font-medium">{{ t('tutorial.tradingBasics.faq.question1.title') }}</p>
                          <p class="text-gray-300">{{ t('tutorial.tradingBasics.faq.question1.answer') }}</p>
                        </div>
                        <div>
                          <p class="text-white font-medium">{{ t('tutorial.tradingBasics.faq.question2.title') }}</p>
                          <p class="text-gray-300">{{ t('tutorial.tradingBasics.faq.question2.answer') }}</p>
                        </div>
                        <div>
                          <p class="text-white font-medium">{{ t('tutorial.tradingBasics.faq.question3.title') }}</p>
                          <p class="text-gray-300">{{ t('tutorial.tradingBasics.faq.question3.answer') }}</p>
                        </div>
                        <div>
                          <p class="text-white font-medium">{{ t('tutorial.tradingBasics.faq.question4.title') }}</p>
                          <p class="text-gray-300">{{ t('tutorial.tradingBasics.faq.question4.answer') }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
                </div>
              </div>
              
              <!-- Advanced Tools Section (Simplified for beginners) -->
              <div v-if="activeSection === 'advanced-tools'" class="dashboard-panel animate-fadeIn">
                <div class="panel-inner">
                  <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="chart-line" class="text-green-400" />
                    {{ t('tutorial.advancedTools.title') }}
                  </h2>
                  
                  <div class="space-y-6">
                    <p class="text-gray-300 mb-6">
                      {{ t('tutorial.advancedTools.description') }}
                    </p>
                    
                    <!-- Technical Indicators Explained Simply -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.advancedTools.chartTools.title') }}</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.advancedTools.chartTools.movingAverages.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.advancedTools.chartTools.movingAverages.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.advancedTools.chartTools.rsi.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.advancedTools.chartTools.rsi.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Simplified Chart Patterns -->
                    <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.advancedTools.chartPatterns.title') }}</h3>
                      <p class="text-gray-300 mb-4">
                        {{ t('tutorial.advancedTools.chartPatterns.description') }}
                      </p>
                      <div class="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.advancedTools.chartPatterns.uptrend.title') }}</h4>
                          <p class="text-sm text-gray-400 mb-2">
                            {{ t('tutorial.advancedTools.chartPatterns.uptrend.description') }}
                          </p>
                          <div class="h-20 bg-white/10 rounded-lg relative overflow-hidden">
                            <div class="absolute inset-0 flex items-center">
                              <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path d="M0,30 L20,25 L40,20 L60,15 L80,10 L100,5" fill="none" stroke="#4ade80" stroke-width="2"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.advancedTools.chartPatterns.downtrend.title') }}</h4>
                          <p class="text-sm text-gray-400 mb-2">
                            {{ t('tutorial.advancedTools.chartPatterns.downtrend.description') }}
                          </p>
                          <div class="h-20 bg-white/10 rounded-lg relative overflow-hidden">
                            <div class="absolute inset-0 flex items-center">
                              <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path d="M0,5 L20,10 L40,15 L60,20 L80,25 L100,30" fill="none" stroke="#f87171" stroke-width="2"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Order Types for Beginners -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.advancedTools.orderTypes.title') }}</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.advancedTools.orderTypes.stopLoss.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.advancedTools.orderTypes.stopLoss.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.advancedTools.orderTypes.takeProfit.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.advancedTools.orderTypes.takeProfit.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Beginner-Friendly Tips -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">{{ t('tutorial.advancedTools.tips.title') }}</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>{{ t('tutorial.advancedTools.tips.tip1') }}</li>
                        <li>{{ t('tutorial.advancedTools.tips.tip2') }}</li>
                        <li>{{ t('tutorial.advancedTools.tips.tip3') }}</li>
                        <li>{{ t('tutorial.advancedTools.tips.tip4') }}</li>
                        <li>{{ t('tutorial.advancedTools.tips.tip5') }}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
                </div>
              </div>
              
              <!-- Portfolio Management (Simplified) -->
              <div v-if="activeSection === 'portfolio-management'" class="dashboard-panel animate-fadeIn">
                <div class="panel-inner">
                  <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="wallet" class="text-green-400" />
                    {{ t('tutorial.portfolioManagement.title') }}
                  </h2>
                  
                  <div class="space-y-6">
                    <p class="text-gray-300 mb-6">
                      {{ t('tutorial.portfolioManagement.description') }}
                    </p>
                    
                    <!-- Don't Put All Eggs in One Basket -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.portfolioManagement.diversification.title') }}</h3>
                      <div class="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
                        <h4 class="font-medium text-white mb-3">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.title') }}</h4>
                        <div class="grid grid-cols-3 gap-3 mb-4">
                          <div class="h-24 relative rounded-lg overflow-hidden bg-gradient-to-b from-blue-500/30 to-blue-600/30 border border-blue-400/20">
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                <p class="text-xs text-gray-300">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.stocks') }}</p>
                                <p class="text-lg font-bold text-white">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.stocksPercentage') }}</p>
                              </div>
                            </div>
                          </div>
                          <div class="h-24 relative rounded-lg overflow-hidden bg-gradient-to-b from-green-500/30 to-green-600/30 border border-green-400/20">
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                <p class="text-xs text-gray-300">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.saferInvestments') }}</p>
                                <p class="text-lg font-bold text-white">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.saferInvestmentsPercentage') }}</p>
                              </div>
                            </div>
                          </div>
                          <div class="h-24 relative rounded-lg overflow-hidden bg-gradient-to-b from-yellow-500/30 to-yellow-600/30 border border-yellow-400/20">
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                <p class="text-xs text-gray-300">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.newOpportunities') }}</p>
                                <p class="text-lg font-bold text-white">{{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.newOpportunitiesPercentage') }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p class="text-sm text-gray-400">
                          {{ t('tutorial.portfolioManagement.diversification.dontPutAllEggs.description') }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Risk Explained Simply -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.portfolioManagement.risk.title') }}</h3>
                      <div class="grid md:grid-cols-3 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.portfolioManagement.risk.lowRisk.title') }}</h4>
                          <div class="bg-blue-500/20 h-4 rounded-full mb-2"></div>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.portfolioManagement.risk.lowRisk.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.portfolioManagement.risk.mediumRisk.title') }}</h4>
                          <div class="bg-yellow-500/20 h-4 rounded-full mb-2"></div>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.portfolioManagement.risk.mediumRisk.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.portfolioManagement.risk.highRisk.title') }}</h4>
                          <div class="bg-red-500/20 h-4 rounded-full mb-2"></div>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.portfolioManagement.risk.highRisk.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- When to Change Your Portfolio -->
                    <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.portfolioManagement.whenToChange.title') }}</h3>
                      <div class="space-y-4">
                        <div class="flex items-start gap-3">
                          <font-awesome-icon icon="calendar-days" class="text-green-400 mt-1" />
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.portfolioManagement.whenToChange.regularCheckups.title') }}</h4>
                            <p class="text-sm text-gray-400">
                              {{ t('tutorial.portfolioManagement.whenToChange.regularCheckups.description') }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <font-awesome-icon icon="life-ring" class="text-green-400 mt-1" />
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.portfolioManagement.whenToChange.lifeChanges.title') }}</h4>
                            <p class="text-sm text-gray-400">
                              {{ t('tutorial.portfolioManagement.whenToChange.lifeChanges.description') }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <font-awesome-icon icon="scale-balanced" class="text-green-400 mt-1" />
                          <div>
                            <h4 class="font-medium text-white">{{ t('tutorial.portfolioManagement.whenToChange.rebalancing.title') }}</h4>
                            <p class="text-sm text-gray-400">
                              {{ t('tutorial.portfolioManagement.whenToChange.rebalancing.description') }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Beginner Portfolio Tips -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">{{ t('tutorial.portfolioManagement.tips.title') }}</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>{{ t('tutorial.portfolioManagement.tips.tip1') }}</li>
                        <li>{{ t('tutorial.portfolioManagement.tips.tip2') }}</li>
                        <li>{{ t('tutorial.portfolioManagement.tips.tip3') }}</li>
                        <li>{{ t('tutorial.portfolioManagement.tips.tip4') }}</li>
                        <li>{{ t('tutorial.portfolioManagement.tips.tip5') }}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
                </div>
              </div>
              
              <!-- Market Analysis (Simplified) -->
              <div v-if="activeSection === 'market-analysis'" class="dashboard-panel animate-fadeIn">
                <div class="panel-inner">
                  <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <font-awesome-icon icon="chart-pie" class="text-green-400" />
                    {{ t('tutorial.marketAnalysis.title') }}
                  </h2>
                  
                  <div class="space-y-6">
                    <p class="text-gray-300 mb-6">
                      {{ t('tutorial.marketAnalysis.description') }}
                    </p>
                    
                    <!-- Two Main Ways to Analyze -->
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                      <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div class="flex justify-between items-start mb-3">
                          <h3 class="text-lg font-medium text-green-400">{{ t('tutorial.marketAnalysis.twoWays.fundamental.title') }}</h3>
                          <font-awesome-icon icon="building" class="text-green-400" />
                        </div>
                        <p class="text-sm text-gray-400 mb-3">
                          {{ t('tutorial.marketAnalysis.twoWays.fundamental.description') }}
                        </p>
                        <p class="text-sm text-gray-400">
                          {{ t('tutorial.marketAnalysis.twoWays.fundamental.like') }}
                        </p>
                      </div>
                      
                      <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div class="flex justify-between items-start mb-3">
                          <h3 class="text-lg font-medium text-green-400">{{ t('tutorial.marketAnalysis.twoWays.technical.title') }}</h3>
                          <font-awesome-icon icon="chart-line" class="text-green-400" />
                        </div>
                        <p class="text-sm text-gray-400 mb-3">
                          {{ t('tutorial.marketAnalysis.twoWays.technical.description') }}
                        </p>
                        <p class="text-sm text-gray-400">
                          {{ t('tutorial.marketAnalysis.twoWays.technical.like') }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Simple Indicators Anyone Can Use -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.marketAnalysis.simpleIndicators.title') }}</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.marketAnalysis.simpleIndicators.companyNews.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.simpleIndicators.companyNews.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.marketAnalysis.simpleIndicators.tradingVolume.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.simpleIndicators.tradingVolume.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.marketAnalysis.simpleIndicators.marketTrends.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.simpleIndicators.marketTrends.description') }}
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">{{ t('tutorial.marketAnalysis.simpleIndicators.industryChanges.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.simpleIndicators.industryChanges.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Market Analysis Framework -->
                    <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">{{ t('tutorial.marketAnalysis.framework.title') }}</h3>
                      <div class="space-y-4">
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">{{ t('tutorial.marketAnalysis.framework.step1.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.framework.step1.description') }}
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">{{ t('tutorial.marketAnalysis.framework.step2.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.framework.step2.description') }}
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">{{ t('tutorial.marketAnalysis.framework.step3.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.framework.step3.description') }}
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">{{ t('tutorial.marketAnalysis.framework.step4.title') }}</h4>
                          <p class="text-sm text-gray-400">
                            {{ t('tutorial.marketAnalysis.framework.step4.description') }}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Common Beginner Mistakes -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">{{ t('tutorial.marketAnalysis.mistakes.title') }}</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>{{ t('tutorial.marketAnalysis.mistakes.mistake1') }}</li>
                        <li>{{ t('tutorial.marketAnalysis.mistakes.mistake2') }}</li>
                        <li>{{ t('tutorial.marketAnalysis.mistakes.mistake3') }}</li>
                        <li>{{ t('tutorial.marketAnalysis.mistakes.mistake4') }}</li>
                        <li>{{ t('tutorial.marketAnalysis.mistakes.mistake5') }}</li>
                      </ul>
                      <p class="mt-3 text-gray-300">
                        {{ t('tutorial.marketAnalysis.mistakes.reminder') }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>
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
.view-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:deep(.page-main) {
  width: 100% !important;
  flex: 1;
  position: relative;
  z-index: var(--z-content);
}

/* Dashboard panel styling to match other views */
.dashboard-panel {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  height: auto !important;
  min-height: 200px;
}

.panel-inner {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  position: relative;
  z-index: 10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  overflow: hidden;
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

/* Animation for section transitions */
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Keep sidebar fixed on scroll */
.sticky {
  position: sticky;
  top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .panel-inner {
    padding: 1rem;
  }
}
</style>