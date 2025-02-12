<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import { ref, onMounted } from 'vue'

interface User {
  id: number
  username: string
  email: string
  role: string
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

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

onMounted(fetchUsers)
</script>

<template>
  <PageHeader />
  <PageMain>
    <div class="w-full p-6">
      <h1 class="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div v-if="loading" class="text-white">Loading...</div>
      <div v-else-if="error" class="text-red-400">{{ error }}</div>
      <div v-else class="space-y-6">
        <div class="bg-black/40 rounded-xl p-6">
          <h2 class="text-xl text-white mb-4">User Management</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-gray-300">
              <thead class="text-left border-b border-gray-700">
                <tr>
                  <th class="py-3 px-4">ID</th>
                  <th class="py-3 px-4">Username</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-b border-gray-800">
                  <td class="py-3 px-4">{{ user.id }}</td>
                  <td class="py-3 px-4">{{ user.username }}</td>
                  <td class="py-3 px-4">{{ user.email }}</td>
                  <td class="py-3 px-4">{{ user.role }}</td>
                  <td class="py-3 px-4">
                    <button class="text-green-400 hover:text-green-300 mr-2">Edit</button>
                    <button class="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </PageMain>
</template>
