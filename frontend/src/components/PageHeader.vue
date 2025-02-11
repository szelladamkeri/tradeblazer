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
  <header
    class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl p-2 sm:p-4 mx-auto mb-2"
  >
    <div class="flex items-center justify-between">
      <!-- Logo or Brand -->
      <div class="text-white font-bold text-xl">TradeBlazer</div>

      <!-- Mobile menu button -->
      <button
        @click="toggleMenu"
        class="sm:hidden p-2 text-white hover:text-green-400 transition-colors"
      >
        <font-awesome-icon :icon="isMenuOpen ? 'times' : 'bars'" />
      </button>

      <!-- Desktop Navigation -->
      <nav class="hidden sm:flex items-center space-x-4">
        <HeaderLink>
          <template #icon>
            <font-awesome-icon icon="home" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/">Home</router-link>
          </template>
        </HeaderLink>

        <HeaderLink>
          <template #icon>
            <font-awesome-icon icon="info" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/about">About</router-link>
          </template>
        </HeaderLink>

        <template v-if="userStore.isAuthenticated">
          <HeaderLink>
            <template #icon>
              <font-awesome-icon icon="user" class="mr-2" />
            </template>
            <template #heading>
              <router-link to="/profile">Profile</router-link>
            </template>
          </HeaderLink>

          <HeaderLink>
            <template #icon>
              <font-awesome-icon icon="sign-out-alt" class="mr-2" />
            </template>
            <template #heading>
              <button
                @click="handleSignOut"
                class="text-red-400 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </template>
          </HeaderLink>
        </template>

        <template v-else>
          <HeaderLink>
            <template #icon>
              <font-awesome-icon icon="sign-in-alt" class="mr-2" />
            </template>
            <template #heading>
              <router-link to="/login">Login</router-link>
            </template>
          </HeaderLink>
        </template>
      </nav>
    </div>

    <!-- Mobile Navigation -->
    <nav
      v-show="isMenuOpen"
      class="sm:hidden mt-4 space-y-2 transition-all duration-300"
      :class="{ 'opacity-100 translate-y-0': isMenuOpen, 'opacity-0 -translate-y-4': !isMenuOpen }"
    >
      <HeaderLink @click="closeMenu">
        <template #icon>
          <font-awesome-icon icon="home" class="mr-2" />
        </template>
        <template #heading>
          <router-link to="/">Home</router-link>
        </template>
      </HeaderLink>

      <HeaderLink @click="closeMenu">
        <template #icon>
          <font-awesome-icon icon="info" class="mr-2" />
        </template>
        <template #heading>
          <router-link to="/about">About</router-link>
        </template>
      </HeaderLink>

      <template v-if="userStore.isAuthenticated">
        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="user" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/profile">Profile</router-link>
          </template>
        </HeaderLink>

        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="sign-out-alt" class="mr-2" />
          </template>
          <template #heading>
            <button
              @click="handleSignOut"
              class="text-red-400 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </template>
        </HeaderLink>
      </template>

      <template v-else>
        <HeaderLink @click="closeMenu">
          <template #icon>
            <font-awesome-icon icon="sign-in-alt" class="mr-2" />
          </template>
          <template #heading>
            <router-link to="/login">Login</router-link>
          </template>
        </HeaderLink>
      </template>
    </nav>
  </header>
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
</style>
