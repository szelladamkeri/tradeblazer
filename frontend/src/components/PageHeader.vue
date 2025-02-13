<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

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

onMounted(() => {
  window.addEventListener('resize', updateMenuOnResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMenuOnResize)
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto mb-2">
    <header class="w-full bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl">
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
            <font-awesome-icon :icon="isMenuOpen ? 'xmark' : 'bars'" class="text-xl" />
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

              <HeaderLink>
                <template #icon>
                  <router-link
                    to="/profile"
                    class="text-gray-300 hover:text-green-400 flex items-center"
                  >
                    <font-awesome-icon icon="user-circle" class="mr-2" />
                    <span>Profile</span>
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

              <HeaderLink>
                <template #icon>
                  <button
                    @click="handleSignOut"
                    class="text-red-400 hover:text-red-300 flex items-center group"
                  >
                    <font-awesome-icon
                      icon="right-from-bracket"
                      class="mr-2 group-hover:text-red-300"
                    />
                    <span class="group-hover:text-red-300">Logout</span>
                  </button>
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

            <HeaderLink @click="closeMenu">
              <template #icon>
                <button
                  @click="handleSignOut"
                  class="flex items-center p-2 w-full rounded text-red-400 hover:bg-white/5 transition-colors text-left"
                >
                  <font-awesome-icon icon="right-from-bracket" class="mr-2" />
                  <span>Logout</span>
                </button>
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
header,
div[class*='bg-black'] {
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
</style>
