<script setup lang="ts">
import HeaderLink from './HeaderLink.vue'
import '../assets/base.css'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleSignOut = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="flex w-full">
    <HeaderLink class="w-[45%] sm:w-auto text-center">
      <template #heading>
        <router-link to="/">Home</router-link>
      </template>
    </HeaderLink>

    <HeaderLink class="w-[45%] sm:w-auto text-center">
      <template #heading>
        <router-link to="/about">About</router-link>
      </template>
    </HeaderLink>

    <template v-if="userStore.isAuthenticated">
      <HeaderLink class="w-[45%] sm:w-auto text-center">
        <template #heading>
          <router-link to="/profile">Profile</router-link>
        </template>
      </HeaderLink>

      <HeaderLink class="w-[45%] sm:w-auto text-center">
        <template #heading>
          <button @click="handleSignOut" class="text-red-400 hover:text-red-300 transition-colors">
            Sign Out
          </button>
        </template>
      </HeaderLink>
    </template>

    <template v-else>
      <HeaderLink class="w-[45%] sm:w-auto text-center">
        <template #heading>
          <router-link to="/login">Login</router-link>
        </template>
      </HeaderLink>
    </template>
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
