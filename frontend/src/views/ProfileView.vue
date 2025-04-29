<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FadeIn from '@/components/FadeIn.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { handleApiError } from '@/utils/errorHandler'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import FullPageError from '@/components/FullPageError.vue'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const router = useRouter()

const refreshTimestamp = ref(Date.now())
const error = ref<{ message: string; type: string } | null>(null);
const loading = ref(true);

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

    if (!response.ok) {
      throw new Error('Failed to check avatar status');
    }

    const data = await response.json()
    avatarAvailable.value = data.hasAvatar
  } catch (error) {
    console.error('Error checking avatar:', error)
    // Just log error, don't show to user - non-critical feature
  }
}

onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return;
  }
  
  try {
    await checkAvatar() // Check avatar on mount
    refreshTimestamp.value = Date.now() // Force refresh
  } catch (err) {
    console.error('Profile load error:', err);
    const processedError = handleApiError(err);
    error.value = {
      message: processedError.message,
      type: processedError.type
    };
  } finally {
    loading.value = false;
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
    if (!response.ok) {
      const data = await response.text();
      throw new Error(`Failed to delete account: ${data}`);
    }

    userStore.logout()
    router.push('/register')
  } catch (err) {
    console.error('Delete account error:', err)
    const processedError = handleApiError(err);
    error.value = {
      message: processedError.message,
      type: processedError.type
    };
  } finally {
    showDeleteConfirm.value = false
  }
}

const { t, locale } = useI18n() // Destructure locale as well

const formatDate = (dateString: string) => {
  // Use the current locale for date formatting
  return new Date(dateString).toLocaleDateString(locale.value, {
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
      // Use translation keys for roles
      return { text: t('profile.roleAdmin'), color: 'text-red-400' }
    default:
      // Use translation keys for roles
      return { text: t('profile.roleUser'), color: 'text-gray-400' }
  }
})

// Add API heartbeat check
const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()

// Add mouse move tracking for the header gradient effect
const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  
  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

</script>

<template>
  <!-- First check API heartbeat status -->
  <FullPageError
    v-if="!isApiAvailable && apiError"
    :message="apiError.message"
    :error-type="apiError.type"
    @retry="checkApiHeartbeat"
  />
  
  <!-- Then check for other errors -->
  <FullPageError
    v-else-if="error"
    :message="error.message"
    :error-type="error.type"
    @retry="checkAvatar"
  />
  
  <!-- Only render normal page when there's no error -->
  <div v-else class="profile-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <PageMain>
      <div class="w-full h-full overflow-auto px-2 sm:px-4 py-4">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>

        <!-- Error state with better component -->
        <ErrorDisplay
          v-else-if="error"
          :message="error.message"
          :error-type="error.type"
          @retry="checkAvatar"
        />
      
        <div v-else-if="userStore.user" class="space-y-8">
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
              <h3 class="text-white text-lg font-semibold mb-2">{{ t('profile.accountStatus') }}</h3>
              <p class="text-green-400">{{ t('profile.statusActive') }}</p>
            </div>
            <div class="bg-white/10 p-4 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/20 hover:shadow-xl">
              <h3 class="text-white text-lg font-semibold mb-2">{{ t('profile.memberSince') }}</h3>
              <p class="text-gray-300">{{ formatDate(userStore.user?.created_at || '') }}</p>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button
              @click="router.push('/edit-profile')"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {{ t('profile.editProfile') }}
            </button>
            <button
              @click="initiateDelete"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {{ t('profile.deleteAccount') }}
            </button>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
  <ConfirmDialog
    :show="showDeleteConfirm"
    :title="t('profile.confirmDeleteTitle')"
    :message="t('profile.confirmDeleteMessage')"
    :confirm-text="t('profile.deleteAccount')"
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

/* Add smooth scrolling */
.overflow-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overflow: auto !important;
  flex: 1;
  min-height: 200px;
}

/* Update background opacity to match other views */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Ensure consistent hover states */
.hover\:bg-white\/10:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Override PageMain height */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important; /* Contain overflow */
}

/* Set explicit sizing for view container */
.profile-view {
  padding-top: 0 !important;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: auto !important; /* Remove fixed height */
}
</style>
