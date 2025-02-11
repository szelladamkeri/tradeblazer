<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
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
  />

  <PageMain
    class="w-full flex flex-col h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-start max-w-7xl mx-2 sm:mx-8 overflow-hidden"
  >
    <div class="w-full max-w-3xl mx-auto p-6 sm:p-8">
      <div v-if="userStore.user" class="space-y-8">
        <!-- Profile Header -->
        <div class="text-center sm:text-left">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {{ userStore.user.username }}!
          </h2>
          <p class="text-gray-400">Manage your account and view your trading activity</p>
        </div>

        <!-- User Information Card -->
        <div class="bg-white bg-opacity-10 rounded-xl p-6 space-y-6">
          <h3 class="text-xl font-semibold text-white mb-4">Account Information</h3>

          <div class="space-y-4">
            <div
              class="flex flex-col sm:flex-row justify-between p-3 bg-white bg-opacity-5 rounded-lg"
            >
              <span class="text-gray-400">Username</span>
              <span class="text-white font-medium">{{ userStore.user.username }}</span>
            </div>

            <div
              class="flex flex-col sm:flex-row justify-between p-3 bg-white bg-opacity-5 rounded-lg"
            >
              <span class="text-gray-400">Email</span>
              <span class="text-white font-medium">{{ userStore.user.email }}</span>
            </div>

            <div
              class="flex flex-col sm:flex-row justify-between p-3 bg-white bg-opacity-5 rounded-lg"
            >
              <span class="text-gray-400">Account ID</span>
              <span class="text-white font-medium">#{{ userStore.user.id }}</span>
            </div>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="flex justify-end">
          <button
            @click="router.push('/edit-profile')"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center py-8">
        <p class="text-gray-400">Loading profile information...</p>
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
