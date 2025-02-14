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

const router = useRouter()
const userStore = useUserStore()
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
      avatarPreview.value = URL.createObjectURL(blob)
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
    const response = await fetch('http://localhost:3000/api/checkfile', {
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
      avatarPreview.value = `/src/assets/avatars/${userStore.user.username}.jpg?t=${userStore.avatarTimestamp}`
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
  if (userStore.user) {
    displayName.value = userStore.user.displayName || userStore.user.username
    email.value = userStore.user.email
    refreshTimestamp.value = Date.now() // Update timestamp
    await checkAvatar() // This will now use the new timestamp
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
  <PageHeader />
  <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto">
    <div class="w-full max-w-2xl mx-auto p-6 sm:p-8">
      <div class="space-y-8">
        <div class="text-center sm:text-left">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Edit Profile</h2>
          <p class="text-gray-400">Update your account information</p>
        </div>

        <form @submit="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg">
            {{ error }}
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Display Name</label>
              <input
                v-model="displayName"
                type="text"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Profile Picture</label>
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="w-24 h-24 flex-shrink-0 rounded-full overflow-hidden bg-white/10">
                  <img
                    v-if="avatarPreview"
                    :src="avatarPreview"
                    :key="userStore.avatarTimestamp"
                    class="w-full h-full object-cover"
                    alt="Avatar preview"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No image</span>
                  </div>
                </div>
                <div class="w-full">
                  <input
                    type="file"
                    accept="image/jpeg"
                    @change="handleAvatarChange"
                    class="w-full text-sm text-gray-400 file:mb-2 sm:file:mb-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                  />
                  <p class="mt-1 text-sm text-gray-400">JPG files only (not JPEG/PNG), max 2MB</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Current Password</label>
              <input
                v-model="currentPassword"
                type="password"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
                placeholder="Enter your current password"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium flex items-center gap-2">
                New Password
                <span
                  class="text-sm font-normal px-2 py-0.5 rounded-md bg-gray-700/50 text-gray-400"
                >
                  optional
                </span>
              </label>
              <input
                v-model="newPassword"
                type="password"
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>

            <div v-if="newPassword && newPassword.length > 0" class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Confirm New Password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>
          </div>

          <div class="flex gap-4 justify-end">
            <button
              type="button"
              @click="router.push('/profile')"
              class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

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

@media (max-width: 640px) {
  input[type='file'] {
    width: 100%;
  }

  input[type='file']::file-selector-button {
    width: 100%;
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}
</style>
