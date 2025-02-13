<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'

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

// Add new ref for avatar
const avatarAvailable = ref(false)

const checkAvatar = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/checkfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purpose: 'avatarCheck',
        username: userStore.user?.username,
      }),
    })

    const data = await response.json()
    avatarAvailable.value = data.hasAvatar
  } catch (error) {
    console.error('Error checking avatar:', error)
  }
}

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
    await checkAvatar()
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
      <!-- Main navbar container -->
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center shrink-0">
            <font-awesome-icon icon="chart-line" class="text-green-400 text-2xl mr-2" />
            <span class="text-white font-bold text-xl">TradeBlazer</span>
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
            <!-- Username on the left -->
            <div class="hidden sm:block">
              <span class="text-gray-300 mr-3">{{
                userStore.user?.displayName || userStore.user?.username
              }}</span>
            </div>

            <!-- Avatar button and dropdown container -->
            <div class="relative">
              <button
                @click="showProfileDropdown = !showProfileDropdown"
                class="w-8 h-8 rounded-full overflow-hidden bg-white/10 hover:ring-2 hover:ring-green-400/50 transition-all"
              >
                <img
                  v-if="avatarAvailable"
                  :src="'/src/assets/avatars/' + userStore.user?.username + '.jpg'"
                  class="w-full h-full object-cover"
                  alt="Profile"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-green-500">
                  <span class="text-white text-lg font-semibold">{{ firstLetter }}</span>
                </div>
              </button>

              <!-- Profile Dropdown -->
              <div
                v-show="showProfileDropdown"
                class="absolute right-0 top-full mt-2 w-48 py-2 bg-black/90 rounded-lg shadow-lg border border-white/10 z-[101]"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors"
                  @click="showProfileDropdown = false"
                >
                  <font-awesome-icon icon="user-circle" class="mr-2" />
                  Profile
                </router-link>
                <button
                  @click="handleSignOut"
                  class="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 transition-colors"
                >
                  <font-awesome-icon icon="right-from-bracket" class="mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-show="isMenuOpen"
        class="sm:hidden border-t border-white/10 overflow-hidden transition-all duration-200 ease-in-out"
      >
        <nav class="px-4 py-2 space-y-2">
          <HeaderLink @click="closeMenu">
            <template #icon>
              <router-link
                to="/"
                class="flex items-center p-2 w-full rounded hover:bg-white/5 transition-colors"
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
                class="flex items-center p-2 w-full rounded hover:bg-white/5 transition-colors"
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
                  class="flex items-center p-2 w-full rounded hover:bg-white/5 transition-colors"
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
                  class="flex items-center p-2 w-full rounded hover:bg-white/5 transition-colors"
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
                  class="flex items-center p-2 w-full rounded hover:bg-white/5 transition-colors"
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
                  class="flex items-center p-2 w-full rounded hover:bg-white/5 transition-colors"
                >
                  <font-awesome-icon icon="right-to-bracket" class="mr-2" />
                  <span>Login</span>
                </router-link>
              </template>
            </HeaderLink>
          </template>
        </nav>
      </div>
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
  @apply text-green-400 bg-white/5;
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
</style>
