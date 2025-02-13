<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EditUserModal from '@/components/EditUserModal.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at?: string // Add this
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
    users.value = await response.json()
  } catch (err) {
    error.value = 'Error loading users'
  } finally {
    loading.value = false
  }
}

const handleDeleteUser = async (userId: number) => {
  if (!confirm('Are you sure you want to delete this user?')) {
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete user')
    users.value = users.value.filter((user) => user.id !== userId)
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

onMounted(fetchUsers)
</script>

<template>
  <div class="flex flex-col">
    <PageHeader />
    <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto">
      <div class="w-full p-4 sm:p-8">
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
          <div class="bg-white/5 rounded-xl p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
              <font-awesome-icon icon="users" class="text-green-400" />
              <h2 class="text-xl text-white font-semibold">User Management</h2>
            </div>

            <div class="overflow-x-auto -mx-4 sm:mx-0">
              <div class="min-w-[700px] px-4 sm:px-0">
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
                            @click="handleDeleteUser(user.id)"
                          >
                            <font-awesome-icon icon="trash" />
                          </button>
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
  </div>

  <EditUserModal
    :show="showEditModal"
    :user="selectedUser"
    :current-user-id="userStore.user?.id"
    @close="showEditModal = false"
    @save="handleSaveUser"
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

/* Add smooth scrolling for mobile */
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
</style>
