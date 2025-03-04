<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const userStore = useUserStore()
const router = useRouter()
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

  try {
    const response = await fetch(`http://localhost:3000/api/assets/search?q=${encodeURIComponent(searchQuery.value)}`)
    if (!response.ok) throw new Error('Search failed')
    const data = await response.json()
    searchResults.value = data.slice(0, 5) // Limit to 5 results for better UX
  } catch (err) {
    searchError.value = 'Failed to perform search'
    console.error(err)
  } finally {
    searchLoading.value = false
  }
}

// Debounce search for better performance
let searchTimeout: any = null
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  if (searchQuery.value.length >= 2) {
    searchTimeout = setTimeout(() => {
      performSearch()
      showSearchResults.value = true
    }, 300)
  } else {
    searchResults.value = []
    showSearchResults.value = false
  }
})

const closeSearchResults = () => {
  showSearchResults.value = false
}

const goToAsset = (assetId: number) => {
  router.push(`/markets/${assetId}`)
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

onMounted(async () => {
  if (userStore.isAuthenticated) {
    await userStore.checkAvatar()
  }
  window.addEventListener('resize', updateMenuOnResize)
  document.addEventListener('click', closeDropdownOnClickOutside)
  document.addEventListener('click', closeSearchResultsOnClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMenuOnResize)
  document.removeEventListener('click', closeDropdownOnClickOutside)
  document.removeEventListener('click', closeSearchResultsOnClickOutside)
})
</script>

<template>
  <div class="component-global-wrapper">
    <div class="page-header-wrapper">
      <div class="page-header">
        <header class="w-full bg-black/70 rounded-xl relative z-[50]">
          <div class="px-2 sm:px-4 py-3">
            <!-- Adjusted padding -->
            <div class="flex items-center justify-between gap-2">
              <!-- Added gap -->
              <!-- Logo - made more compact on mobile -->
              <div class="flex items-center shrink-0">
                <font-awesome-icon
                  icon="chart-line"
                  class="text-xl sm:text-2xl text-green-400 mr-1.5 sm:mr-2"
                />
                <span class="text-white font-bold text-lg sm:text-xl">TradeBlazer</span>
              </div>

              <!-- Search Bar - Centered and optimized -->
              <div 
                ref="searchContainerRef" 
                class="relative flex-1 mx-3 md:mx-8 max-w-md hidden sm:block"
              >
                <div class="relative group">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search assets..."
                    class="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all duration-200 group-hover:bg-white/15"
                  />
                  <div 
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center"
                  >
                    <font-awesome-icon
                      v-if="searchLoading"
                      icon="spinner"
                      class="text-gray-400 animate-spin"
                    />
                    <font-awesome-icon
                      v-else-if="searchQuery && searchQuery.length > 0"
                      @click="searchQuery = ''"
                      icon="times-circle"
                      class="text-gray-400 cursor-pointer hover:text-white"
                    />
                    <font-awesome-icon
                      v-else
                      icon="search"
                      class="text-gray-400"
                    />
                  </div>
                </div>

                <!-- Search Results Dropdown -->
                <transition 
                  name="fade"
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-1"
                >
                  <div
                    v-show="showSearchResults && (searchResults.length > 0 || searchLoading || searchError)"
                    class="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl backdrop-saturate-150 rounded-lg border border-white/10 shadow-lg max-h-96 overflow-y-auto z-[60]"
                  >
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
                      <div
                        v-for="result in searchResults"
                        :key="result.id"
                        @click="goToAsset(result.id)"
                        class="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer group"
                      >
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
                            <font-awesome-icon icon="arrow-right" class="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>

                      <!-- View all results link -->
                      <div v-if="searchResults.length > 0" class="mt-1 pt-2 border-t border-white/10 px-4 py-2 text-center">
                        <a 
                          @click="closeSearchResults"
                          href="#" 
                          class="text-green-400 hover:text-green-300 text-sm transition-colors"
                        >
                          <font-awesome-icon icon="list" class="mr-1" />
                          View all results
                        </a>
                      </div>
                    </div>

                    <!-- No results -->
                    <div v-if="searchResults.length === 0 && !searchLoading && !searchError" class="py-6 px-4 text-center">
                      <font-awesome-icon icon="search" class="text-gray-400 text-xl mb-2" />
                      <p class="text-gray-400">No results found</p>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Mobile menu button - Improved styling and accessibility -->
              <button
                @click="toggleMenu"
                class="sm:hidden p-2 text-white hover:text-green-400 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50"
                aria-label="Toggle menu"
                :aria-expanded="isMenuOpen"
              >
                <font-awesome-icon :icon="isMenuOpen ? 'xmark' : 'bars'" class="text-2xl" />
              </button>

              <!-- Desktop Navigation -->
              <nav class="hidden sm:flex items-center gap-1 flex-nowrap min-w-0 overflow-x-auto">
                <!-- Changed space-x-4 to space-x-2 for tighter spacing -->
                <HeaderLink>
                  <template #icon>
                    <router-link to="/" class="text-gray-300 hover:text-green-400 flex items-center">
                      <font-awesome-icon icon="chart-line" class="mr-2" />
                      <span>Dashboard</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <HeaderLink>
                  <template #icon>
                    <router-link
                      to="/markets"
                      class="text-gray-300 hover:text-green-400 flex items-center"
                    >
                      <font-awesome-icon icon="chart-pie" class="mr-2" />
                      <span>Markets</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <template v-if="userStore.isAuthenticated">
                  <HeaderLink>
                    <template #icon>
                      <router-link
                        to="/portfolio"
                        class="text-gray-300 hover:text-green-400 flex items-center"
                      >
                        <font-awesome-icon icon="wallet" class="mr-2" />
                        <span>Portfolio</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <HeaderLink v-if="userStore.isAdmin">
                    <template #icon>
                      <router-link
                        to="/admin"
                        class="text-gray-300 hover:text-green-400 flex items-center"
                      >
                        <font-awesome-icon icon="shield" class="mr-2" />
                        <span>Admin</span>
                      </router-link>
                    </template>
                  </HeaderLink>
                </template>

                <template v-else>
                  <HeaderLink>
                    <template #icon>
                      <router-link
                        to="/login"
                        class="text-gray-300 hover:text-green-400 flex items-center"
                      >
                        <font-awesome-icon icon="right-to-bracket" class="mr-2" />
                        <span>Login</span>
                      </router-link>
                    </template>
                  </HeaderLink>
                </template>
              </nav>

              <!-- User Profile Section -->
              <div
                v-if="userStore.isAuthenticated"
                class="relative flex items-center"
                ref="dropdownRef"
              >
                <!-- Replace displayName with username -->
                <div class="hidden sm:block">
                  <span
                    :class="[
                      'mr-3 transition-colors',
                      $route.path === '/profile' ? 'text-green-400' : 'text-gray-300',
                    ]"
                  >
                    {{ userStore.user?.username }}
                  </span>
                </div>

                <!-- Avatar button and dropdown container -->
                <div class="relative">
                  <button
                    @click="showProfileDropdown = !showProfileDropdown"
                    :class="[
                      'w-8 h-8 rounded-full overflow-hidden transition-all relative z-[102] flex items-center justify-center cursor-pointer',
                      $route.path === '/profile'
                        ? 'bg-green-500/20 ring-2 ring-green-400/50'
                        : 'bg-white/10 hover:ring-2 hover:ring-green-400/50',
                    ]"
                  >
                    <img
                      v-if="avatarAvailable"
                      :src="`http://localhost:3000/uploads/avatars/${userStore.user?.username}.jpg?t=${avatarTimestamp}`"
                      :key="avatarTimestamp"
                      class="w-full h-full object-cover pointer-events-none"
                      alt="Profile"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-green-500">
                      <span class="text-white text-sm font-medium">{{ firstLetter }}</span>
                    </div>
                  </button>

                  <!-- Profile Dropdown -->
                  <Transition name="scale">
                    <div
                      v-show="showProfileDropdown"
                      class="absolute right-0 top-[calc(100%+0.5rem)] w-48 py-2 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-lg border border-white/10 z-[201]"
                    >
                      <!-- Connecting triangle -->
                      <div
                        class="absolute -top-2 right-2 w-3 h-3 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 border-t border-l border-white/10 transform rotate-45"
                      ></div>

                      <router-link
                        to="/profile"
                        class="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-green-400 transition-all duration-200 relative z-[102]"
                        @click="showProfileDropdown = false"
                        active-class="text-green-400 bg-white/5"
                      >
                        <font-awesome-icon icon="user-circle" class="mr-2" />
                        Profile
                      </router-link>
                      <div class="w-full h-px bg-white/10 my-1"></div>
                      <button
                        @click="handleSignOut"
                        class="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 hover:text-red-300 transition-all duration-200 relative z-[102]"
                      >
                        <font-awesome-icon icon="right-from-bracket" class="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Mobile menu content - Improved styling and transitions -->
          <transition
            name="mobile-menu"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <div v-if="isMenuOpen" class="sm:hidden fixed inset-x-0 top-[3.5rem] pb-4 bg-black/95 backdrop-blur-md border-b border-white/10 z-[70] max-h-[80vh] overflow-y-auto">
              <div class="mb-4 px-3 pt-3">
                <!-- Improved mobile search -->
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search assets..."
                    class="w-full px-3 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all duration-200"
                  />
                  <div 
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center"
                  >
                    <font-awesome-icon
                      v-if="searchLoading"
                      icon="spinner"
                      class="text-gray-400 animate-spin"
                    />
                    <font-awesome-icon
                      v-else-if="searchQuery && searchQuery.length > 0"
                      @click="searchQuery = ''"
                      icon="times-circle"
                      class="text-gray-400 cursor-pointer hover:text-white"
                    />
                    <font-awesome-icon
                      v-else
                      icon="search"
                      class="text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <!-- Mobile search results - Improved positioning -->
              <transition 
                name="fade"
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <div
                  v-show="showSearchResults && (searchResults.length > 0 || searchLoading || searchError)"
                  class="border-t border-white/10 shadow-lg overflow-y-auto mx-2 mb-3"
                >
                  <!-- Loading State -->
                  <div v-if="searchLoading" class="py-4 px-4 text-center">
                    <LoadingSpinner class="h-6 w-6 mx-auto" />
                    <p class="mt-2 text-gray-400">Searching...</p>
                  </div>

                  <!-- Error State -->
                  <div v-else-if="searchError" class="py-4 px-4 text-center">
                    <p class="text-red-400">{{ searchError }}</p>
                  </div>

                  <!-- Results -->
                  <div v-else>
                    <div
                      v-for="result in searchResults"
                      :key="result.id"
                      @click="goToAsset(result.id)"
                      class="p-3 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10 last:border-b-0"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="font-medium text-white">{{ result.symbol }}</div>
                          <div class="text-sm text-gray-400 truncate max-w-[200px]">{{ result.name }}</div>
                        </div>
                        <div class="text-green-400 font-medium">
                          ${{ result.price }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- No results -->
                  <div v-if="searchResults.length === 0 && !searchLoading && !searchError" class="py-4 px-4 text-center">
                    <p class="text-gray-400">No results found</p>
                  </div>
                </div>
              </transition>

              <!-- Improved mobile navigation menu with better spacing -->
              <nav class="flex flex-col gap-2 px-3">
                <HeaderLink @click="closeMenu">
                  <template #icon>
                    <router-link
                      to="/"
                      class="flex items-center p-2 w-full rounded hover:text-green-400 transition-colors"
                    >
                      <font-awesome-icon icon="chart-line" class="mr-2" />
                      <span>Dashboard</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <HeaderLink @click="closeMenu">
                  <template #icon>
                    <router-link
                      to="/markets"
                      class="flex items-center p-2 w-full rounded hover:text-green-400 transition-colors"
                    >
                      <font-awesome-icon icon="chart-pie" class="mr-2" />
                      <span>Markets</span>
                    </router-link>
                  </template>
                </HeaderLink>

                <template v-if="userStore.isAuthenticated">
                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link
                        to="/portfolio"
                        class="flex items-center p-2 w-full rounded hover:text-green-400 transition-colors"
                      >
                        <font-awesome-icon icon="wallet" class="mr-2" />
                        <span>Portfolio</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link
                        to="/profile"
                        class="flex items-center p-2 w-full rounded hover:text-green-400 transition-colors"
                      >
                        <font-awesome-icon icon="user-circle" class="mr-2" />
                        <span>Profile</span>
                      </router-link>
                    </template>
                  </HeaderLink>

                  <HeaderLink v-if="userStore.isAdmin" @click="closeMenu">
                    <template #icon>
                      <router-link
                        to="/admin"
                        class="flex items-center p-2 w-full rounded hover:text-green-400 transition-colors"
                      >
                        <font-awesome-icon icon="shield" class="mr-2" />
                        <span>Admin</span>
                      </router-link>
                    </template>
                  </HeaderLink>
                </template>

                <template v-else>
                  <HeaderLink @click="closeMenu">
                    <template #icon>
                      <router-link
                        to="/login"
                        class="flex items-center p-2 w-full rounded hover:text-green-400 transition-colors"
                      >
                        <font-awesome-icon icon="right-to-bracket" class="mr-2" />
                        <span>Login</span>
                      </router-link>
                    </template>
                  </HeaderLink>
                </template>
              </nav>
            </div>
          </transition>
        </header>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}

.router-link-active {
  @apply text-green-400;
}

/* Add proper backdrop filter */
header {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  min-width: unset;
  width: 100%;
}

nav {
  flex-shrink: 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

nav::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Adjust breakpoint for mobile menu */
@media (max-width: 1024px) {
  .sm\:hidden {
    display: block;
  }
  .sm\:flex {
    display: none;
  }
}

@media (min-width: 1025px) {
  .sm\:hidden {
    display: none;
  }
  .sm\:flex {
    display: flex;
  }
}

/* Keep nav items from shrinking */
:deep(.header-link) {
  flex: 0 0 auto;
  white-space: nowrap;
}

/* Match PageMain blur effect */
header {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  background-color: rgba(0, 0, 0, 0.7);
}

/* Ensure nav items don't shrink */
nav {
  flex-shrink: 0;
}

/* Make nav links more compact on smaller screens */
@media (max-width: 768px) {
  nav {
    font-size: 0.875rem;
  }
}

/* Ensure HeaderLink components don't shrink */
:deep(.header-link) {
  flex-shrink: 0;
  white-space: nowrap;
}

/* Add z-index for dropdown */
.z-50 {
  z-index: 50;
}

/* Update z-index classes */
.z-\[50\] {
  z-index: 50;
}

.z-\[51\] {
  z-index: 51;
}

/* Profile dropdown should be higher than header */
.absolute.right-0 {
  z-index: 52;
}

/* Remove any lower z-index values that might conflict */
.z-\[100\],
.z-\[101\],
.z-\[102\] {
  z-index: unset;
}

/* Add background color for .bg-black */
.bg-black {
  background-color: #000000;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Remove hover backgrounds and only keep text color changes */
router-link:hover,
button:hover {
  @apply text-green-400;
  background: none;
}

/* Update dropdown menu items to only change text color on hover */
:deep(.dropdown-item:hover) {
  @apply text-green-400;
  background: none;
}

/* Remove any remaining hover:bg classes */
[class*='hover:bg'] {
  @apply hover:bg-transparent;
}

/* Update hover behaviors */
.router-link-active {
  @apply text-green-400;
}

/* Remove hover backgrounds and only keep text color changes */
:deep(a),
:deep(button) {
  @apply hover:bg-transparent transition-colors;
}

/* Ensure mobile menu items follow the same pattern */
.mobile-nav-item {
  @apply hover:bg-transparent;
}

/* Override any remaining hover:bg classes */
[class*='hover:bg'] {
  @apply hover:bg-transparent !important;
}

/* Keep text color transitions */
.text-gray-300 {
  @apply hover:text-green-400 transition-colors;
}

.text-red-400 {
  @apply hover:text-red-300 transition-colors;
}

/* Update router-link-active for profile dropdown */
.router-link.router-link-active {
  @apply bg-green-500/10 text-green-400;
}

/* Remove the general background removal for this specific case */
.router-link.router-link-active:hover {
  @apply bg-green-500/10;
}

/* Update dropdown styling */
.router-link,
button {
  @apply relative hover:bg-white/5 transition-all duration-200;
}

/* Remove conflicting hover styles */
[class*='hover:bg'] {
  @apply hover:bg-white/5 !important;
}

/* Override any remaining hover:bg-transparent rules */
.mobile-nav-item,
:deep(a),
:deep(button) {
  @apply hover:bg-white/5;
}

/* Keep the router-link-active styling */
.router-link.router-link-active {
  @apply bg-green-500/10 text-green-400;
}

/* Allow background change on hover for active route */
.router-link.router-link-active:hover {
  @apply bg-green-500/20;
}

/* Add these styles for better avatar centering */
button img,
button div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.text-lg {
  line-height: 1;
}

/* Add these new styles */
button {
  cursor: pointer;
}

.pointer-events-none {
  pointer-events: none;
}

/* Add smooth hover transitions */
.router-link,
button {
  @apply transition-all duration-200 ease-out;
}

/* Add hover scale effect to active elements */
.router-link:hover,
button:hover {
  transform: translateY(-1px);
}

/* Add bounce animation for notifications or updates */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* Update slide animation to be faster */
.slide-enter-active,
.slide-leave-active {
  transition: all 150ms ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-1rem);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Add scale transition for dropdown */
.scale-enter-active,
.scale-leave-active {
  transition: all 150ms ease-out;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.scale-enter-to,
.scale-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Add styling for search dropdown */
.max-h-96 {
  max-height: 24rem;
}

/* Ensure the search results scroll properly */
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

/* Improve search dropdown styling */
.max-h-96 {
  max-height: 24rem;
}

.max-h-64 {
  max-height: 16rem;
}

/* Enhance scrollbar styling */
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

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Add subtle hover effect to search input */
input[type="text"]:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Update header container styles */
header {
  width: 100%;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  background-color: rgba(0, 0, 0, 0.4);
}

@media (max-width: 640px) {
  header {
    height: 3.5rem;
  }
}

/* Add consistent width styling for the header wrapper that exactly matches PageMain */
.page-header {
  width: 1366px !important;
  min-width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto !important;
}

@media (max-width: 1400px) {
  .page-header {
    width: 95vw !important;
    min-width: auto !important;
    max-width: 1366px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 95vw !important;
    min-width: auto !important;
    max-width: 1024px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

/* REMOVE ALL PREVIOUS MOBILE MEDIA QUERIES AND REPLACE WITH THIS SINGLE ONE */
@media (max-width: 640px) {
  /* Add explicit margin to the wrapper itself */
  .page-header-wrapper {
    width: 100%;
    padding: 0 !important;
    display: flex;
    justify-content: center;
    margin-top: 0;
    margin-bottom: 1rem !important; /* Explicit 1rem bottom margin = Tailwind's mb-4 */
  }
  
  .page-header {
    width: calc(100vw - 2rem) !important;
    min-width: auto !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    padding: 0 !important;
  }
  
  header {
    height: 3.5rem;
    border-radius: 0.75rem;
    width: 100% !important;
  }
  
  /* Mobile menu styling */
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: all 0.3s ease;
  }
  
  .mobile-menu-enter-from,
  .mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
  
  /* Better tap targets */
  button[aria-label="Toggle menu"] {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Mobile search experience */
  input[type="text"], 
  input[type="search"] {
    font-size: 16px;
    height: 48px;
  }
  
  /* Fixed menu */
  .fixed.inset-x-0 {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Menu item spacing */
  nav.flex.flex-col.gap-2 > * {
    margin-bottom: 0.25rem;
  }
  
  /* Nav items */
  .mobile-nav-item,
  nav a,
  nav button {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
  }
  
  /* iOS safe areas if needed */
  @supports (padding: max(0px)) {
    .page-header-wrapper {
      padding-left: max(0, env(safe-area-inset-left));
      padding-right: max(0, env(safe-area-inset-right));
    }
  }
}

/* REMOVE ALL OTHER MOBILE MEDIA QUERIES */

/* Tablet-specific fixes for asymmetric margins */
@media (min-width: 641px) and (max-width: 1024px) {
  .page-header-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 0 !important;
  }
  
  .page-header {
    margin-left: auto !important;
    margin-right: auto !important;
    width: 95vw !important;
  }
}

/* Match the border radius to be consistent with PageMain */
header {
  border-radius: 0.75rem;
  width: 100%;
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  background-color: rgba(0, 0, 0, 0.7);
}

/* Better mobile menu styling */
@media (max-width: 640px) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: all 0.3s ease;
    transform-origin: top;
  }
  
  .mobile-menu-enter-from,
  .mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Consistent focus states */
input:focus {
  border-color: #22c55e !important; /* green-500 */
  --tw-ring-color: rgba(34, 197, 94, 0.5) !important; /* green-500 with opacity */
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  outline: none;
}

/* Global wrapper class to match PageMain exactly */
.component-global-wrapper {
  width: 100% !important; 
  display: flex !important;
  justify-content: center !important;
  padding: 0 !important;
  margin-bottom: 1rem !important; /* MB-4 equivalent */
  box-sizing: border-box !important;
}

/* Improved tablet-specific styles with highest specificity for consistent centering */
@media (min-width: 641px) and (max-width: 1024px) {
  .component-global-wrapper {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    padding: 0 1rem !important;
    box-sizing: border-box !important;
  }
  
  .component-global-wrapper .page-header {
    width: 100% !important;
    max-width: 95vw !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

/* Additional breakpoint to handle the transition better */
@media (min-width: 768px) and (max-width: 1024px) {
  .component-global-wrapper .page-header {
    max-width: 90vw !important;
  }
}
</style>
