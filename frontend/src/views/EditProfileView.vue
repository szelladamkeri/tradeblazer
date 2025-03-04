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

const router = useRouter()
const userStore = useUserStore()
const initialLoading = ref(true)
const loading = ref(false)
const error = ref<string | null>(null)
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
      error.value = 'Avatar file must be less than 2MB'
      input.value = ''
      return
    }
    if (file.type !== 'image/jpeg') {
      error.value = 'Only JPG files are allowed'
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

    const data = await response.json()
    if (data.hasAvatar && userStore.user?.username) {
      // Update to use the correct backend URL for avatars
      avatarPreview.value = `http://localhost:3000/uploads/avatars/${userStore.user.username}.jpg?t=${refreshTimestamp.value}`
    }
  } catch (error) {
    console.error('Error checking avatar:', error)
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

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = null

  // Validate email
  const emailError = validateEmail(email.value)
  if (emailError) {
    error.value = emailError
    return
  }

  // Check if any changes were made
  if (!hasFormChanges.value) {
    error.value = 'No changes were made'
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

const handleConfirmUpdate = async () => {
  if (!pendingFormData.value) return

  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/user/update', {
      method: 'PUT',
      body: pendingFormData.value,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile')
    }

    // Force a full refresh of user data and avatar
    await userStore.refreshUser()
    await checkAvatar()
    router.push('/profile')
  } catch (err) {
    console.error('Update error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
  } finally {
    loading.value = false
    showConfirmDialog.value = false
  }
}
</script>

<template>
  <PageHeader class="mb-4" />
  <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto py-6">
    <FadeIn :show="!initialLoading">
      <div v-if="!initialLoading" class="w-full max-w-4xl mx-auto px-6">
        <!-- Header with clear fixed layout -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white">Edit Profile</h2>
            <p class="text-gray-400 text-sm mt-1">Update your account information</p>
          </div>
          
          <!-- Desktop buttons - more clearly positioned -->
          <div class="hidden sm:flex items-center gap-4 self-end sm:self-center">
            <button
              type="button"
              @click="router.push('/profile')"
              class="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              :disabled="loading"
              class="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Error message with consistent spacing -->
        <div v-if="error" class="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6">
          {{ error }}
        </div>
        
        <!-- Main content grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 sm:mb-0">
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
                  />
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
                  />
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
        
        <!-- Mobile buttons - fixed at bottom with better positioning -->
        <div class="sm:hidden fixed bottom-4 inset-x-4 flex gap-4 z-10">
          <button
            type="button"
            @click="router.push('/profile')"
            class="flex-1 px-5 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="loading"
            class="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg font-medium"
          >
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </FadeIn>

    <!-- Image cropper modal -->
    <div v-if="showCropper" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-black opacity-75"></div>
        </div>

        <div
          class="bg-black/90 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-xl w-full p-6 backdrop-blur-xl border border-green-500/20"
        >
          <h3 class="text-xl font-semibold text-white mb-4">Crop Profile Picture</h3>

          <div class="h-96 mb-4">
            <Cropper
              ref="cropperRef"
              :src="imageUrl"
              :stencil-props="{
                aspectRatio: 1,
              }"
              class="cropper"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="cancelCrop"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleCrop"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Update Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      title="Confirm Changes"
      message="Are you sure you want to save these changes to your profile?"
      confirm-text="Save Changes"
      confirm-button-class="bg-green-600 hover:bg-green-700"
      type="update"
      @confirm="handleConfirmUpdate"
      @cancel="showConfirmDialog = false"
    />
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

.cropper {
  height: 100%;
  background: #1a1a1a;
}

:deep(.vue-advanced-cropper__background) {
  background: #1a1a1a;
}

:deep(.vue-advanced-cropper__stretcher) {
  background: #1a1a1a;
}

:deep(.vue-advanced-cropper__boundary) {
  border-color: rgba(34, 197, 94, 0.5);
}

:deep(.vue-advanced-cropper__handler) {
  background-color: rgb(34, 197, 94);
}

:deep(.vue-advanced-cropper__line) {
  background-color: rgba(34, 197, 94, 0.5);
}

/* Add these styles for better file input responsiveness */
input[type='file'] {
  max-width: 100%;
  white-space: normal;
  word-break: break-all;
}

input[type='file']::file-selector-button {
  transition: background-color 0.2s ease-in-out;
}

@media (max-width: 640px) {
  input[type='file'] {
    width: 100%;
  }

  input[type='file']::file-selector-button {
    width: auto;
    margin-bottom: 0.5rem;
  }
}

/* Add smooth transitions for avatar */
img {
  transition: opacity 0.3s ease-in-out;
}

img[src] {
  opacity: 1;
}

img:not([src]) {
  opacity: 0;
}

/* Add these styles to fix responsive avatar display */
.rounded-full {
  overflow: hidden;
  position: relative;
}

.rounded-full img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* Handle image error states better */
.rounded-full img[src=""] {
  display: none;
}

/* Ensure buttons are visible */
button[type="button"],
button[type="submit"] {
  position: relative;
  z-index: 10;
  font-weight: 500;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Add margin to the form to ensure space at the bottom */
form {
  margin-bottom: 2rem;
}

/* Improve the layout in mobile view */
@media (max-width: 768px) {
  input, select, button {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Optimize contrast for better readability */
.bg-black\/30 {
  background-color: rgba(0, 0, 0, 0.3);
}

/* Add subtle card hover effect */
.bg-black\/30:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

/* Make form fields more compact but still usable */
input {
  height: 42px;
}

/* Ensure buttons are visible with better shadow */
button[type="button"],
button[type="submit"] {
  position: relative;
  z-index: 10;
  height: 40px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Fix button appearance for better positioning */
button {
  position: relative;
  z-index: 10;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-height: 42px;
}

/* Ensure consistent input height */
input {
  height: 46px;
}

/* Fix card hover effect */
.bg-black\/30 {
  background-color: rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s ease;
}

.bg-black\/30:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

/* Fix mobile spacing */
@media (max-width: 640px) {
  input, select, button {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  /* Ensure buttons have enough spacing for touch */
  button {
    min-height: 48px;
  }
}

/* Mobile buttons should have a solid background to ensure visibility */
@media (max-width: 640px) {
  .fixed.bottom-4 button {
    min-height: 48px;
    background-color: rgba(17, 24, 39, 0.9);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(55, 65, 81, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .fixed.bottom-4 button:last-child {
    background-color: rgba(16, 185, 129, 0.9);
  }
}
</style>
