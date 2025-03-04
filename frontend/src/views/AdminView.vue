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

// Add checkAvatar function
const checkAvatar = async (username: string, userId: number) => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/checkfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purpose: 'avatarCheck',
        username: username,
      }),
    })
    const data = await response.json()
    if (data.hasAvatar) {
      avatarTimestamps.value[userId] = Date.now()
    }
  } catch (error) {
    console.error('Error checking avatar:', error)
  }
}

// Update fetchUsers to check avatars
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    const allUsers = await response.json()
    users.value = allUsers.slice(0, 10) // Limit to 10 users

    // Check avatars for all users
    for (const user of users.value) {
      await checkAvatar(user.username, user.id)
    }
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

const fileError = ref('')

const showDeleteAvatarConfirm = ref(false)
const userToDeleteAvatar = ref<User | null>(null)

// Update handleDeleteAvatar to show confirmation first
const handleDeleteAvatar = (user: User) => {
  userToDeleteAvatar.value = user
  showDeleteAvatarConfirm.value = true
}

// Add confirmDeleteAvatar function
const confirmDeleteAvatar = async () => {
  if (!userToDeleteAvatar.value) return

  try {
    const response = await fetch(
      `http://localhost:3000/api/admin/users/${userToDeleteAvatar.value.id}/avatar?username=${userToDeleteAvatar.value.username}`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) throw new Error('Failed to delete avatar')

    // Remove the timestamp to switch back to default avatar
    delete avatarTimestamps.value[userToDeleteAvatar.value.id]
    // Force a re-check of the avatar
    await checkAvatar(userToDeleteAvatar.value.username, userToDeleteAvatar.value.id)

    showDeleteAvatarConfirm.value = false
    userToDeleteAvatar.value = null
  } catch (err) {
    error.value = 'Failed to delete avatar'
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="flex flex-col">
    <PageHeader class="mb-4" />
    <PageMain class="relative z-[1]">
      <div
        :class="{
          'pointer-events-none':
            showDeleteConfirm ||
            showAvatarConfirm ||
            showEditModal ||
            showDeleteAvatarConfirm ||
            showAvatarModal,
          'transition-[filter] duration-200': true,
          'filter blur-[4px]':
            showDeleteConfirm ||
            showAvatarConfirm ||
            showEditModal ||
            showDeleteAvatarConfirm ||
            showAvatarModal,
        }"
      >
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
                            ($event.target as HTMLImageElement)?.parentElement
                              ? (($event.target as HTMLImageElement).parentElement!.innerHTML =
                                  `<div class='w-full h-full flex items-center justify-center bg-green-500'>
                                  <span class='text-white text-lg font-semibold'>${getFirstLetter(user.username)}</span>
                                </div>`)
                              : null
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
                        class="text-red-400 hover:text-red-300 p-2"
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
            <div class="hidden sm:block bg-white/5 rounded-xl p-4 sm:p-6 overflow-hidden border border-white/10">
              <div class="flex items-center gap-3 mb-4">
                <font-awesome-icon icon="users" class="text-green-400" />
                <h2 class="text-xl text-white font-semibold">User Management</h2>
              </div>

              <div class="overflow-x-auto">
                <div class="min-w-[700px]">
                  <table class="w-full text-gray-300">
                    <thead class="text-left border-b border-white/10">
                      <tr>
                        <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="hashtag" class="text-green-400" />
                          </div>
                        </th>
                        <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="user" class="text-green-400" />
                            Username
                          </div>
                        </th>
                        <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="envelope" class="text-green-400" />
                            Email
                          </div>
                        </th>
                        <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="user-tag" class="text-green-400" />
                            Role
                          </div>
                        </th>
                        <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="wrench" class="text-green-400" />
                            Actions
                          </div>
                        </th>
                        <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <font-awesome-icon icon="user-circle" class="text-green-400" />
                            Avatar
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
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
                                  ($event.target as HTMLImageElement)?.parentElement
                                    ? (($event.target as HTMLImageElement).parentElement!.innerHTML =
                                        `<div class='w-full h-full flex items-center justify-center bg-green-500'>
                                        <span class='text-white text-lg font-semibold'>${getFirstLetter(user.username)}</span>
                                      </div>`)
                                    : null
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
                                class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
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
      </div>

      <!-- Move ConfirmDialogs outside of the blurred content -->
      <ConfirmDialog
        :show="showDeleteConfirm"
        title="Delete User"
        :message="`Are you sure you want to delete '${userToDelete?.username}'? This action cannot be undone.`"
        confirm-text="Delete"
        :confirm-button-class="'bg-red-600 hover:bg-red-700'"
        type="delete"
        :z-index="200"
        @confirm="confirmDelete"
        @cancel="showDeleteConfirm = false"
      />

      <ConfirmDialog
        :show="showAvatarConfirm"
        title="Update Avatar"
        :message="`Are you sure you want to update the avatar for '${selectedUserForAvatar?.username}'?`"
        confirm-text="Update"
        :confirm-button-class="'bg-green-600 hover:bg-green-700'"
        type="update"
        :z-index="200"
        @confirm="confirmAvatarUpdate"
        @cancel="showAvatarConfirm = false"
      />

      <ConfirmDialog
        :show="showDeleteAvatarConfirm"
        title="Delete Avatar"
        :message="`Are you sure you want to delete the avatar for '${userToDeleteAvatar?.username}'?`"
        confirm-text="Delete"
        :confirm-button-class="'bg-red-600 hover:bg-red-700'"
        type="delete"
        :z-index="200"
        @confirm="confirmDeleteAvatar"
        @cancel="showDeleteAvatarConfirm = false"
      />

      <!-- Avatar Modal -->
      <div
        v-if="showAvatarModal"
        class="fixed inset-0 z-[60]"
        :class="{
          'pointer-events-none': showDeleteConfirm || showAvatarConfirm || showDeleteAvatarConfirm,
        }"
      >
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div
            class="relative bg-black/90 rounded-xl p-6 border border-green-500/20 max-w-md w-full mx-4"
          >
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
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.blur-sm {
  filter: blur(4px);
  transition: filter 0.15s ease-out;
}

/* Remove conflicting z-index utilities */
.isolate {
  isolation: none;
}

/* Update z-index hierarchy */
.z-base {
  z-index: 1;
}
.z-content {
  z-index: 10;
}
.z-modal {
  z-index: 30;
}
.z-dialog {
  z-index: 40;
}

/* Remove any conflicting z-index styles */
.z-\[60\],
.z-\[70\],
.z-\[150\],
.z-\[200\] {
  z-index: unset;
}

/* Ensure backdrop blur works */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Update blur transition */
.transition-\[filter\] {
  transition: filter 0.2s ease-out;
}

/* Add consistent z-index layering */
.z-base {
  z-index: 0;
}
.z-blur {
  z-index: 100;
}
.z-modal {
  z-index: 150;
}
.z-dialog {
  z-index: 200;
}

/* Remove any conflicting z-index styles */
.z-\[60\],
.z-\[70\],
.z-\[100\],
.z-\[150\] {
  /* These will be overridden by our new z-index system */
}

/* Add proper backdrop styles */
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
}

/* Ensure proper stacking */
.relative {
  isolation: isolate;
}

/* Update background opacity to match MarketsView */
.bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Ensure consistent hover states */
tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Table styles */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

/* Update empty state and error state backgrounds to match */
.bg-black\/40 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Ensure proper stacking */
.relative {
  isolation: isolate;
}
</style>
