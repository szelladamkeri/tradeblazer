<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FadeIn from '@/components/FadeIn.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
  }
})

const showDeleteConfirm = ref(false)

const initiateDelete = () => {
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userStore.user?.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete account')

    userStore.logout()
    router.push('/register')
  } catch (err) {
    console.error('Delete account error:', err)
  } finally {
    showDeleteConfirm.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <PageHeader />
  <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto">
    <FadeIn>
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
              <p class="text-gray-300">{{ formatDate(userStore.user?.created_at || '') }}</p>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button
              @click="router.push('/edit-profile')"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Profile
            </button>
            <button
              @click="initiateDelete"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  </PageMain>
  <ConfirmDialog
    :show="showDeleteConfirm"
    title="Delete Account"
    message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
    @confirm="handleDeleteConfirm"
    @cancel="showDeleteConfirm = false"
  />
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
