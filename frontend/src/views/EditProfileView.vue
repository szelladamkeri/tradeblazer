<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { handleApiError } from '@/utils/errorHandler'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import FullPageError from '@/components/FullPageError.vue'
import { useI18n } from 'vue-i18n'   // Added

const { t } = useI18n()   // Added

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const error = ref<{ message: string; type: string } | null>(null)

// Form data
const displayName = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Validation
const passwordMinLength = 6
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Add touched state tracking
const displayNameTouched = ref(false)
const emailTouched = ref(false)

// Original values tracking for change detection
const originalDisplayName = ref('')
const originalEmail = ref('')

// Update validation computed properties to check for actual changes
const displayNameChanged = computed(() => displayName.value !== originalDisplayName.value)
const emailChanged = computed(() => email.value !== originalEmail.value)

// Only show validation when field is touched AND changed
const showDisplayNameValidation = computed(() => displayNameTouched.value && displayNameChanged.value)
const showEmailValidation = computed(() => emailTouched.value && emailChanged.value)

// Validation computed properties
const isDisplayNameValid = computed(() => displayName.value.trim().length >= 3)
const isEmailValid = computed(() => emailPattern.test(email.value.trim()))
const isCurrentPasswordValid = computed(() => currentPassword.value.length >= passwordMinLength)
const isNewPasswordValid = computed(() =>
  newPassword.value === '' || newPassword.value.length >= passwordMinLength
)
const doPasswordsMatch = computed(() =>
  newPassword.value === confirmPassword.value
)

// Only validate when form is submitted or field is touched
const shouldShowDisplayNameValidation = computed(() => displayNameTouched.value)
const shouldShowEmailValidation = computed(() => emailTouched.value)

// Handle field touch events
const markDisplayNameTouched = () => {
  displayNameTouched.value = true
}

const markEmailTouched = () => {
  emailTouched.value = true
}

const formValid = computed(() => {
  // Current password is still required
  if (!currentPassword.value) return false

  // If user is changing password, validate confirmation
  if (newPassword.value && newPassword.value !== confirmPassword.value) return false

  // Only validate touched fields
  if (displayNameTouched.value && !isDisplayNameValid.value) return false
  if (emailTouched.value && !isEmailValid.value) return false

  return true
})

// Avatar handling
const avatarFile = ref<File | null>(null)
const showCropper = ref(false)
const imageUrl = ref('')
const cropperRef = ref()
const fileError = ref('')
const showAvatarConfirm = ref(false)

onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Initialize form with current user data
  if (userStore.user) {
    displayName.value = userStore.user.displayName || userStore.user.username
    email.value = userStore.user.email

    // Store original values for change detection
    originalDisplayName.value = displayName.value
    originalEmail.value = email.value
  }
})

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  fileError.value = '' 
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (file.size > 2 * 1024 * 1024) {
      fileError.value = t('editProfile.avatarSizeError')  // updated
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
  canvas.toBlob(
    (blob: Blob | null) => {
      if (!blob) return
      avatarFile.value = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      showCropper.value = false
      showAvatarConfirm.value = true
    },
    'image/jpeg',
    0.9
  )
}

const cancelCrop = () => {
  showCropper.value = false
  imageUrl.value = ''
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

const confirmAvatarUpdate = async () => {
  if (!avatarFile.value || !userStore.user) return

  const formData = new FormData()
  formData.append('username', userStore.user.username)
  formData.append('avatar', avatarFile.value)

  try {
    loading.value = true
    error.value = null

    const response = await fetch(`http://localhost:3000/api/user/avatar`, {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) throw new Error('Failed to update avatar')

    // Update user store and force avatar refresh
    await userStore.checkAvatar()
    showAvatarConfirm.value = false
    avatarFile.value = null
  } catch (err) {
    console.error('Avatar update error:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formValid.value || !userStore.user) return

  try {
    loading.value = true
    error.value = null

    const updateData = {
      id: userStore.user.id,
      displayName: displayName.value.trim(),
      email: email.value.trim(),
      currentPassword: currentPassword.value,
      newPassword: newPassword.value || undefined,
      username: userStore.user.username
    }

    const response = await fetch('http://localhost:3000/api/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to update profile')
    }

    const data = await response.json()
    userStore.setUser(data.user)
    router.push('/profile')
  } catch (err) {
    console.error('Profile update error:', err)
    const processedError = handleApiError(err)
    error.value = {
      message: processedError.message,
      type: processedError.type
    }
  } finally {
    loading.value = false
  }
}

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
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />
  
  <!-- Then check for other errors -->
  <FullPageError v-else-if="error" :message="error.message" :error-type="error.type" @retry="router.push('/profile')" />
  
  <!-- Only render normal page when there's no error -->
  <div class="edit-profile-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <PageMain>
      <div class="w-full h-full overflow-auto px-2 sm:px-4 py-3">
        <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div class="flex items-center gap-3 mb-3">
            <font-awesome-icon icon="user-pen" class="text-green-400 text-2xl" />
            <!-- Changed heading to use translation -->
            <h1 class="text-2xl sm:text-3xl font-bold text-white">
              {{ t('editProfile.title') }}
            </h1>
          </div>

          <!-- Main content area - use grid for better space utilization -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <!-- Left column -->
            <div class="flex flex-col space-y-3">
              <!-- Avatar Section -->
              <div class="bg-white/10 rounded-xl p-4 border border-white/10 flex-shrink-0">
                <!-- Section heading via translation -->
                <h2 class="text-lg font-bold text-white mb-2">
                  {{ t('editProfile.profilePicture') }}
                </h2>

                <div class="flex flex-row items-center gap-4">
                  <!-- Current Avatar Display -->
                  <div class="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    <img v-if="userStore.avatar.available"
                      :src="`http://localhost:3000/uploads/avatars/${userStore.user?.username}.jpg?t=${userStore.avatarTimestamp}`"
                      class="w-full h-full object-cover" alt="Profile" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-green-500">
                      <span class="text-white text-2xl font-semibold">
                        {{ userStore.user?.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>

                  <!-- Avatar Upload Controls -->
                  <div class="flex-1">
                    <div v-if="fileError" class="mb-2 p-2 bg-red-500/10 rounded-lg text-red-400 text-xs">
                      {{ fileError }}
                    </div>

                    <input type="file" accept="image/*" @change="handleAvatarChange" class="block w-full text-xs text-gray-400
                             file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                             file:border-0 file:text-xs file:font-medium
                             file:bg-green-600 file:text-white
                             file:transition-colors" />
                    <p class="mt-1 text-xs text-gray-400">
                      {{ t('editProfile.uploadHint') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Profile Info and Email -->
              <div class="bg-white/10 rounded-xl p-4 border border-white/10 flex-grow">
                <h2 class="text-lg font-bold text-white mb-2">
                  {{ t('editProfile.profileInformation') }}
                </h2>

                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                      <span>{{ t('editProfile.displayName') }}</span>
                      <span v-if="showDisplayNameValidation"
                        :class="isDisplayNameValid ? 'text-green-400' : 'text-red-400'" class="text-xs">
                        {{ isDisplayNameValid ? '✓ Valid' : '✗ Min 3 characters' }}
                      </span>
                    </label>
                    <input v-model.trim="displayName" type="text" @blur="markDisplayNameTouched" required
                      class="w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
                      :class="showDisplayNameValidation ? (isDisplayNameValid ? 'border-green-500' : 'border-red-500') : 'border-white/10'" />
                    <p class="mt-1 text-xs text-gray-400">
                      {{ t('editProfile.displayNameHint') }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                      <span>{{ t('editProfile.emailAddress') }}</span>
                      <span v-if="showEmailValidation" :class="isEmailValid ? 'text-green-400' : 'text-red-400'" class="text-xs">
                        {{ isEmailValid ? '✓ Valid' : '✗ Invalid email' }}
                      </span>
                    </label>
                    <input v-model.trim="email" type="email" @blur="markEmailTouched" required
                      class="w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
                      :class="showEmailValidation ? (isEmailValid ? 'border-green-500' : 'border-red-500') : 'border-white/10'" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right column - Password section -->
            <div class="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col">
              <h2 class="text-lg font-bold text-white mb-2">
                {{ t('editProfile.passwordSettings') }}
              </h2>
              <p class="text-xs text-gray-400 mb-3">
                {{ t('editProfile.passwordHint') }}
              </p>

              <div class="space-y-3 flex-grow">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                    <span>{{ t('editProfile.currentPassword') }} <span class="text-red-400">*</span></span>
                    <span v-if="currentPassword" :class="isCurrentPasswordValid ? 'text-green-400' : 'text-red-400'" class="text-xs">
                      {{ isCurrentPasswordValid ? '✓ Valid' : `✗ Min ${passwordMinLength} characters` }}
                    </span>
                  </label>
                  <input v-model="currentPassword" type="password" required
                    class="w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
                    :class="currentPassword ? (isCurrentPasswordValid ? 'border-green-500' : 'border-red-500') : 'border-white/10'" />
                  <p class="mt-1 text-xs text-gray-400">
                    {{ t('editProfile.currentPasswordHint') }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                    <span>
                      {{ t('editProfile.newPassword') }}
                      <span class="text-gray-400">({{ t('editProfile.optional') }})</span>
                    </span>
                    <span :class="newPassword ? (isNewPasswordValid ? 'text-green-400' : 'text-red-400') : ''" class="text-xs">
                      {{ newPassword ? (isNewPasswordValid ? '✓ Valid' : `✗ Min ${passwordMinLength} characters`) : '' }}
                    </span>
                  </label>
                  <input v-model="newPassword" type="password"
                    class="w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
                    :class="newPassword ? (isNewPasswordValid ? 'border-green-500' : 'border-red-500') : 'border-white/10'"
                    :placeholder="t('editProfile.newPasswordPlaceholder')" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                    <span>{{ t('editProfile.confirmNewPassword') }}</span>
                    <span v-if="newPassword" :class="confirmPassword ? (doPasswordsMatch ? 'text-green-400' : 'text-red-400') : ''" class="text-xs">
                      {{ confirmPassword ? (doPasswordsMatch ? '✓ Passwords match' : t('editProfile.passwordMismatch')) : '' }}
                    </span>
                  </label>
                  <input v-model="confirmPassword" type="password" :disabled="!newPassword" :required="!!newPassword"
                    class="w-full px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
                    :class="[
                      'transition-colors',
                      !newPassword ? 'opacity-50 cursor-not-allowed' : '',
                      newPassword && confirmPassword ? (doPasswordsMatch ? 'border-green-500' : 'border-red-500') : 'border-white/10'
                    ]" />
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex justify-end gap-3 pt-3 mt-auto">
                <button type="button" @click="router.push('/profile')"
                  class="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  {{ t('editProfile.cancel') }}
                </button>
                <button type="button" @click="handleSubmit" :disabled="!formValid || loading"
                  class="px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center min-w-[100px] text-sm"
                  :class="formValid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'">
                  <LoadingSpinner v-if="loading" class="w-4 h-4" />
                  <span v-else>{{ t('editProfile.saveChanges') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>

    <!-- Image Cropper Modal -->
    <div v-if="showCropper" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div class="bg-white/5 rounded-xl p-6 border border-white/10 max-w-xl w-full backdrop-blur-xl">
        <h3 class="text-xl font-bold text-white mb-4">{{ t('editProfile.cropProfilePicture') }}</h3>
        <div class="bg-black/30 rounded-xl p-4 mb-4">
          <div class="h-72">
            <Cropper ref="cropperRef" :src="imageUrl" :stencil-props="{ aspectRatio: 1 }" class="cropper" />
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="cancelCrop"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            {{ t('editProfile.cancel') }}
          </button>
          <button @click="handleCrop"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            {{ t('editProfile.applyAndContinue') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Avatar Update Dialog -->
    <ConfirmDialog :show="showAvatarConfirm" title="{{ t('editProfile.updateProfilePicture') }}"
      message="{{ t('editProfile.updateProfilePictureConfirmation') }}" confirm-text="{{ t('editProfile.update') }}"
      :confirm-button-class="'bg-green-600 hover:bg-green-700'" type="update" @confirm="confirmAvatarUpdate"
      @cancel="showAvatarConfirm = false" />
  </div>
</template>

<style scoped>
.cropper {
  width: 100%;
  height: 100%;
}

/* Set explicit sizing for view container */
.edit-profile-view {
  padding-top: 0 !important;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: auto !important;
  /* Remove fixed height */
}

/* Fix overflow handling */
.overflow-auto {
  overflow: auto !important;
  flex: 1;
  min-height: 200px;
}

/* Override PageMain height */
:deep(.page-main) {
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important;
  /* Contain overflow */
}

/* Hide browser's password reveal button */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

/* Better form focus states */
input:focus {
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

/* Add subtle hover effect to inputs */
input:not([disabled]):hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Better mobile experience */
@media (max-width: 640px) {

  input,
  button {
    font-size: 16px;
    /* Prevent iOS zoom */
  }

  button {
    height: 44px;
    /* Better touch targets */
  }
}

/* Validation status transitions */
span.text-xs {
  transition: all 0.2s ease;
}

/* Required field indicator */
.text-red-400 {
  display: inline-block;
}

/* Form section transitions */
.space-y-4>div {
  transition: all 0.3s ease;
}

/* Make everything more compact */
input {
  height: 38px;
  /* Reduced height for inputs */
}

.text-lg {
  font-size: 1.1rem;
  /* Slightly smaller headers */
}

/* Ensure proper scaling for desktop view */
@media (min-width: 1024px) {
  .max-w-4xl {
    max-width: 64rem;
    /* Wider container for desktop */
  }
}

/* Make proper use of available vertical space */
:deep(.page-main) {
  min-height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
}

/* Remove height property that causes jumping */
.edit-profile-view {
  height: auto !important;
  min-height: 100vh !important;
}

/* Make this view take up all available space */
.edit-profile-view {
  height: 100%;
}
</style>
