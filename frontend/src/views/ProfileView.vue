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
    <HeaderLink class="w-[45%] sm:w-auto text-center">
      <template #icon></template>
      <template #heading>
        <router-link to="/">Home</router-link>
      </template>
    </HeaderLink>

    <HeaderLink class="w-[45%] sm:w-auto text-center">
      <template #icon></template>
      <template #heading>
        <router-link to="about">About</router-link>
      </template>
    </HeaderLink>
    <HeaderLink class="w-[45%] sm:w-auto text-center">
      <template #icon></template>
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
    <div class="w-full max-w-2xl mx-auto p-6 sm:p-8">
      <div v-if="userStore.user" class="space-y-8">
        <div class="text-center">
          <div
            class="w-24 h-24 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4"
          >
            <span class="text-3xl font-bold text-white">{{
              userStore.user.username[0].toUpperCase()
            }}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">
            {{ userStore.user.username }}
          </h2>
          <p class="text-gray-400">{{ userStore.user.email }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="text-white text-lg font-semibold mb-2">Account Status</h3>
            <p class="text-green-400">Active</p>
          </div>
          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="text-white text-lg font-semibold mb-2">Member Since</h3>
            <p class="text-gray-300">{{ new Date().toLocaleDateString() }}</p>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button
            @click="router.push('/edit-profile')"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  </PageMain>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
