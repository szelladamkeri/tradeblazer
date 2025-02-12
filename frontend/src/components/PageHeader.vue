<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

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
</script>

<template>
  <div class="w-full max-w-7xl mx-auto mb-4">
    <header class="w-full bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl">
      <div class="flex items-center justify-between p-4">
        <!-- Logo -->
        <div class="flex items-center">
          <font-awesome-icon icon="chart-line" class="text-green-400 text-2xl mr-2" />
          <span class="text-white font-bold text-xl">TradeBlazer</span>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="toggleMenu"
          class="sm:hidden p-2 text-white hover:text-green-400 transition-colors"
        >
          <font-awesome-icon :icon="isMenuOpen ? 'xmark' : 'bars'" class="text-xl" />
        </button>

        <!-- Desktop Navigation -->
        <nav class="hidden sm:flex items-center space-x-4">
          <HeaderLink>
            <template #icon>
              <font-awesome-icon icon="chart-line" class="mr-2" />
            </template>
            <template #heading>
              <router-link to="/" class="text-gray-300 hover:text-green-400">Dashboard</router-link>
            </template>
          </HeaderLink>

          <HeaderLink>
            <template #icon>
              <font-awesome-icon icon="chart-pie" class="mr-2" />
            </template>
            <template #heading>
              <router-link to="/markets" class="text-gray-300 hover:text-green-400"
                >Markets</router-link
              >
            </template>
          </HeaderLink>

          <template v-if="userStore.isAuthenticated">
            <HeaderLink>
              <template #icon>
                <font-awesome-icon icon="wallet" class="mr-2" />
              </template>
              <template #heading>
                <router-link to="/portfolio" class="text-gray-300 hover:text-green-400"
                  >Portfolio</router-link
                >
              </template>
            </HeaderLink>

            <HeaderLink>
              <template #icon>
                <font-awesome-icon icon="user-circle" class="mr-2" />
              </template>
              <template #heading>
                <router-link to="/profile" class="text-gray-300 hover:text-green-400"
                  >Profile</router-link
                >
              </template>
            </HeaderLink>

            <HeaderLink>
              <template #icon>
                <font-awesome-icon icon="right-from-bracket" class="mr-2" />
              </template>
              <template #heading>
                <button @click="handleSignOut" class="text-red-400 hover:text-red-300">
                  Logout
                </button>
              </template>
            </HeaderLink>
          </template>

          <template v-else>
            <HeaderLink>
              <template #icon>
                <font-awesome-icon icon="right-to-bracket" class="mr-2" />
              </template>
              <template #heading>
                <router-link to="/login" class="text-gray-300 hover:text-green-400"
                  >Login</router-link
                >
              </template>
            </HeaderLink>
          </template>
        </nav>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <div
      v-if="isMenuOpen"
      class="w-full bg-black/70 backdrop-blur-2xl backdrop-saturate-150 rounded-xl mt-2 p-4 shadow-lg"
    >
      <HeaderLink @click="closeMenu">
        <template #icon>
          <font-awesome-icon icon="chart-line" class="mr-2" />
        </template>
        <template #heading>
          <router-link to="/" class="text-gray-300 hover:text-green-400 block w-full">
            Dashboard
          </router-link>
        </template>
      </HeaderLink>

      <HeaderLink @click="closeMenu">
        <template #icon>
          <font-awesome-icon icon="chart-pie" class="mr-2" />
        </template>
        <template #heading>
          <router-link to="/markets" class="text-gray-300 hover:text-green-400 block w-full">
            Markets
          </router-link>
        </template>
      </HeaderLink>

      <HeaderLink @click="closeMenu">
        <template #icon>
          <font-awesome-icon icon="info" class="mr-2" />
        </template>
        <template #heading>
          <router-link to="/about" class="text-gray-300 hover:text-green-400 block w-full">
            About
          </router-link>
        </template>
      </HeaderLink>

      <template v-if="userStore.isAuthenticated">
        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="wallet" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/portfolio" class="text-gray-300 hover:text-green-400 block w-full">
              Portfolio
            </router-link>
          </template>
        </HeaderLink>

        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="user-circle" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/profile" class="text-gray-300 hover:text-green-400 block w-full">
              Profile
            </router-link>
          </template>
        </HeaderLink>

        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="right-from-bracket" class="mr-2" />
          </template>
          <template #heading>
            <button
              @click="handleSignOut"
              class="text-red-400 hover:text-red-300 block w-full text-left"
            >
              Logout
            </button>
          </template>
        </HeaderLink>
      </template>

      <template v-else>
        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="right-to-bracket" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/login" class="text-gray-300 hover:text-green-400 block w-full">
              Login
            </router-link>
          </template>
        </HeaderLink>
      </template>
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

/* Add consistent blur effect */
header,
.mobile-menu {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
}
</style>
