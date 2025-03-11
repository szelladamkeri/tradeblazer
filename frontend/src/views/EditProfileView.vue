<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { validateEmail } from '@/utils/validation'
import { hasChanges } from '@/utils/validation'
import FadeIn from '@/components/FadeIn.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { handleApiError } from '@/utils/errorHandler'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import FullPageError from '@/components/FullPageError.vue'

const router = useRouter()
const userStore = useUserStore()
const initialLoading = ref(true)
const loading = ref(false)
// Update error ref to include type
const error = ref<{ message: string; type: string } | null>(null)
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const avatar = ref(new Blob())
const avatarFile = ref<File | null>(null)
const avatarPreview = ref('')

const showCropper = ref(false)
const imageUrl = ref('')
const cropperRef = ref()
const displayName = ref('')

const refreshTimestamp = ref(Date.now()) //refresh timestamp for avatar

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (file.size > 2 * 1024 * 1024) {
      error.value = { message: 'Avatar file must be less than 2MB', type: 'general' }
      input.value = ''
      return
    }
    if (file.type !== 'image/jpeg') {
      error.value = { message: 'Only JPG files are allowed', type: 'general' }
      input.value = ''
      return
    }

    imageUrl.value = URL.createObjectURL(file)
    showCropper.value = true
  }
}

const handleCrop = () => {
  if (!cropperRef.value) return

  const { canvas } = cropperRef.value.getResult()

  // Convert the cropped canvas to a Blob
  canvas.toBlob(
    (blob: Blob | null) => {
      if (!blob) return
      // Create a new file from the blob
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      avatarFile.value = croppedFile
      avatarPreview.value = URL.createObjectURL(blob) // This is already correct - using object URL for local preview
      showCropper.value = false
    },
    'image/jpeg',
    0.9,
  )
}

const cancelCrop = () => {
  showCropper.value = false
  imageUrl.value = ''
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

const checkAvatar = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/checkfile', {
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
      throw new Error('Failed to check avatar status')
    }

    const data = await response.json()
    if (data.hasAvatar && userStore.user?.username) {
      // Update to use the correct backend URL for avatars
      avatarPreview.value = `http://localhost:3000/uploads/avatars/${userStore.user.username}.jpg?t=${refreshTimestamp.value}`
    }
  } catch (err) {
    console.error('Error checking avatar:', err)
    // Don't show error to user, just log it - non-critical operation
  }
}

// Update the onMounted hook to force a fresh check
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    if (userStore.user) {
      displayName.value = userStore.user.displayName || userStore.user.username
      email.value = userStore.user.email
      refreshTimestamp.value = Date.now() // Update timestamp
      await checkAvatar() // This will now use the new timestamp
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    initialLoading.value = false
  }
})

const showConfirmDialog = ref(false)
const pendingFormData = ref<FormData | null>(null)

const hasFormChanges = computed(() => {
  if (!userStore.user) return false
  return (
    hasChanges(
      { email: userStore.user.email, displayName: userStore.user.displayName },
      { email: email.value, displayName: displayName.value },
      ['email', 'displayName'],
    ) ||
    newPassword.value.length > 0 ||
    avatarFile.value !== null
  )
})

// Update handleSubmit with better error handling
const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = null

  // Validate email
  const emailError = validateEmail(email.value)
  if (emailError) {
    error.value = {
      message: emailError,
      type: 'general'
    }
    return
  }

  // Check if any changes were made
  if (!hasFormChanges.value) {
    error.value = {
      message: 'No changes were made',
      type: 'general'
    }
    return
  }

  const formData = new FormData()
  formData.append('id', userStore.user?.id.toString() || '')
  formData.append('email', email.value)
  formData.append('currentPassword', currentPassword.value)
  formData.append('displayName', displayName.value)
  if (newPassword.value) {
    formData.append('newPassword', newPassword.value)
  }
  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value)
  }

  pendingFormData.value = formData
  showConfirmDialog.value = true
}

// Update handleConfirmUpdate with better error handling
const handleConfirmUpdate = async () => {
  if (!pendingFormData.value) return

  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/user/update', {
      method: 'PUT',
      body: pendingFormData.value,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to update profile')
    }

    const data = await response.json()
    
    // Force a full refresh of user data and avatar
    await userStore.refreshUser()
    await checkAvatar()
    router.push('/profile')
  } catch (err) {
    console.error('Update error:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
    showConfirmDialog.value = false
  }
}

// Add API heartbeat check
const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()
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
  <div v-else class="flex flex-col edit-profile-view">
    <PageHeader class="mb-4" />
    <PageMain>
      <div ref="tableContainer" class="w-full h-full px-2 sm:px-4 py-4">
        <div>
          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>

          <!-- Error state using new component -->
          <ErrorDisplay
            v-else-if="error"
            :message="error.message"
            :error-type="error.type"
            @retry="checkAvatar"
          />

          <div v-else class="space-y-6">
            <FadeIn>
              <div class="w-full">  
                <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">
                  <font-awesome-icon icon="user-pen" class="text-green-400 mr-2" />
                  Edit Profile
                </h2>
                
                <!-- Main content -->
                <div class="bg-white/5 rounded-xl p-4 sm:p-6 overflow-hidden border border-white/10">
                  <div v-if="!initialLoading" class="w-full max-w-4xl mx-auto px-6">
                    <!-- Header section without buttons -->
                    <div class="mb-8">
                      <h2 class="text-2xl font-bold text-white">Edit Profile</h2>
                      <p class="text-gray-400 text-sm mt-1">Update your account information</p>
                    </div>

                    <!-- Error message with consistent spacing -->
                    <div v-if="error" class="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6">
                      {{ error }}
                    </div>
                    
                    <!-- Main content grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24 sm:mb-20">
                      <!-- Profile picture column with proper vertical alignment -->
                      <div class="flex flex-col">
                        <div class="bg-black/30 rounded-xl p-6 border border-white/10 h-full">
                          <h3 class="text-white text-lg font-medium mb-4">Profile Picture</h3>
                          <div class="flex flex-col items-center gap-6">
                            <div class="w-36 h-36 rounded-full overflow-hidden bg-white/10 border border-white/10 relative mx-auto">
                              <img
                                v-if="avatarPreview"
                                :src="avatarPreview"
                                :key="refreshTimestamp"
                                class="w-full h-full object-cover"
                                alt="Avatar preview"
                                @error="avatarPreview = ''"
                              ></img>
                              <div
                                v-else
                                class="w-full h-full flex items-center justify-center text-gray-400"
                              >
                                <span>No image</span>
                              </div>
                              <div v-if="loading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <font-awesome-icon icon="spinner" class="text-white animate-spin" />
                              </div>
                            </div>
                            
                            <div class="w-full">
                              <input
                                type="file"
                                accept="image/jpeg"
                                @change="handleAvatarChange"
                                class="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer file:transition-colors"
                              ></input>
                              <p class="mt-2 text-xs text-gray-500 text-center">JPG files only, max 2MB</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Account details column with matching heights -->
                      <div class="flex flex-col gap-6">
                        <!-- Account details section -->
                        <div class="bg-black/30 rounded-xl p-6 border border-white/10">
                          <h3 class="text-white text-lg font-medium mb-4">Account Details</h3>
                          
                          <div class="space-y-4">
                            <div>
                              <label class="block text-gray-200 text-sm font-medium mb-1.5">Display Name</label>
                              <input
                                v-model="displayName"
                                type="text"
                                required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                              />
                            </div>

                            <div>
                              <label class="block text-gray-200 text-sm font-medium mb-1.5">Email</label>
                              <input
                                v-model="email"
                                type="email"
                                required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <!-- Password section -->
                        <div class="bg-black/30 rounded-xl p-6 border border-white/10">
                          <h3 class="text-white text-lg font-medium mb-4">Password</h3>
                          
                          <div class="space-y-4">
                            <div>
                              <label class="block text-gray-200 text-sm font-medium mb-1.5">Current Password</label>
                              <input
                                v-model="currentPassword"
                                type="password"
                                required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                                placeholder="Enter your current password"
                              />
                            </div>

                            <div>
                              <label class="text-gray-200 text-sm font-medium flex items-center gap-2 mb-1.5">
                                New Password
                                <span class="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">optional</span>
                              </label>
                              <input
                                v-model="newPassword"
                                type="password"
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                              />
                            </div>

                            <div v-if="newPassword && newPassword.length > 0">
                              <label class="block text-gray-200 text-sm font-medium mb-1.5">Confirm New Password</label>
                              <input
                                v-model="confirmPassword"
                                type="password"
                                required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Unified button bar for both mobile and desktop -->
                    <div class="sticky bottom-0 right-0 left-0 py-4 px-2 mt-6 bg-black/80 backdrop-blur-md border-t border-white/10 z-50 flex gap-4 justify-end">
                      <button
                        type="button"
                        @click="router.push('/profile')"
                        class="px-5 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                      >
                        Cancel
                      </button>
                      <button
                        @click="handleSubmit"
                        :disabled="loading || !hasFormChanges"
                        :class="[
                          'px-5 py-3 text-white rounded-lg transition-colors shadow-md',
                          hasFormChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600/50 cursor-not-allowed'
                        ]"
                      >
                        {{ loading ? 'Saving...' : 'Save Changes' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
/* Base scrollbar styles - keep only these */
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
.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Remove overflow styles - let PageMain handle it */
.overflow-y-auto {
  overflow: hidden !important;
}

/* Ensure consistent row heights */
tr {
  height: 72px;
}

/* Remove scrollbar display */
::-webkit-scrollbar {
  display: none;
}

.overflow-x-auto {
  scrollbar-width: none;
}

/* Update background opacity to match other views */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Consistent hover states */
.hover\:bg-white\/10:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  input, select, button {
    font-size: 16px;
    min-height: 44px;
  }
  
  /* Better padding on mobile */
  .bg-white\/5 {
    padding: 1rem !important;
  }
}

/* Ensure proper content height */
.edit-profile-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Ensure content doesn't make page taller than needed */
.space-y-6 {
  padding-bottom: 0;
}

/* Fix bottom spacing of form */
.mb-24, .mb-20 {
  margin-bottom: 1rem !important;
}

/* Override any conflicting height styles */
:deep(.page-main) {
  height: auto !important;
  min-height: 42rem !important;
  max-height: none !important;
}
</style>
