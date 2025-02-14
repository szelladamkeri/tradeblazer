<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EditUserModal from '@/components/EditUserModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FadeIn from '@/components/FadeIn.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const router = useRouter()

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at?: string
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedUser = ref<User | null>(null)
const showEditModal = ref(false)

const userStore = useUserStore()

const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    const allUsers = await response.json()
    users.value = allUsers.slice(0, 10) // Limit to 10 users
  } catch (err) {
    error.value = 'Error loading users'
  } finally {
    loading.value = false
  }
}

// Refs for confirmation dialogs
const showDeleteConfirm = ref(false)
const userToDelete = ref<User | null>(null)
const showAvatarConfirm = ref(false)

// handleDeleteUser to show confirmation first
const handleDeleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteConfirm.value = true
}

// ConfirmDelete function
const confirmDelete = async () => {
  if (!userToDelete.value) return

  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete user')

    users.value = users.value.filter((user) => user.id !== userToDelete.value?.id)
    showDeleteConfirm.value = false
    userToDelete.value = null
  } catch (err) {
    error.value = 'Failed to delete user'
  }
}

const handleEditUser = async (user: User) => {
  if (user.id === userStore.user?.id) {
    error.value = "You can't change your own role from here"
    return
  }
}

const openEditModal = (user: User) => {
  selectedUser.value = user
  showEditModal.value = true
}

const handleSaveUser = async (updatedUser: User) => {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to update user')
    }

    users.value = users.value.map((user) =>
      user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
    )
    showEditModal.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update user'
  }
}

const handleUserDelete = async (userId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete user')

    // If deleting own account, logout
    if (userId === userStore.user?.id) {
      userStore.logout()
      router.push('/login')
      return
    }

    // Otherwise just refresh the users list
    await fetchUsers()
  } catch (err) {
    console.error('Delete error:', err)
  }
}

const handleUserUpdate = async (user: any) => {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })

    if (!response.ok) throw new Error('Failed to update user')

    // If updating own account and role changed from admin
    if (user.id === userStore.user?.id && user.role !== 'A') {
      // Update the user store with new role
      userStore.setUser({
        ...userStore.user!,
        type: user.role,
      })
      // Redirect to home page
      router.push('/')
      return
    }

    await fetchUsers()
  } catch (err) {
    console.error('Update error:', err)
  }
}

const avatarFile = ref<File | null>(null)
const selectedUserForAvatar = ref<User | null>(null)
const showAvatarModal = ref(false)

const openAvatarModal = (user: User) => {
  selectedUserForAvatar.value = user
  showAvatarModal.value = true
}

// New refs for cropper
const showCropper = ref(false)
const imageUrl = ref('')
const cropperRef = ref()

// avatarTimestamps map to track individual user avatar updates
const avatarTimestamps = ref<{ [key: number]: number }>({})

// Update handleAvatarChange to show cropper
const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  fileError.value = ''

  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (file.size > 2 * 1024 * 1024) {
      fileError.value = 'Avatar file must be less than 2MB'
      input.value = ''
      return
    }
    if (file.type !== 'image/jpeg') {
      fileError.value = 'Only JPG files are allowed'
      input.value = ''
      return
    }
    imageUrl.value = URL.createObjectURL(file)
    showCropper.value = true
  }
}

// Crop handling functions
const handleCrop = () => {
  if (!cropperRef.value) return

  const { canvas } = cropperRef.value.getResult()
  canvas.toBlob(
    (blob: Blob | null) => {
      if (!blob) return
      avatarFile.value = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      showCropper.value = false
      submitAvatarUpdate()
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

// SubmitAvatarUpdate to show confirmation first
const submitAvatarUpdate = async () => {
  if (!selectedUserForAvatar.value || !avatarFile.value) return
  showAvatarConfirm.value = true
}

// Add confirmAvatarUpdate function
const confirmAvatarUpdate = async () => {
  if (!selectedUserForAvatar.value || !avatarFile.value) return

  const formData = new FormData()
  formData.append('username', selectedUserForAvatar.value.username)
  formData.append('avatar', avatarFile.value)

  try {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${selectedUserForAvatar.value.id}/avatar`,
      {
        method: 'PUT',
        body: formData,
      },
    )
    if (!response.ok) throw new Error('Failed to update avatar')

    // Update timestamp for the specific user
    avatarTimestamps.value[selectedUserForAvatar.value.id] = Date.now()

    showAvatarModal.value = false
    showAvatarConfirm.value = false
    avatarFile.value = null
  } catch (err) {
    error.value = 'Failed to update avatar'
  }
}

// Function for getting first letter
const getFirstLetter = (username: string) => {
  return username.charAt(0).toUpperCase()
}

const handleDeleteAvatar = async (user: User) => {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${user.id}/avatar`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete avatar')

    // Remove the timestamp to switch back to default avatar
    delete avatarTimestamps.value[user.id]
  } catch (err) {
    error.value = 'Failed to delete avatar'
  }
}

const fileError = ref('')

onMounted(fetchUsers)
</script>

<template>
  <PageHeader :class="{ 'blur-sm': showDeleteConfirm || showAvatarConfirm || showEditModal }" />
  <PageMain>
    <div class="p-6 sm:p-8">
      <div class="flex items-center gap-3 mb-8">
        <font-awesome-icon icon="shield" class="text-green-400 text-2xl" />
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>

      <div v-else-if="error" class="text-red-400 text-center py-8">
        <div
          class="bg-black/40 backdrop-blur-xl backdrop-saturate-150 rounded-xl p-6 border border-red-500/20"
        >
          <span class="text-xl font-medium">{{ error }}</span>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- Mobile View -->
        <div class="sm:hidden">
          <div
            v-for="user in users"
            :key="user.id"
            class="bg-white/5 rounded-xl p-4 mb-4 hover:bg-white/10 transition-colors"
          >
            <div class="flex flex-col gap-4">
              <!-- User Info Section -->
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    <img
                      :src="
                        '/src/assets/avatars/' +
                        user.username +
                        '.jpg?t=' +
                        (avatarTimestamps[user.id] || Date.now())
                      "
                      :key="avatarTimestamps[user.id]"
                      class="w-full h-full object-cover"
                      @error="
                        ($event.target as HTMLImageElement).parentElement!.innerHTML =
                          `<div class='w-full h-full flex items-center justify-center bg-green-500'><span class='text-white text-lg font-semibold'>${getFirstLetter(user.username)}</span></div>`
                      "
                      alt=""
                    />
                  </div>
                  <div>
                    <div class="font-medium text-white">{{ user.username }}</div>
                    <div class="text-sm text-gray-400">{{ user.email }}</div>
                    <div class="text-sm mt-1">
                      <span :class="user.role === 'A' ? 'text-green-400' : 'text-gray-400'">
                        {{ user.role === 'A' ? 'Admin' : 'User' }}
                      </span>
                      <span class="text-gray-500 ml-2">#{{ user.id }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile View Actions Section -->
              <div class="flex items-center justify-between border-t border-white/5 pt-3">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(user)"
                    class="text-green-400 hover:text-green-300 p-2"
                  >
                    <font-awesome-icon icon="edit" />
                  </button>
                  <button
                    @click="handleDeleteUser(user)"
                    class="text-red-400 hover:text-red-300 p-2"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                  <button
                    v-if="avatarTimestamps[user.id]"
                    @click="handleDeleteAvatar(user)"
                    class="text-yellow-400 hover:text-yellow-300 p-2"
                  >
                    <font-awesome-icon icon="user-slash" />
                  </button>
                </div>
                <div>
                  <button
                    @click="openAvatarModal(user)"
                    class="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Change Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden sm:block bg-white/5 rounded-xl p-4 sm:p-6 overflow-hidden">
          <div class="flex items-center gap-3 mb-4">
            <font-awesome-icon icon="users" class="text-green-400" />
            <h2 class="text-xl text-white font-semibold">User Management</h2>
          </div>

          <div class="overflow-x-auto">
            <div class="min-w-[700px]">
              <table class="w-full text-gray-300">
                <thead class="text-left border-b border-white/10">
                  <tr>
                    <th class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="hashtag" class="text-green-400" />
                      </div>
                    </th>
                    <th class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="user" class="text-green-400" />
                        Username
                      </div>
                    </th>
                    <th class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="envelope" class="text-green-400" />
                        Email
                      </div>
                    </th>
                    <th class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="user-tag" class="text-green-400" />
                        Role
                      </div>
                    </th>
                    <th class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="wrench" class="text-green-400" />
                        Actions
                      </div>
                    </th>
                    <th class="py-3 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="user-circle" class="text-green-400" />
                        Avatar
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in users"
                    :key="user.id"
                    class="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td class="py-3 px-4 whitespace-nowrap">#{{ user.id }}</td>
                    <td class="py-3 px-4 whitespace-nowrap">{{ user.username }}</td>
                    <td class="py-3 px-4 whitespace-nowrap">{{ user.email }}</td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <span :class="user.role === 'A' ? 'text-green-400' : 'text-gray-400'">
                        {{ user.role === 'A' ? 'Admin' : 'User' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <div class="flex gap-3">
                        <button
                          @click="openEditModal(user)"
                          class="text-green-400 hover:text-green-300"
                        >
                          <font-awesome-icon icon="edit" />
                        </button>
                        <button
                          class="text-red-400 hover:text-red-300"
                          @click="handleDeleteUser(user)"
                        >
                          <font-awesome-icon icon="trash" />
                        </button>
                      </div>
                    </td>
                    <!-- Desktop View Avatar Actions -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                          <img
                            :src="
                              '/src/assets/avatars/' +
                              user.username +
                              '.jpg?t=' +
                              (avatarTimestamps[user.id] || Date.now())
                            "
                            :key="avatarTimestamps[user.id]"
                            class="w-full h-full object-cover"
                            @error="
                              ($event.target as HTMLImageElement).parentElement!.innerHTML =
                                `<div class='w-full h-full flex items-center justify-center bg-green-500'><span class='text-white text-lg font-semibold'>${getFirstLetter(user.username)}</span></div>`
                            "
                            alt=""
                          />
                        </div>
                        <div class="flex gap-1">
                          <button
                            @click="openAvatarModal(user)"
                            class="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            Change
                          </button>
                          <button
                            v-if="avatarTimestamps[user.id]"
                            @click="handleDeleteAvatar(user)"
                            class="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageMain>

  <EditUserModal
    :show="showEditModal"
    :user="selectedUser"
    :current-user-id="userStore.user?.id"
    @close="showEditModal = false"
    @save="handleSaveUser"
  />

  <div
    v-if="showAvatarModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
  >
    <div class="bg-black/90 rounded-xl p-6 border border-green-500/20 max-w-md w-full">
      <h3 class="text-xl font-bold text-white mb-4">
        Update Avatar for {{ selectedUserForAvatar?.username }}
      </h3>

      <template v-if="!showCropper">
        <div v-if="fileError" class="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded">
          {{ fileError }}
        </div>
        <input
          type="file"
          accept="image/jpeg"
          @change="handleAvatarChange"
          class="mb-6 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
        />

        <div class="flex justify-end gap-3">
          <button
            @click="showAvatarModal = false"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </template>

      <!-- Cropper view -->
      <template v-else>
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

        <div class="flex justify-end gap-3">
          <button
            @click="cancelCrop"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleCrop"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Apply & Upload
          </button>
        </div>
      </template>
    </div>
  </div>

  <!-- ConfirmDialog components -->
  <ConfirmDialog
    :show="showDeleteConfirm"
    title="Delete User"
    :message="`Are you sure you want to delete the user '${userToDelete?.username}'? This action cannot be undone.`"
    confirm-text="Delete User"
    confirm-button-class="bg-red-600 hover:bg-red-700"
    type="delete"
    class="sm:max-w-md w-full sm:w-auto fixed inset-0 sm:relative"
    @confirm="confirmDelete"
    @cancel="showDeleteConfirm = false"
  />

  <ConfirmDialog
    :show="showAvatarConfirm"
    title="Update Avatar"
    :message="`Are you sure you want to update the avatar for '${selectedUserForAvatar?.username}'?`"
    confirm-text="Update Avatar"
    confirm-button-class="bg-green-600 hover:bg-green-700"
    type="update"
    class="sm:max-w-md w-full sm:w-auto fixed inset-0 sm:relative"
    @confirm="confirmAvatarUpdate"
    @cancel="showAvatarConfirm = false"
  />
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.bg-black\/40 {
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
}

/* Smooth scrolling for mobile */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
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

/* Styles for first letter avatar */
.bg-green-500 {
  background-color: rgb(34, 197, 94);
}

/* Cropper styles */
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

/* Add responsive container styles */
.max-w-7xl {
  width: 100%;
}

@media (max-width: 640px) {
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Mobile card animations */
.bg-white\/5 {
  animation: fadeIn 0.2s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add stagger effect to cards */
.bg-white\/5:nth-child(1) {
  animation-delay: 0.05s;
}
.bg-white\/5:nth-child(2) {
  animation-delay: 0.1s;
}
.bg-white\/5:nth-child(3) {
  animation-delay: 0.15s;
}
.bg-white\/5:nth-child(4) {
  animation-delay: 0.2s;
}
.bg-white\/5:nth-child(5) {
  animation-delay: 0.25s;
}

/* Improve mobile card layout */
@media (max-width: 640px) {
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  button {
    white-space: nowrap;
  }
}

/* Add blur transition */
.blur-sm {
  transition: filter 0.2s ease-out;
}

/* Update mobile confirm dialog */
@media (max-width: 640px) {
  :deep(.confirm-dialog) {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

/* Add these new styles for header icon alignment */
.fa-icon {
  vertical-align: -0.125em;
}
</style>
