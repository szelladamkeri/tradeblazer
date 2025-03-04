<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FadeIn from '@/components/FadeIn.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const userStore = useUserStore()
const router = useRouter()

const refreshTimestamp = ref(Date.now())

const checkAvatar = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/checkfile', {  // Updated endpoint path
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
    avatarAvailable.value = false
  }
}

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
  } else {
    await checkAvatar() // Check avatar on mount
    refreshTimestamp.value = Date.now() // Force refresh
  }
})
const avatarAvailable = ref(false)

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

// Get first letter function
const firstLetter = computed(() => {
  return userStore.user?.username.charAt(0).toUpperCase() || '?'
})

// User role display
const userRoleDisplay = computed(() => {
  switch (userStore.user?.type) {
    case 'A':
      return { text: 'Administrator', color: 'text-red-400' }
    default:
      return { text: 'User', color: 'text-gray-400' }
  }
})
</script>

<template>
  <PageHeader class="mb-4" />
  <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto">
    <FadeIn>
      <div class="w-full max-w-2xl mx-auto p-6 sm:p-8">
        <div v-if="userStore.user" class="space-y-8">
          <div class="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div class="w-24 h-24 rounded-full overflow-hidden bg-white/10">
              <img
                v-if="avatarAvailable"
                :src="`http://localhost:3000/uploads/avatars/${userStore.user?.username}.jpg?t=${refreshTimestamp}`"
                class="w-full h-full object-cover"
                :key="refreshTimestamp"
                alt="User avatar"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-green-500">
                <span class="text-white text-3xl font-semibold">{{ firstLetter }}</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">
                {{ userStore.user.displayName || userStore.user.username }}
              </h2>
              <div class="flex flex-col gap-1">
                <p class="text-gray-400">
                  <span class="text-gray-500">@</span>{{ userStore.user.username }}
                </p>
                <div class="flex items-center gap-2">
                  <p class="text-gray-400">{{ userStore.user.email }}</p>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs bg-white/10"
                    :class="userRoleDisplay.color"
                  >
                    {{ userRoleDisplay.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
              <h3 class="text-white text-lg font-semibold mb-2">Account Status</h3>
              <p class="text-green-400">Active</p>
            </div>
            <div class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
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
    confirm-text="Delete Account"
    confirm-button-class="bg-red-600 hover:bg-red-700"
    type="delete"
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

/* Remove duplicate page-header styles as they're now handled by the PageHeader component */
/*
.page-header {
  height: 4rem;
  width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto;
  margin-bottom: 1rem !important;
}

@media (max-width: 1400px) {
  .page-header {
    width: 95vw !important;
    max-width: 1366px !important;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 90vw !important;
    max-width: 1024px !important;
  }
}

@media (max-width: 640px) {
  .page-header {
    height: 3.5rem;
    width: calc(100vw - 2rem) !important;
  }
}
*/
</style>
