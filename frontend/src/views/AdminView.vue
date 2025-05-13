<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EditUserModal from '@/components/EditUserModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FadeIn from '@/components/FadeIn.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { usePagination } from '@/composables/usePagination'
import { handleApiError } from '@/utils/errorHandler'
import FullPageError from '@/components/FullPageError.vue'
import { useApiHeartbeat } from '@/composables/useApiHeartbeat'
import { type User } from '@/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<{ message: string; type: string } | null>(null)
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
    loading.value = true;
    error.value = null;

    const response = await fetch('http://localhost:3000/api/admin/users')
    if (!response.ok) {
      // Simplify error message here
      throw new Error('Unable to load users. Please try again later.');
    }

    const allUsers = await response.json()
    users.value = allUsers//.slice(0, 10) // Limit to 10 users

    // Check avatars for all users
    for (const user of users.value) {
      await checkAvatar(user.username, user.id)
    }
  } catch (err) {
    console.error('Error loading users:', err); // Keep detailed error in console
    const processedError = handleApiError(err);
    error.value = {
      message: processedError.message,
      type: processedError.type
    };
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
    error.value = { message: 'Failed to delete user', type: 'error' }
  }
}

const handleEditUser = async (user: User) => {
  if (user.id === userStore.user?.id) {
    error.value = { message: "You can't change your own role from here", type: 'error' }
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
    error.value = { 
      message: err instanceof Error ? err.message : 'Failed to update user',
      type: 'error'
    }
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
    error.value = { message: 'Failed to update avatar', type: 'error' }
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
    error.value = { message: 'Failed to delete avatar', type: 'error' }
  }
}

const {
  tableContainer,
  currentPage,
  paginatedItems: paginatedUsers,
  totalPages,
  nextPage,
  prevPage,
  visibleItems
} = usePagination(users, {
  rowHeight: 72,
  headerHeight: 180,
  tableHeaderHeight: 56,
  maxItems: 5 // Set fixed limit of 5 items
})

const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat()

onMounted(fetchUsers)

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
  <FullPageError v-else-if="error" :message="error.message" :error-type="error.type" @retry="fetchUsers" />

  <!-- Only render normal page when there's no error -->
  <div v-else class="admin-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <PageMain>
      <div ref="tableContainer" class="w-full h-full overflow-auto px-2 sm:px-4 py-4">
        <div :class="{
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
        }">
          <div>
            <div class="flex items-center gap-3 mb-6">
              <font-awesome-icon icon="shield" class="text-green-400 text-2xl" />
              <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('admin.title') }}</h1>
            </div>

            <div v-if="loading" class="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>

            <div v-else class="space-y-6">
              <!-- Mobile View -->
              <div class="sm:hidden">
                <div v-for="user in users" :key="user.id"
                  class="bg-white/5 rounded-xl p-4 mb-4 hover:bg-white/10 transition-colors">
                  <div class="flex flex-col gap-4">
                    <!-- User Info Section -->
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                          <img :src="'/src/assets/avatars/' +
                            user.username +
                            '.jpg?t=' +
                            (avatarTimestamps[user.id] || Date.now())
                            " :key="avatarTimestamps[user.id]" class="w-full h-full object-cover" @error="
                              ($event.target as HTMLImageElement)?.parentElement
                                ? (($event.target as HTMLImageElement).parentElement!.innerHTML =
                                  `<div class='w-full h-full flex items-center justify-center bg-green-500'>
                                    <span class='text-white text-lg font-semibold'>${getFirstLetter(user.username)}</span>
                                  </div>`)
                                : null
                              " alt=""></img>
                        </div>
                        <div>
                          <div class="font-medium text-white">{{ user.username }}</div>
                          <div class="text-sm text-gray-400">{{ user.email }}</div>
                          <div class="text-sm mt-1">
                            <span :class="user.role === 'A' ? 'text-green-400' : 'text-gray-400'">
                              {{ user.role === 'A' ? t('admin.table.admin') : t('admin.table.user') }}
                            </span>
                            <span class="text-gray-500 ml-2">#{{ user.id }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Mobile View Actions Section -->
                    <div class="flex items-center justify-between border-t border-white/5 pt-3">
                      <div class="flex gap-2">
                        <button @click="openEditModal(user)" class="text-green-400 hover:text-green-300 p-2">
                          <font-awesome-icon icon="edit" />
                        </button>
                        <button @click="handleDeleteUser(user)" class="text-red-400 hover:text-red-300 p-2">
                          <font-awesome-icon icon="trash" />
                        </button>
                        <button v-if="avatarTimestamps[user.id]" @click="handleDeleteAvatar(user)"
                          class="text-red-400 hover:text-red-300 p-2">
                          <font-awesome-icon icon="user-slash" />
                        </button>
                      </div>
                      <div>
                        <button @click="openAvatarModal(user)"
                          class="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                          {{ t('admin.avatarModal.change') }}
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
                  <h2 class="text-xl text-white font-semibold">{{ t('admin.userManagement') }}</h2>
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
                              {{ t('admin.table.username') }}
                            </div>
                          </th>
                          <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                            <div class="flex items-center gap-2">
                              <font-awesome-icon icon="envelope" class="text-green-400" />
                              {{ t('admin.table.email') }}
                            </div>
                          </th>
                          <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                            <div class="flex items-center gap-2">
                              <font-awesome-icon icon="user-tag" class="text-green-400" />
                              {{ t('admin.table.role') }}
                            </div>
                          </th>
                          <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                            <div class="flex items-center gap-2">
                              <font-awesome-icon icon="wrench" class="text-green-400" />
                              {{ t('admin.table.actions') }}
                            </div>
                          </th>
                          <th class="py-3 px-4 whitespace-nowrap border-b border-white/10">
                            <div class="flex items-center gap-2">
                              <font-awesome-icon icon="user-circle" class="text-green-400" />
                              {{ t('admin.table.avatar') }}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/10">
                        <tr v-for="user in paginatedUsers" :key="user.id"
                          class="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td class="py-3 px-4 whitespace-nowrap">#{{ user.id }}</td>
                          <td class="py-3 px-4 whitespace-nowrap">{{ user.username }}</td>
                          <td class="py-3 px-4 whitespace-nowrap">{{ user.email }}</td>
                          <td class="py-3 px-4 whitespace-nowrap">
                            <span :class="user.role === 'A' ? 'text-green-400' : 'text-gray-400'">
                              {{ user.role === 'A' ? t('admin.table.admin') : t('admin.table.user') }}
                            </span>
                          </td>
                          <td class="py-3 px-4 whitespace-nowrap">
                            <div class="flex gap-3">
                              <button @click="openEditModal(user)" class="text-green-400 hover:text-green-300">
                                <font-awesome-icon icon="edit" />
                              </button>
                              <button class="text-red-400 hover:text-red-300" @click="handleDeleteUser(user)">
                                <font-awesome-icon icon="trash" />
                              </button>
                            </div>
                          </td>
                          <!-- Desktop View Avatar Actions -->
                          <td class="py-3 px-4">
                            <div class="flex items-center gap-2">
                              <div class="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                <img :src="'/src/assets/avatars/' +
                                  user.username +
                                  '.jpg?t=' +
                                  (avatarTimestamps[user.id] || Date.now())
                                  " :key="avatarTimestamps[user.id]" class="w-full h-full object-cover" @error="
                                    ($event.target as HTMLImageElement)?.parentElement
                                      ? (($event.target as HTMLImageElement).parentElement!.innerHTML =
                                        `<div class='w-full h-full flex items-center justify-center bg-green-500'>
                                          <span class='text-white text-lg font-semibold'>${getFirstLetter(user.username)}</span>
                                        </div>`)
                                      : null
                                    " alt=""></img>
                              </div>
                              <div class="flex gap-1">
                                <button @click="openAvatarModal(user)"
                                  class="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded">
                                  {{ t('admin.avatarModal.change') }}
                                </button>
                                <button v-if="avatarTimestamps[user.id]" @click="handleDeleteAvatar(user)"
                                  class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded">
                                  {{ t('admin.avatarModal.remove') }}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Add pagination controls -->
                    <div class="mt-4 flex items-center justify-between px-4">
                      <div class="text-sm text-gray-400">
                        {{ t('admin.pagination.showing') }} {{ users.length ? ((currentPage - 1) * visibleItems) + 1 : 0
                        }} -
                        {{ Math.min(currentPage * visibleItems, users.length) }} {{ t('admin.pagination.of') }}
                        {{ users.length }} {{ t('admin.pagination.users') }}
                      </div>
                      <div class="flex items-center gap-2">
                        <button @click="prevPage" :disabled="currentPage === 1"
                          class="px-3 py-1 rounded-lg transition-colors" :class="[
                            currentPage === 1
                              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          ]">
                          <font-awesome-icon icon="chevron-left" />
                        </button>

                        <span class="text-gray-400">
                          {{ t('admin.pagination.page') }} {{ currentPage }} {{ t('admin.pagination.of') }} {{
                          totalPages }}
                        </span>

                        <button @click="nextPage" :disabled="currentPage === totalPages"
                          class="px-3 py-1 rounded-lg transition-colors" :class="[
                            currentPage === totalPages
                              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          ]">
                          <font-awesome-icon icon="chevron-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageMain>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog 
      :show="showDeleteConfirm"
      :title="t('admin.confirmDialog.deleteUser')"
      :message="t('admin.confirmDialog.deleteUserMessage')"
      :confirmText="t('admin.confirmDialog.confirm')"
      type="delete"
      @confirm="confirmDelete" 
      @cancel="showDeleteConfirm = false" 
    />

    <!-- Confirm Delete Avatar Dialog -->
    <ConfirmDialog 
      :show="showDeleteAvatarConfirm"
      :title="t('admin.confirmDialog.deleteAvatar')"
      :message="t('admin.confirmDialog.deleteAvatarMessage')"
      :confirmText="t('admin.confirmDialog.confirm')"
      type="delete"
      @confirm="confirmDeleteAvatar" 
      @cancel="showDeleteAvatarConfirm = false" 
    />

    <!-- Edit User Modal -->
    <EditUserModal 
      :isOpen="showEditModal"
      v-if="showEditModal && selectedUser" 
      :user="{
        name: selectedUser.username,
        email: selectedUser.email
      }"
      @close="showEditModal = false"
      @save="handleSaveUser" 
    />

    <!-- Avatar Upload Modal -->
    <div v-if="showAvatarModal"
      class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div class="bg-gray-800 p-6 rounded-xl w-full max-w-md mx-auto border border-white/10">
        <div class="relative">
          <div class="absolute top-0 right-0">
            <button @click="showAvatarModal = false" class="text-gray-400 hover:text-white">
              <font-awesome-icon icon="times" />
            </button>
          </div>

          <div class="flex items-center justify-center h-12 w-12 rounded-full bg-green-600/20 mb-4">
            <font-awesome-icon icon="user-pen" />
          </div>

          <h3 class="text-xl font-bold text-white mb-4">
            {{ t('admin.avatarModal.title') }} {{ selectedUserForAvatar?.username }}
          </h3>

          <template v-if="!showCropper">
            <div v-if="fileError" class="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg w-full">
              {{ fileError }}
            </div>

            <div class="w-full space-y-4">
              <input type="file" accept="image/jpeg" @change="handleAvatarChange" class="block w-full text-sm text-gray-400
                       file:mr-4 file:py-2.5 file:px-4 file:rounded-lg
                       file:border-0 file:text-sm file:font-medium
                       file:bg-green-600 file:text-white
                       hover:file:bg-green-700 file:cursor-pointer
                       file:transition-colors" />
            </div>

            <!-- Confirm button appears only when file is selected -->
            <div class="flex justify-end gap-3 pt-4" v-if="avatarFile">
              <button @click="showAvatarModal = false" class="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 
                       text-white rounded-lg transition-colors">
                {{ t('admin.avatarModal.cancel') }}
              </button>
              <button @click="showAvatarConfirm = true" class="px-5 py-2.5 bg-green-600 hover:bg-green-700 
                       text-white rounded-lg transition-colors">
                {{ t('admin.avatarModal.apply') }}
              </button>
            </div>

            <!-- Just cancel when no file selected -->
            <div class="flex justify-end gap-3 pt-4" v-else>
              <button @click="showAvatarModal = false" class="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 
                       text-white rounded-lg transition-colors">
                {{ t('admin.avatarModal.cancel') }}
              </button>
            </div>
          </template>

          <!-- Cropper view -->
          <template v-else>
            <div class="w-full mb-6">
              <div class="bg-black/30 rounded-xl p-4 mb-4">
                <div class="h-72">
                  <Cropper ref="cropperRef" :src="imageUrl" :stencil-props="{
                    aspectRatio: 1,
                  }" class="cropper" />
                </div>
              </div>

              <div class="flex justify-end gap-3">
                <button @click="cancelCrop" class="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 
                         text-white rounded-lg transition-colors">
                  {{ t('admin.avatarModal.cancel') }}
                </button>
                <button @click="handleCrop" class="px-5 py-2.5 bg-green-600 hover:bg-green-700 
                         text-white rounded-lg transition-colors">
                  {{ t('admin.avatarModal.apply') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Confirm Avatar Dialog -->
    <ConfirmDialog 
      :show="showAvatarConfirm"
      :title="t('admin.avatarModal.title')"
      :message="t('admin.avatarModal.confirmMessage')"
      :confirmText="t('admin.confirmDialog.confirm')"
      type="update"
      @confirm="confirmAvatarUpdate" 
      @cancel="showAvatarConfirm = false" 
    />
  </div>
</template>

<style scoped>
/* Common layout styles */
.admin-view {
  display: flex !important;
  flex-direction: column !important;
  min-height: 100vh !important;
  height: auto !important;
  overflow-x: hidden !important;
}

/* PageMain overrides */
:deep(.page-main) {
  min-height: 0 !important;
  height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important;
}

/* Table container */
[ref="tableContainer"] {
  height: auto !important;
  min-height: 200px !important;
  overflow: auto !important;
  flex: 1 !important;
}

/* Z-index system */
.z-base { z-index: var(--z-base); }
.z-content { z-index: var(--z-content); }
.z-modal { z-index: var(--z-modal); }
.z-dialog { z-index: var(--z-dialog); }

/* Backdrop styling */
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
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

/* Mobile optimizations */
@media (max-width: 640px) {
  button,
  input,
  select {
    min-height: 44px;
  }
}
</style>
