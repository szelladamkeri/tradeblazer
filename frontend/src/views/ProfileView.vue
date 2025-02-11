<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<template>
  <PageHeader
    class="w-full flex flex-wrap h-16 bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center sm:justify-around max-w-7xl p-2 sm:p-4 mx-2 sm:mx-8 mb-2 gap-2"
  >
    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="/">Home</router-link>
      </template>
    </HeaderLink>

    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="about">About</router-link>
      </template>
    </HeaderLink>
    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="profile">Profile</router-link>
      </template>
    </HeaderLink>

    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="login">Login</router-link>
      </template>
    </HeaderLink>
    <!-- valami ami kiszedi a routeekbol a navbart erdemlo vieweket es ide berakna automatikusan -->
  </PageHeader>
  <PageMain
    class="w-full flex flex-col h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-start max-w-7xl mx-2 sm:mx-8 overflow-hidden"
  >
    <div class="w-full max-w-7xl mx-auto p-8 md:p-12 lg:p-16 xl:p-16">
      <div v-if="userStore.user" class="space-y-6">
        <h2 class="text-2xl font-bold text-white">Welcome, {{ userStore.user.username }}!</h2>
        <div class="bg-white bg-opacity-10 rounded-lg p-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-400">Email:</span>
              <span class="text-white">{{ userStore.user.email }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400">User ID:</span>
              <span class="text-white">#{{ userStore.user.id }}</span>
            </div>
          </div>
        </div>
        <button
          @click="userStore.logout"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </PageMain>
</template>

<style scoped>
/* @media (min-width: 1024px) {
    .about {
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
} */
</style>
