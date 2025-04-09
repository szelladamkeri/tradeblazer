<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { useLanguageStore } from '@/stores/languageStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const languageStore = useLanguageStore()
const router = useRouter()
const { t, locale } = useI18n()
const isMenuOpen = ref(false)

const handleSignOut = () => {
  userStore.logout()
  router.push('/login')
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Add window resize handler
const updateMenuOnResize = () => {
  if (window.innerWidth >= 640) {
    // 640px is Tailwind's 'sm' breakpoint
    isMenuOpen.value = false
  }
}

// Remove local avatar checking logic and use store instead
const avatarAvailable = computed(() => userStore.avatar.available)
const avatarTimestamp = computed(() => userStore.avatarTimestamp)

// Add watch for user store changes
watch(
  () => userStore.user,
  async () => {
    if (userStore.isAuthenticated) {
      await userStore.checkAvatar()
    }
  },
)

// Add dropdown state
const showDropdown = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

// Close dropdown when clicking outside
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showProfileDropdown.value = false
  }
}

const showProfileDropdown = ref(false)

// Add computed property for first letter
const firstLetter = computed(() => {
  return userStore.user?.username.charAt(0).toUpperCase() || '?'
})

// Improved search functionality
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searchError = ref<string | null>(null)
const showSearchResults = ref(false)

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  searchError.value = null

  // Get current route for debugging
  const currentRoute = router.currentRoute.value.path
  console.log(`Performing search from route ${currentRoute} for: "${searchQuery.value}"`)

  try {
    // Add a cache-busting parameter to avoid potential browser caching issues
    const timestamp = new Date().getTime()
    const url = `http://localhost:3000/api/assets/search?q=${encodeURIComponent(searchQuery.value)}&_=${timestamp}`

    console.log(`Sending search request to: ${url}`)
    const response = await fetch(url)

    if (!response.ok) {
      let errorText
      try {
        // Try to get error as JSON first
        const errorJson = await response.json()
        errorText = JSON.stringify(errorJson)
      } catch {
        // Fall back to text if not JSON
        errorText = await response.text().catch(() => 'No error details available')
      }

      console.error(`Search failed from route ${currentRoute}:`, response.status, errorText)
      throw new Error(`Search failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log(`Search found ${data.length} results from route ${currentRoute}`)

    // Reset results first to ensure UI updates properly
    searchResults.value = []
    // Small delay to ensure UI updates before populating results
    setTimeout(() => {
      searchResults.value = data.slice(0, 5) // Limit to 5 results for better UX
    }, 10)
  } catch (err) {
    console.error(`Search error from route ${currentRoute}:`, err)
    searchError.value = `Failed to perform search: ${err.message || 'Unknown error'}`
  } finally {
    searchLoading.value = false
  }
}

// Improve debounce handling with clear cancellation
let searchTimeout: number | null = null
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  if (searchQuery.value.length >= 2) {
    searchTimeout = window.setTimeout(() => {
      performSearch()
      showSearchResults.value = true
    }, 300)
  } else {
    searchResults.value = []
    showSearchResults.value = false
  }
})

// Ensure cleanup on component unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
})

const closeSearchResults = () => {
  showSearchResults.value = false
}

const goToAsset = (assetId: number) => {
  router.push(`/trade/${assetId}`)
  searchQuery.value = ''
  closeSearchResults()
  closeMenu()
}

// Add click outside detection for search results
const searchContainerRef = ref<HTMLDivElement | null>(null)

const closeSearchResultsOnClickOutside = (event: MouseEvent) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target as Node)) {
    showSearchResults.value = false
  }
}

// Change language function
const changeLanguage = (lang: string) => {
  console.log('Changing language to:', lang)
  languageStore.setLanguage(lang)
  locale.value = lang
  showLanguageDropdown.value = false
}

// Set up language dropdown
const showLanguageDropdown = ref(false)
const languageDropdownRef = ref<HTMLDivElement | null>(null)

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
  console.log('Language dropdown toggled:', showLanguageDropdown.value)
}

const closeLanguageDropdown = () => {
  showLanguageDropdown.value = false
}

// Close language dropdown when clicking outside
const closeLanguageDropdownOnClickOutside = (event: MouseEvent) => {
  if (languageDropdownRef.value && !languageDropdownRef.value.contains(event.target as Node)) {
    closeLanguageDropdown()
  }
}

// Add More dropdown state
const showMoreMenu = ref(false)
const moreMenuRef = ref<HTMLDivElement | null>(null)

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

onMounted(async () => {
  if (userStore.isAuthenticated) {
    await userStore.checkAvatar()
  }
  window.addEventListener('resize', updateMenuOnResize)
  document.addEventListener('click', closeDropdownOnClickOutside)
  document.addEventListener('click', closeSearchResultsOnClickOutside)
  document.addEventListener('click', closeLanguageDropdownOnClickOutside)

  // Set initial language from store
  locale.value = languageStore.currentLanguage
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMenuOnResize)
  document.removeEventListener('click', closeDropdownOnClickOutside)
  document.removeEventListener('click', closeSearchResultsOnClickOutside)
  document.removeEventListener('click', closeLanguageDropdownOnClickOutside)
})

// Add a debug computed property to help troubleshoot
const debugIsAdmin = computed(() => {
  const isAdmin = userStore.isAdmin
  console.log('isAdmin value:', isAdmin, 'user:', userStore.user)
  return isAdmin
})

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

const formatBalance = (balance?: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance || 0)
}

// Add comment for future navigation items
/**
 * Navigation Item Priority Guide
 * Primary (always visible):
 * - Dashboard
 * - Markets
 * - Portfolio (if authenticated)
 * 
 * Secondary (move to dropdown on medium screens):
 * - Tutorial
 * - Any new pages/features added in the future
 * - Profile settings
 * Note: Admin should stay visible if user is admin
 */
</script>

<template>
  <div class="component-global-wrapper">
    <div class="page-header-wrapper">
      <header class="page-header w-full z-[50]" @mousemove="handleMouseMove">
        <!-- Add decorative corner elements to match HomeView cards -->
        <div class="corner-decor top-left"></div>
        <div class="corner-decor top-right"></div>
        <div class="corner-decor bottom-left"></div>
        <div class="corner-decor bottom-right"></div>

        <!-- Add corner accents to match PageMain -->
        <div class="corner-accent top-left"></div>
        <div class="corner-accent top-right"></div>
        <div class="corner-accent bottom-left"></div>
        <div class="corner-accent bottom-right"></div>

        <!-- Content container to maintain readable width -->
        <div class="content-container">
          <div class="px-2 sm:px-4 py-3">
            <!-- Adjusted padding -->
            <div class="flex items-center justify-between gap-2">
              <!-- Added gap -->
              <!-- Logo - made more compact on mobile -->
              <div class="flex items-center shrink-0 logo-container">
                <font-awesome-icon icon="chart-line" class="text-xl sm:text-2xl text-green-400 mr-1.5 sm:mr-2" />
                <span class="text-white font-bold text-lg sm:text-xl">TradeBlazer</span>
              </div>

              <!-- Search Bar - Centered and optimized -->
              <div ref="searchContainerRef" class="relative flex-1 mx-3 md:mx-8 max-w-md hidden lg:block">
                <div class="relative group">
                  <input v-model="searchQuery" type="text" placeholder="Search assets..."
                    class="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all duration-200 group-hover:bg-white/15" />
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <font-awesome-icon v-if="searchLoading" icon="spinner" class="text-gray-400 animate-spin" />
                    <font-awesome-icon v-else-if="searchQuery && searchQuery.length > 0" @click="searchQuery = ''"
                      icon="times-circle" class="text-gray-400 cursor-pointer hover:text-white" />
                    <font-awesome-icon v-else icon="search" class="text-gray-400" />
                  </div>
                </div>

                <!-- Search Results Dropdown -->
                <transition name="fade" enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-1">
                  <div v-show="showSearchResults && (searchResults.length > 0 || searchLoading || searchError)"
                    class="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl backdrop-saturate-150 rounded-lg border border-white/10 shadow-lg max-h-96 overflow-y-auto z-[60]">
                    <!-- Loading State -->
                    <div v-if="searchLoading" class="py-4 px-4 text-center">
                      <LoadingSpinner class="h-6 w-6 mx-auto" />
                      <p class="mt-2 text-gray-400">Searching...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="searchError" class="py-4 px-4 text-center">
                      <font-awesome-icon icon="exclamation-triangle" class="text-red-400 text-xl mb-2" />
                      <p class="text-red-400">{{ searchError }}</p>
                    </div>

                    <!-- Results -->
                    <div v-else class="py-1">
                      <div v-for="result in searchResults" :key="result.id" @click="goToAsset(result.id)"
                        class="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-medium text-white flex items-center">
                              {{ result.symbol }}
                              <span class="ml-2 px-2 py-0.5 text-xs bg-white/10 rounded-full text-gray-400">
                                {{ result.type }}
                              </span>
                            </div>
                            <div class="text-sm text-gray-400 truncate max-w-[220px]">{{ result.name }}</div>
                          </div>
                          <div class="text-green-400 font-medium group-hover:translate-x-0.5 transition-transform">
                            ${{ result.price }}
                            <font-awesome-icon icon="arrow-right"
                              class="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>

                      <!-- View all results link -->
                      <div v-if="searchResults.length > 0"
                        class="mt-1 pt-2 border-t border-white/10 px-4 py-2 text-center">
                        <a @click="closeSearchResults" href="#"
                          class="text-green-400 hover:text-green-300 text-sm transition-colors">
                          <font-awesome-icon icon="list" class="mr-1" />
                          View all results
                        </a>
                      </div>
                    </div>

                    <!-- No results -->
                    <div v-if="searchResults.length === 0 && !searchLoading && !searchError"
                      class="py-6 px-4 text-center">
                      <font-awesome-icon icon="search" class="text-gray-400 text-xl mb-2" />
                      <p class="text-gray-400">No results found</p>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Mobile menu button - Enhanced styling -->
              <button @click="toggleMenu"
                class="lg:hidden p-2 text-gray-300 hover:text-green-400 transition-all duration-200 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                aria-label="Toggle menu" :aria-expanded="isMenuOpen">
                <font-awesome-icon :icon="isMenuOpen ? 'xmark' : 'bars'" class="text-2xl" />
              </button>

              <!-- Desktop Navigation -->
              <nav class="hidden lg:flex items-center gap-1 flex-nowrap min-w-0 overflow-x-auto">

                <!-- Changed space-x-4 to space-x-2 for tighter spacing -->
                <HeaderLink>
                  <template #icon>
                    <router-link to="/" class="text-gray-300 hover:text-green-400 flex items-center">
                      <font-awesome-icon icon="chart-line" class="mr-2" />
                      <span>{{ t('navigation.dashboard') }}</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <HeaderLink>
                  <template #icon>
                    <router-link to="/markets" class="text-gray-300 hover:text-green-400 flex items-center">
                      <font-awesome-icon icon="chart-pie" class="mr-2" />
                      <span>{{ t('navigation.markets') }}</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <template v-if="userStore.isAuthenticated">
                  <HeaderLink>
                    <template #icon>
                      <router-link to="/portfolio" class="text-gray-300 hover:text-green-400 flex items-center">
                        <font-awesome-icon icon="wallet" class="mr-2" />
                        <span>{{ t('navigation.portfolio') }}</span>
                      </router-link>
                    </template>
                  </HeaderLink>
                </template>

                <!-- More Dropdown - Hide on xl screens -->
                <div class="relative hidden lg:block xl:hidden" ref="moreMenuRef">
                  <HeaderLink>
                    <template #icon>
                      <button @click="toggleMoreMenu" type="button" 
                        class="text-gray-300 hover:text-green-400 flex items-center">
                        <span>{{ t('navigation.more') }}</span>
                        <font-awesome-icon icon="chevron-down" class="ml-2 text-xs transition-transform"
                          :class="{ 'rotate-180': showMoreMenu }" />
                      </button>
                    </template>
                  </HeaderLink>

                  <!-- More Menu Dropdown -->
                  <div v-show="showMoreMenu"
                    class="absolute right-0 top-[calc(100%+0.5rem)] min-w-[180px] py-2 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-lg border border-white/10 z-[60]">
                    <!-- Triangle indicator -->
                    <div class="absolute -top-2 right-4 w-3 h-3 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 border-t border-l border-white/10 transform rotate-45">
                    </div>

                    <router-link to="/tutorial"
                      class="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-green-400 transition-all duration-200 flex items-center"
                      :class="$route.path === '/tutorial' ? 'bg-green-500/20 text-green-400' : ''">
                      <font-awesome-icon icon="graduation-cap" class="mr-2" />
                      <span>{{ t('navigation.tutorial') }}</span>
                    </router-link>

                    <template v-if="userStore.isAdmin">
                      <div class="w-full h-px bg-white/10 my-1"></div>
                      <router-link to="/admin"
                        class="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-green-400 transition-all duration-200 flex items-center"
                        :class="$route.path === '/admin' ? 'bg-green-500/20 text-green-400' : ''">
                        <font-awesome-icon icon="shield" class="mr-2" />
                        <span>Admin</span>
                      </router-link>
                    </template>
                  </div>
                </div>

                <!-- Add Language Selector -->
                <div class="relative ml-1" ref="languageDropdownRef">
                  <button @click="toggleLanguageDropdown" type="button" :class="[
                    'flex items-center px-3 py-2 rounded-lg transition-all duration-200',
                    showLanguageDropdown ? 'bg-green-500/20 text-green-400' : 'text-gray-300 hover:bg-white/10 hover:text-green-400'
                  ]">
                    <font-awesome-icon icon="language" class="mr-2" />
                    <span class="text-sm">{{ languageStore.currentLanguage.toUpperCase() }}</span>
                  </button>

                  <!-- Language Dropdown -->
                  <div v-show="showLanguageDropdown"
                    class="absolute right-0 top-full mt-2 w-40 py-2 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-lg border border-white/10 z-[60]">
                    <!-- Connecting triangle -->
                    <div
                      class="absolute -top-2 right-4 w-3 h-3 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 border-t border-l border-white/10 transform rotate-45">
                    </div>

                    <button @click="changeLanguage('en')" type="button"
                      class="w-full text-left px-4 py-2 hover:bg-white/10 transition-all duration-200 flex items-center"
                      :class="languageStore.currentLanguage === 'en' ? 'text-green-400' : 'text-gray-300 hover:text-green-400'">
                      <span class="mr-2">🇺🇸</span>
                      <span>English</span>
                    </button>

                    <button @click="changeLanguage('hu')" type="button"
                      class="w-full text-left px-4 py-2 hover:bg-white/10 transition-all duration-200 flex items-center"
                      :class="languageStore.currentLanguage === 'hu' ? 'text-green-400' : 'text-gray-300 hover:text-green-400'">
                      <span class="mr-2">🇭🇺</span>
                      <span>Magyar</span>
                    </button>
                  </div>
                </div>
              </nav>

              <!-- User Profile Section -->
              <div v-if="userStore.isAuthenticated" class="relative flex items-center" ref="dropdownRef">
                <!-- Replace displayName with username -->
                <div class="hidden sm:block">
                  <span :class="[
                    'mr-3 transition-colors',
                    $route.path === '/profile' ? 'text-green-400' : 'text-gray-300',
                  ]">
                    {{ userStore.user?.username }}
                  </span>
                </div>

                <!-- Avatar button and dropdown container -->
                <div class="relative">
                  <button @click.stop="showProfileDropdown = !showProfileDropdown" :class="[
                    'w-8 h-8 rounded-full overflow-hidden transition-all z-30 flex items-center justify-center cursor-pointer',
                    $route.path === '/profile'
                      ? 'bg-green-500/20 ring-2 ring-green-400/50'
                      : 'bg-white/10 hover:ring-2 hover:ring-green-400/50',
                  ]">
                    <img v-if="avatarAvailable"
                      :src="`http://localhost:3000/uploads/avatars/${userStore.user?.username}.jpg?t=${avatarTimestamp}`"
                      :key="avatarTimestamp" class="w-full h-full object-cover pointer-events-none" alt="Profile" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-green-500">
                      <span class="text-white text-sm font-medium">{{ firstLetter }}</span>
                    </div>
                  </button>

                  <!-- Profile Dropdown -->
                  <div v-show="showProfileDropdown"
                    class="absolute right-0 top-[calc(100%+0.5rem)] w-48 py-2 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-lg border border-white/10 z-50">
                    <!-- Connecting triangle -->
                    <div
                      class="absolute -top-2 right-2 w-3 h-3 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 border-t border-l border-white/10 transform rotate-45">
                    </div>

                    <router-link to="/profile"
                      class="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-green-400 transition-all duration-200"
                      @click="showProfileDropdown = false" active-class="text-green-400 bg-white/5">
                      <font-awesome-icon icon="user-circle" class="mr-2" />
                      Profile
                    </router-link>
                    <div class="w-full h-px bg-white/10 my-1"></div>
                    <button @click="handleSignOut"
                      class="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 hover:text-red-300 transition-all duration-200">
                      <font-awesome-icon icon="right-from-bracket" class="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Mobile Menu -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
          <div v-if="isMenuOpen" class="mobile-menu lg:hidden fixed inset-x-0 top-[4.5rem] z-[70]">
            <!-- Backdrop with blur and gradient -->
            <div
              class="absolute inset-0 bg-gradient-to-b from-[rgba(18,24,38,0.95)] to-[rgba(8,11,22,0.98)] backdrop-blur-xl backdrop-saturate-150 -z-10">
            </div>

            <div class="relative z-10 px-4 pt-4 pb-6 border-t border-b border-white/10">
              <!-- Enhanced mobile search -->
              <div class="mb-4">
                <div class="relative">
                  <input v-model="searchQuery" type="text" placeholder="Search assets..."
                    class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200" />
                  <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
                    <font-awesome-icon v-if="searchLoading" icon="spinner" class="text-gray-400 animate-spin" />
                    <font-awesome-icon v-else-if="searchQuery" @click="searchQuery = ''" icon="times-circle"
                      class="text-gray-400 cursor-pointer hover:text-white transition-colors" />
                    <font-awesome-icon v-else icon="search" class="text-gray-400" />
                  </div>
                </div>

                <!-- Mobile Search Results -->
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                  <div v-if="showSearchResults && (searchResults.length > 0 || searchLoading || searchError)"
                    class="absolute inset-x-4 mt-2 bg-black/70 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                    <!-- Loading State -->
                    <div v-if="searchLoading" class="py-4 px-4 text-center">
                      <LoadingSpinner class="h-6 w-6 mx-auto" />
                      <p class="mt-2 text-gray-400">Searching...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="searchError" class="py-4 px-4 text-center">
                      <font-awesome-icon icon="triangle-exclamation" class="text-red-400 text-xl mb-2" />
                      <p class="text-red-400">{{ searchError }}</p>
                    </div>

                    <!-- Results -->
                    <div v-else class="py-1">
                      <div v-for="result in searchResults" :key="result.id" @click="goToAsset(result.id)"
                        class="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-medium text-white flex items-center">
                              {{ result.symbol }}
                              <span class="ml-2 px-2 py-0.5 text-xs bg-white/10 rounded-full text-gray-400">
                                {{ result.type }}
                              </span>
                            </div>
                            <div class="text-sm text-gray-400 truncate max-w-[220px]">{{ result.name }}</div>
                          </div>
                          <div class="text-green-400 font-medium group-hover:translate-x-0.5 transition-transform">
                            ${{ result.price }}
                            <font-awesome-icon icon="arrow-right"
                              class="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>

                      <!-- View all results link -->
                      <div v-if="searchResults.length > 0"
                        class="mt-1 pt-2 border-t border-white/10 px-4 py-2 text-center">
                        <a @click="closeSearchResults" href="#"
                          class="text-green-400 hover:text-green-300 text-sm transition-colors">
                          <font-awesome-icon icon="list" class="mr-1" />
                          View all results
                        </a>
                      </div>
                    </div>

                    <!-- No results -->
                    <div v-if="searchResults.length === 0 && !searchLoading && !searchError"
                      class="py-6 px-4 text-center">
                      <font-awesome-icon icon="search" class="text-gray-400 text-xl mb-2" />
                      <p class="text-gray-400">No results found</p>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Enhanced mobile navigation -->
              <nav class="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <HeaderLink @click="closeMenu">
                  <template #icon>
                    <router-link to="/"
                      class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                      :class="$route.path === '/' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                      <font-awesome-icon icon="chart-line" class="text-lg mr-3" />
                      <span class="font-medium">{{ t('navigation.dashboard') }}</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <HeaderLink @click="closeMenu">
                  <template #icon>
                    <router-link to="/markets"
                      class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                      :class="$route.path.startsWith('/markets') ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                      <font-awesome-icon icon="chart-pie" class="text-lg mr-3" />
                      <span class="font-medium">{{ t('navigation.markets') }}</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <!-- Add Tutorial Link to mobile menu -->
                <HeaderLink @click="closeMenu">
                  <template #icon>
                    <router-link to="/tutorial"
                      class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                      :class="$route.path === '/tutorial' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                      <font-awesome-icon icon="graduation-cap" class="text-lg mr-3" />
                      <span class="font-medium">{{ t('navigation.tutorial') }}</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <template v-if="userStore.isAuthenticated">
                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link to="/portfolio"
                        class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                        :class="$route.path === '/portfolio' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                        <font-awesome-icon icon="wallet" class="text-lg mr-3" />
                        <span class="font-medium">Portfolio</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <HeaderLink v-if="userStore.isAdmin" @click="closeMenu">
                    <template #icon>
                      <router-link to="/admin"
                        class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                        :class="$route.path === '/admin' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                        <font-awesome-icon icon="shield" class="text-lg mr-3" />
                        <span class="font-medium">Admin</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <!-- Add balance display -->
                  <div class="flex items-center p-3 w-full rounded-lg bg-white/10">
                    <font-awesome-icon icon="wallet" class="text-lg mr-3 text-green-400" />
                    <span class="font-medium text-green-400">${{ formatBalance(userStore.user?.balance) }}</span>
                  </div>

                  <div class="w-full h-px bg-white/10 my-1"></div>

                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link to="/profile"
                        class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                        :class="$route.path === '/profile' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                        <font-awesome-icon icon="user-circle" class="text-lg mr-3" />
                        <span class="font-medium">Profile</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <HeaderLink @click="handleSignOut(); closeMenu();">
                    <template #icon>
                      <button
                        class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200 text-red-400 text-left">
                        <font-awesome-icon icon="right-from-bracket" class="text-lg mr-3" />
                        <span class="font-medium">Sign out</span>
                      </button>
                    </template>
                  </HeaderLink>
                </template>

                <template v-else>
                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link to="/login"
                        class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                        :class="$route.path === '/login' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                        <font-awesome-icon icon="right-to-bracket" class="text-lg mr-3" />
                        <span class="font-medium">Login</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link to="/register"
                        class="flex items-center p-3 w-full rounded-lg hover:bg-white/10 transition-all duration-200"
                        :class="$route.path === '/register' ? 'bg-green-500/20 text-green-400' : 'text-gray-300'">
                        <font-awesome-icon icon="user-plus" class="text-lg mr-3" />
                        <span class="font-medium">Register</span>
                      </router-link>
                    </template>
                  </HeaderLink>
                </template>

                <!-- Add language selector to mobile menu -->
                <div class="mt-4 pt-4 border-t border-white/10">
                  <div class="text-sm text-gray-400 mb-2 px-3">Language / Nyelv</div>
                  <div class="flex space-x-2 px-3">
                    <button @click="changeLanguage('en'); closeMenu();"
                      class="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      :class="languageStore.currentLanguage === 'en' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300'">
                      <span>🇺🇸</span>
                      <span>English</span>
                    </button>
                    <button @click="changeLanguage('hu'); closeMenu();"
                      class="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      :class="languageStore.currentLanguage === 'hu' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300'">
                      <span>🇭🇺</span>
                      <span>Magyar</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            <!-- Decorative elements -->
            <div class="corner-decor top-left"></div>
            <div class="corner-decor top-right"></div>
            <div class="corner-decor bottom-left"></div>
            <div class="corner-decor bottom-right"></div>
          </div>
        </transition>
      </header>
    </div>
  </div>
</template>

<style scoped>
/* Base Layout */
.component-global-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

/* Header Container */
.page-header {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: visible;
  position: relative;
  z-index: 50;
}

/* Interactive Gradient Effect */
.page-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(74, 222, 128, 0.08) 0%,
    transparent 60%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 1;
  border-radius: 0.75rem;
}

.page-header:hover::after {
  opacity: 1;
}

/* Navigation */
nav {
  flex-shrink: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

nav::-webkit-scrollbar {
  display: none;
}

/* Dropdowns */
.dropdown-container {
  overflow: visible;
  position: relative;
  isolation: isolate;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active,
.scale-enter-active,
.scale-leave-active {
  transition: all 150ms ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-1rem);
  opacity: 0;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Scrollbars */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

/* Hover Effects */
router-link:hover,
button:hover,
:deep(a:hover),
:deep(button:hover),
.dropdown-item:hover {
  @apply text-green-400 bg-white/10;
  transform: translateY(-1px);
}

/* Mobile Menu */
.mobile-menu {
  --menu-height: calc(100vh - 4.5rem);
  max-height: var(--menu-height);
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Dropdown visibility */
[v-show*="showMoreMenu"],
[v-show*="showLanguageDropdown"],
[v-show*="showProfileDropdown"] {
  z-index: 60;
}

/* Ensure dropdowns are properly positioned */
.relative {
  position: relative !important;
}

/* Media Queries */
@media (max-width: 1400px) {
  .page-header {
    width: 95vw;
    max-width: 1366px;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 90vw;
    max-width: 1024px;
  }
}

@media (max-width: 640px) {
  .page-header {
    width: calc(100vw - 2rem);
    height: 3.5rem;
  }
  
  .component-global-wrapper {
    padding-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

/* iOS Safari fixes */
@supports (-webkit-touch-callout: none) {
  .mobile-menu {
    height: -webkit-fill-available;
  }
}
</style>
