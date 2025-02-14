<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

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

onMounted(async () => {
  if (userStore.isAuthenticated) {
    await userStore.checkAvatar()
  }
  window.addEventListener('resize', updateMenuOnResize)
  document.addEventListener('click', closeDropdownOnClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMenuOnResize)
  document.removeEventListener('click', closeDropdownOnClickOutside)
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto mb-2">
    <header
      class="w-full bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl relative z-[100]"
    >
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

          <!-- Mobile menu button -->
          <button
            @click="toggleMenu"
            class="sm:hidden p-2 text-white hover:text-green-400 transition-colors"
            aria-label="Toggle menu"
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
                  :src="
                    '/src/assets/avatars/' + userStore.user?.username + '.jpg?t=' + avatarTimestamp
                  "
                  :key="avatarTimestamp"
                  class="w-full h-full object-cover pointer-events-none"
                  alt="Profile"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-white/10 pointer-events-none"
                >
                  <span class="text-green-400 text-lg font-semibold">{{ firstLetter }}</span>
                </div>
              </button>

              <!-- Profile Dropdown -->
              <Transition name="scale">
                <div
                  v-show="showProfileDropdown"
                  class="absolute right-0 top-[calc(100%+0.5rem)] w-48 py-2 bg-black/90 rounded-lg shadow-lg border border-white/10 z-[101] backdrop-blur-xl backdrop-saturate-150"
                >
                  <!-- Connecting triangle -->
                  <div
                    class="absolute -top-2 right-2 w-3 h-3 bg-black/90 border-t border-l border-white/10 transform rotate-45"
                  ></div>

                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-gray-300 hover:text-green-400 transition-colors router-link relative z-[102]"
                    @click="showProfileDropdown = false"
                    active-class="text-green-400"
                  >
                    <font-awesome-icon icon="user-circle" class="mr-2" />
                    Profile
                  </router-link>
                  <div class="w-full h-px bg-white/10 my-1"></div>
                  <button
                    @click="handleSignOut"
                    class="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 transition-colors relative z-[102]"
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

      <!-- Mobile Navigation -->
      <Transition name="slide">
        <div
          v-show="isMenuOpen"
          class="sm:hidden absolute top-full left-0 w-full bg-black/90 border-t border-white/10 transition-all duration-200 ease-in-out"
        >
          <nav class="px-4 py-2 space-y-2 overflow-y-auto max-h-[calc(100vh-60px)]">
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
      </Transition>
    </header>
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
  min-width: min-content;
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
.z-\[100\] {
  z-index: 100;
}

.z-\[101\] {
  z-index: 101;
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
</style>
