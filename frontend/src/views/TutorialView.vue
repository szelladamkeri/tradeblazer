<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'

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
    <PageMain @mousemove="handleMouseMove">
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
                    Tutorial Guide
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
                      Getting Started
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
                        <!-- <font-awesome-icon icon="laptop" class="text-xs" />  -->
                      </div>
                      Website Navigation
                    </button>
                    <button 
                      @click="setActiveSection('trading-basics')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'trading-basics' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="book" class="text-xs" />
                      Trading Basics
                    </button>
                    <button 
                      @click="setActiveSection('advanced-tools')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'advanced-tools' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="chart-line" class="text-xs" />
                      Advanced Tools
                    </button>
                    <button 
                      @click="setActiveSection('portfolio-management')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'portfolio-management' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="wallet" class="text-xs" />
                      Portfolio Management
                    </button>
                    <button 
                      @click="setActiveSection('market-analysis')"
                      class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                      :class="activeSection === 'market-analysis' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'text-gray-300 hover:bg-white/10'"
                    >
                      <font-awesome-icon icon="chart-pie" class="text-xs" />
                      Market Analysis
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
                    Getting Started with TradeBlazer
                  </h2>
                  
                  <div class="space-y-6">
                    <!-- Welcome Introduction -->
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-2 text-green-400">Welcome to TradeBlazer</h3>
                      <p class="text-gray-300">
                        Welcome aboard! TradeBlazer is a friendly and easy-to-use platform for buying and selling financial assets 
                        like stocks, cryptocurrencies, and currencies. Whether you're completely new to trading or have some experience, 
                        we're here to guide you every step of the way.
                      </p>
                    </div>
                    
                    <!-- Account Setup -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Creating Your Account</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Step 1: Sign Up</h4>
                          <p class="text-sm text-gray-400">
                            Simply enter your email and create a password. We keep things simple so you can start
                            exploring right away!
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Step 2: Complete Your Profile</h4>
                          <p class="text-sm text-gray-400">
                            Add your name and preferences. This helps us personalize your trading experience.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- What You Can Do -->
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 class="font-medium text-white mb-2">What You Can Do on TradeBlazer</h4>
                      <p class="text-sm text-gray-400 mb-3">
                        Here are the main things you can do on our platform:
                      </p>
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <font-awesome-icon icon="search" class="text-green-400 text-xl mb-2" />
                          <p class="text-white text-sm">Explore Markets</p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <div class="flex justify-center gap-2 mb-2">
                            <font-awesome-icon icon="circle-arrow-up" class="text-green-400 text-xl" />
                            <font-awesome-icon icon="circle-arrow-down" class="text-red-400 text-xl" />
                          </div>
                          <p class="text-white text-sm">Buy & Sell</p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <font-awesome-icon icon="chart-line" class="text-green-400 text-xl mb-2" />
                          <p class="text-white text-sm">Track Performance</p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg text-center">
                          <font-awesome-icon icon="book" class="text-green-400 text-xl mb-2" />
                          <p class="text-white text-sm">Learn & Grow</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Quick Tips -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">Beginner Tips</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>Start with the "Website Navigation" tutorial to learn how to use our platform</li>
                        <li>Begin with small amounts until you feel comfortable with trading</li>
                        <li>Use the Demo mode to practice without using real money</li>
                        <li>Don't hesitate to contact our support team if you need help!</li>
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
                    TradeBlazer Website Navigation
                  </h2>
                  
                  <div class="space-y-6">
                    <!-- Dashboard Overview -->
                    <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-2 text-green-400">The Dashboard</h3>
                      <p class="text-gray-300 mb-3">
                        The Dashboard is your home base. Here's what you'll find there:
                      </p>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">Market Overview</h4>
                          <p class="text-sm text-gray-400">
                            See the latest market trends and popular assets in one glance
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">Your Portfolio</h4>
                          <p class="text-sm text-gray-400">
                            Quick look at your investments and how they're performing
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">Watchlist</h4>
                          <p class="text-sm text-gray-400">
                            Assets you're interested in but haven't bought yet
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-2">Recent Activity</h4>
                          <p class="text-sm text-gray-400">
                            Your latest trades and account updates
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Main Navigation -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Main Menu Navigation</h3>
                      <p class="text-gray-300 mb-3">
                        The main menu is always available at the top of the page:
                      </p>
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-white/10">
                          <thead class="bg-white/5">
                            <tr>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Menu Item</th>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">What It Does</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-white/10">
                            <tr class="bg-white/5">
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Home</td>
                              <td class="px-6 py-4 text-sm text-gray-400">Returns to the main dashboard</td>
                            </tr>
                            <tr>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Markets</td>
                              <td class="px-6 py-4 text-sm text-gray-400">Browse all available assets you can trade</td>
                            </tr>
                            <tr class="bg-white/5">
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Portfolio</td>
                              <td class="px-6 py-4 text-sm text-gray-400">See all your investments in detail</td>
                            </tr>
                            <tr>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Watchlist</td>
                              <td class="px-6 py-4 text-sm text-gray-400">View and manage assets you're monitoring</td>
                            </tr>
                            <tr class="bg-white/5">
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Profile</td>
                              <td class="px-6 py-4 text-sm text-gray-400">Manage your account settings and information</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <!-- How to Trade -->
                    <div class="bg-white/5 p-5 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">How to Make Your First Trade</h3>
                      <div class="space-y-4">
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <h4 class="font-medium text-white">Find an Asset</h4>
                            <p class="text-sm text-gray-400">Go to the Markets page and search for an asset you're interested in</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <h4 class="font-medium text-white">Review Details</h4>
                            <p class="text-sm text-gray-400">Click on the asset to see its price history and information</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                          <div>
                            <h4 class="font-medium text-white">Enter Amount</h4>
                            <p class="text-sm text-gray-400">Choose how much you want to buy or sell</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                          <div>
                            <h4 class="font-medium text-white">Confirm Trade</h4>
                            <p class="text-sm text-gray-400">Review your order and click "Execute Trade"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Account Management -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Managing Your Account</h3>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Depositing Funds</h4>
                          <p class="text-sm text-gray-400">
                            1. Go to your Profile<br>
                            2. Click "Deposit"<br>
                            3. Enter amount and choose payment method<br>
                            4. Confirm the transaction
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Withdrawing Funds</h4>
                          <p class="text-sm text-gray-400">
                            1. Go to your Profile<br>
                            2. Click "Withdraw"<br>
                            3. Enter amount and choose withdrawal method<br>
                            4. Confirm the transaction
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Getting Help -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">Need Help?</h4>
                      <p class="text-gray-300 mb-3">
                        If you ever get stuck or have questions, we're here to help you!
                      </p>
                      <div class="grid md:grid-cols-3 gap-3">
                        <button class="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors text-center">
                          <font-awesome-icon icon="circle-question" class="text-green-400 mb-1" />
                          <p class="text-white text-sm">Help Center</p>
                        </button>
                        <button class="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors text-center">
                          <font-awesome-icon icon="comments" class="text-green-400 mb-1" />
                          <p class="text-white text-sm">Live Chat</p>
                        </button>
                        <button class="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors text-center">
                          <font-awesome-icon icon="envelope" class="text-green-400 mb-1" />
                          <p class="text-white text-sm">Email Support</p>
                        </button>
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
                    Trading Basics
                  </h2>
                  
                  <div class="space-y-6">
                    <h3 class="text-lg font-medium mb-3 text-green-400">What Are Financial Markets?</h3>
                    <p class="mb-4 text-gray-300">
                      Think of markets as big online stores where people buy and sell different types of financial assets. 
                      Here are the main types you'll see on TradeBlazer:
                    </p>
                    
                    <!-- Market Types Comparison -->
                    <div class="overflow-x-auto mb-6">
                      <table class="min-w-full divide-y divide-white/10">
                        <thead class="bg-white/5">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">What It Is</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Example</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-white/10">
                          <tr class="bg-white/5">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Stocks</td>
                            <td class="px-6 py-4 text-sm text-gray-400">Small pieces of ownership in companies</td>
                            <td class="px-6 py-4 text-sm text-gray-400">Apple, Amazon, Tesla</td>
                          </tr>
                          <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Cryptocurrencies</td>
                            <td class="px-6 py-4 text-sm text-gray-400">Digital currencies that use encryption</td>
                            <td class="px-6 py-4 text-sm text-gray-400">Bitcoin, Ethereum, Dogecoin</td>
                          </tr>
                          <tr class="bg-white/5">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Forex</td>
                            <td class="px-6 py-4 text-sm text-gray-400">Trading one currency for another</td>
                            <td class="px-6 py-4 text-sm text-gray-400">USD/EUR, GBP/JPY</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Basic Trading Concepts -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Basic Trading Concepts</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-6">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Buying vs. Selling</h4>
                          <p class="text-sm text-gray-400">
                            <strong>Buying (Going Long):</strong> You buy an asset hoping its price will go up, so you can sell it later for a profit.<br><br>
                            <strong>Selling (Going Short):</strong> You sell an asset you think will drop in price, hoping to buy it back cheaper later.
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Price Movements</h4>
                          <p class="text-sm text-gray-400">
                            <span class="text-green-400">Green numbers</span> mean price is going up.<br>
                            <span class="text-red-400">Red numbers</span> mean price is going down.<br><br>
                            Prices change based on how many people are buying and selling.
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Order Types</h4>
                          <p class="text-sm text-gray-400">
                            <strong>Market Order:</strong> Buy or sell right now at the current price.<br><br>
                            <strong>Limit Order:</strong> Set a specific price you want to buy or sell at. The order will only execute if the market reaches that price.
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Risk Management</h4>
                          <p class="text-sm text-gray-400">
                            <strong>Start small:</strong> Begin with amounts you can afford to lose.<br><br>
                            <strong>Diversify:</strong> Don't put all your money in one asset.<br><br>
                            <strong>Stop-loss:</strong> Set a price where your position automatically closes to limit losses.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Understanding Profit and Loss -->
                    <div class="bg-white/5 p-5 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">Understanding Profit and Loss</h3>
                      <div class="flex flex-col md:flex-row gap-4">
                        <div class="bg-white/10 p-4 rounded-lg md:w-1/2">
                          <h4 class="font-medium text-green-400 mb-2">Example: Making a Profit</h4>
                          <p class="text-gray-300 text-sm mb-2">You buy 1 share of a company for $100</p>
                          <p class="text-gray-300 text-sm mb-2">The price rises to $120</p>
                          <p class="text-gray-300 text-sm mb-2">You sell your share</p>
                          <p class="text-white font-medium">Your profit: $20 (20% return)</p>
                        </div>
                        <div class="bg-white/10 p-4 rounded-lg md:w-1/2">
                          <h4 class="font-medium text-red-400 mb-2">Example: Taking a Loss</h4>
                          <p class="text-gray-300 text-sm mb-2">You buy 1 share of a company for $100</p>
                          <p class="text-gray-300 text-sm mb-2">The price falls to $80</p>
                          <p class="text-gray-300 text-sm mb-2">You sell your share</p>
                          <p class="text-white font-medium">Your loss: $20 (20% loss)</p>
                        </div>
                      </div>
                      <p class="text-gray-300 mt-4">
                        Remember: All investments involve risk. Prices can go up or down, and you might get back less than you put in.
                      </p>
                    </div>
                    
                    <!-- Beginner's FAQ -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">Beginner's FAQ</h4>
                      <div class="space-y-3">
                        <div>
                          <p class="text-white font-medium">How much money do I need to start?</p>
                          <p class="text-gray-300">You can start with as little as $10 on TradeBlazer.</p>
                        </div>
                        <div>
                          <p class="text-white font-medium">How do I know which assets to buy?</p>
                          <p class="text-gray-300">Research companies you understand or use our "Recommended for Beginners" section.</p>
                        </div>
                        <div>
                          <p class="text-white font-medium">Is it risky to trade?</p>
                          <p class="text-gray-300">Yes, all trading carries risk. Never invest more than you can afford to lose.</p>
                        </div>
                        <div>
                          <p class="text-white font-medium">How quickly can I withdraw my money?</p>
                          <p class="text-gray-300">Most withdrawals process within 1-3 business days.</p>
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
                    Advanced Trading Tools
                  </h2>
                  
                  <div class="space-y-6">
                    <p class="text-gray-300 mb-6">
                      Once you're comfortable with the basics, these advanced tools can help you make better trading decisions.
                      Don't worry if they seem complicated at first - you can learn about them step by step!
                    </p>
                    
                    <!-- Technical Indicators Explained Simply -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Chart Tools Explained Simply</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Moving Averages</h4>
                          <p class="text-sm text-gray-400">
                            <strong>What it is:</strong> A line showing the average price over time<br><br>
                            <strong>How to use it:</strong> When price goes above the line, it might be a good time to buy. 
                            When it goes below, it might be time to sell.<br><br>
                            <strong>Like:</strong> Looking at the average temperature for the last 14 days to predict tomorrow's weather
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">RSI (Relative Strength Index)</h4>
                          <p class="text-sm text-gray-400">
                            <strong>What it is:</strong> A tool that shows if an asset might be overbought (too expensive) or oversold (too cheap)<br><br>
                            <strong>How to use it:</strong> When RSI is above 70, the asset might be overpriced and due for a drop. 
                            When below 30, it might be underpriced and due for a rise.<br><br>
                            <strong>Like:</strong> A car's speedometer warning you when you're going too fast
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Simplified Chart Patterns -->
                    <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">Chart Patterns for Beginners</h3>
                      <p class="text-gray-300 mb-4">
                        Chart patterns are shapes that appear in price charts that might help predict future movements.
                        Think of them like weather patterns that might help forecast what's coming next.
                      </p>
                      <div class="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 class="font-medium text-white mb-2">Uptrend (Bullish)</h4>
                          <p class="text-sm text-gray-400 mb-2">
                            A series of higher highs and higher lows. Like climbing up stairs - each step is higher than the last.
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
                          <h4 class="font-medium text-white mb-2">Downtrend (Bearish)</h4>
                          <p class="text-sm text-gray-400 mb-2">
                            A series of lower highs and lower lows. Like walking down stairs - each step is lower than the last.
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
                      <h3 class="text-lg font-medium mb-3 text-green-400">Helpful Order Types</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Stop Loss</h4>
                          <p class="text-sm text-gray-400">
                            <strong>What it does:</strong> Automatically sells your asset if the price falls to a level you set<br><br>
                            <strong>Why use it:</strong> Protects you from big losses if the market moves against you<br><br>
                            <strong>Like:</strong> An insurance policy for your trades
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Take Profit</h4>
                          <p class="text-sm text-gray-400">
                            <strong>What it does:</strong> Automatically sells your asset when it reaches a profit target you set<br><br>
                            <strong>Why use it:</strong> Locks in your profits without you having to watch the market constantly<br><br>
                            <strong>Like:</strong> Having a finish line for your race
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Beginner-Friendly Tips -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">Tips for Using Advanced Tools</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>Start with just one or two simple tools - don't overwhelm yourself</li>
                        <li>Practice using these tools with paper trading (no real money) first</li>
                        <li>Remember that no tool can predict the future with 100% accuracy</li>
                        <li>Use our tutorial videos to see these tools in action</li>
                        <li>Join our community forum to learn how other beginners are using these tools</li>
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
                    Managing Your Investments
                  </h2>
                  
                  <div class="space-y-6">
                    <p class="text-gray-300 mb-6">
                      Portfolio management is simply how you organize and look after all your investments.
                      Think of it like tending a garden - you need to plant different things, maintain them, and sometimes make changes.
                    </p>
                    
                    <!-- Don't Put All Eggs in One Basket -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Spreading Your Money (Diversification)</h3>
                      <div class="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
                        <h4 class="font-medium text-white mb-3">Don't Put All Your Eggs in One Basket</h4>
                        <div class="grid grid-cols-3 gap-3 mb-4">
                          <div class="h-24 relative rounded-lg overflow-hidden bg-gradient-to-b from-blue-500/30 to-blue-600/30 border border-blue-400/20">
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                <p class="text-xs text-gray-300">Stocks</p>
                                <p class="text-lg font-bold text-white">40%</p>
                              </div>
                            </div>
                          </div>
                          <div class="h-24 relative rounded-lg overflow-hidden bg-gradient-to-b from-green-500/30 to-green-600/30 border border-green-400/20">
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                <p class="text-xs text-gray-300">Safer Investments</p>
                                <p class="text-lg font-bold text-white">40%</p>
                              </div>
                            </div>
                          </div>
                          <div class="h-24 relative rounded-lg overflow-hidden bg-gradient-to-b from-yellow-500/30 to-yellow-600/30 border border-yellow-400/20">
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                <p class="text-xs text-gray-300">New Opportunities</p>
                                <p class="text-lg font-bold text-white">20%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p class="text-sm text-gray-400">
                          Spreading your money across different types of investments helps protect you if one area performs poorly.
                          It's like not wearing all your warm clothes on one day - you need some for other days too!
                        </p>
                      </div>
                    </div>
                    
                    <!-- Risk Explained Simply -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Understanding Risk</h3>
                      <div class="grid md:grid-cols-3 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Low Risk</h4>
                          <div class="bg-blue-500/20 h-4 rounded-full mb-2"></div>
                          <p class="text-sm text-gray-400">
                            Safer investments with steady but smaller returns. 
                            Like taking a slow but reliable bus.
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Medium Risk</h4>
                          <div class="bg-yellow-500/20 h-4 rounded-full mb-2"></div>
                          <p class="text-sm text-gray-400">
                            Balanced investments with moderate growth potential.
                            Like riding a bike - faster than walking but still controlled.
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">High Risk</h4>
                          <div class="bg-red-500/20 h-4 rounded-full mb-2"></div>
                          <p class="text-sm text-gray-400">
                            More volatile investments with bigger potential gains or losses.
                            Like riding a rollercoaster - thrilling but not for everyone.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- When to Change Your Portfolio -->
                    <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">When to Make Changes</h3>
                      <div class="space-y-4">
                        <div class="flex items-start gap-3">
                          <font-awesome-icon icon="calendar-days" class="text-green-400 mt-1" />
                          <div>
                            <h4 class="font-medium text-white">Regular Check-ups</h4>
                            <p class="text-sm text-gray-400">
                              Look at your investments every 3-6 months, like getting a regular health check-up
                            </p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <font-awesome-icon icon="life-ring" class="text-green-400 mt-1" />
                          <div>
                            <h4 class="font-medium text-white">Life Changes</h4>
                            <p class="text-sm text-gray-400">
                              Major life events (marriage, new job, retirement) might mean you need to adjust your investment strategy
                            </p>
                          </div>
                        </div>
                        <div class="flex items-start gap-3">
                          <font-awesome-icon icon="scale-balanced" class="text-green-400 mt-1" />
                          <div>
                            <h4 class="font-medium text-white">Rebalancing</h4>
                            <p class="text-sm text-gray-400">
                              If one type of investment grows a lot, you might need to sell some and buy others to maintain your balance
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Beginner Portfolio Tips -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">Tips for Beginners</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>Start with investments you understand - don't buy what you don't know</li>
                        <li>Think long-term rather than trying to make quick profits</li>
                        <li>Invest regularly in small amounts rather than all at once</li>
                        <li>Keep some money in cash for emergencies</li>
                        <li>Remember that past performance doesn't guarantee future results</li>
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
                    Understanding the Market
                  </h2>
                  
                  <div class="space-y-6">
                    <p class="text-gray-300 mb-6">
                      Market analysis is simply looking at information to decide whether to buy, sell, or hold investments.
                      Think of it like checking the weather forecast before deciding what to wear.
                    </p>
                    
                    <!-- Two Main Ways to Analyze -->
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                      <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div class="flex justify-between items-start mb-3">
                          <h3 class="text-lg font-medium text-green-400">Looking at Companies</h3>
                          <font-awesome-icon icon="building" class="text-green-400" />
                        </div>
                        <p class="text-sm text-gray-400 mb-3">
                          Fundamental analysis means looking at the company itself - its finances, products, management, and growth.
                        </p>
                        <p class="text-sm text-gray-400">
                          <strong>Like:</strong> Checking a car's engine, history, and condition before buying
                        </p>
                      </div>
                      
                      <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div class="flex justify-between items-start mb-3">
                          <h3 class="text-lg font-medium text-green-400">Looking at Charts</h3>
                          <font-awesome-icon icon="chart-line" class="text-green-400" />
                        </div>
                        <p class="text-sm text-gray-400 mb-3">
                          Technical analysis means looking at price charts and patterns to predict future movements.
                        </p>
                        <p class="text-sm text-gray-400">
                          <strong>Like:</strong> Looking at a car's speed history to predict how fast it will go
                        </p>
                      </div>
                    </div>
                    
                    <!-- Simple Indicators Anyone Can Use -->
                    <div>
                      <h3 class="text-lg font-medium mb-3 text-green-400">Simple Things to Watch</h3>
                      <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Company News</h4>
                          <p class="text-sm text-gray-400">
                            Big announcements like new products, partnerships, or leadership changes can affect price
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Trading Volume</h4>
                          <p class="text-sm text-gray-400">
                            How many shares are being bought and sold - higher volume often means something important is happening
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Overall Market Trends</h4>
                          <p class="text-sm text-gray-400">
                            Most stocks move in the same direction as the overall market ("a rising tide lifts all boats")
                          </p>
                        </div>
                        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 class="font-medium text-white mb-2">Industry Changes</h4>
                          <p class="text-sm text-gray-400">
                            News affecting an entire industry (like new regulations) will affect all companies in that sector
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Market Analysis Framework -->
                    <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 class="text-lg font-medium mb-3 text-green-400">Simple Steps to Analyze</h3>
                      <div class="space-y-4">
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">Step 1: What's the Big Picture?</h4>
                          <p class="text-sm text-gray-400">
                            Look at the overall economy and market direction - are things generally going up or down?
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">Step 2: How's the Industry Doing?</h4>
                          <p class="text-sm text-gray-400">
                            Is this type of business generally doing well right now?
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">Step 3: Is This Specific Investment Good?</h4>
                          <p class="text-sm text-gray-400">
                            Now look at the specific stock, cryptocurrency, or currency pair you're interested in
                          </p>
                        </div>
                        <div class="bg-white/10 p-3 rounded-lg">
                          <h4 class="font-medium text-white mb-1">Step 4: What's Your Time Frame?</h4>
                          <p class="text-sm text-gray-400">
                            Are you investing for days, months, or years? This affects what type of analysis matters most
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Common Beginner Mistakes -->
                    <div class="bg-green-500/10 border-l-4 border-green-400 p-4 rounded-lg">
                      <h4 class="text-lg font-medium mb-2 text-white">Common Beginner Mistakes</h4>
                      <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>Following random tips without doing your own research</li>
                        <li>Focusing only on price without understanding why it's changing</li>
                        <li>Getting emotionally attached to investments</li>
                        <li>Trying to time the market perfectly (almost impossible!)</li>
                        <li>Forgetting that past performance doesn't guarantee future results</li>
                      </ul>
                      <p class="mt-3 text-gray-300">
                        Remember: Even professional analysts get things wrong. The market can be unpredictable!
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
  @apply relative overflow-hidden;
  border-radius: 0.75rem;
  height: auto !important;
  min-height: 200px;
}

.panel-inner {
  @apply p-4 h-full flex flex-col border border-white/10 rounded-xl relative z-10;
  background: linear-gradient(135deg, rgba(25, 33, 52, 0.8) 0%, rgba(8, 11, 22, 0.9) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.1) inset;
  transition: all 0.4s ease;
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
}

.panel-inner:hover {
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
