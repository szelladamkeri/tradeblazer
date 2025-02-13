<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  user: {
    id: number
    username: string
    email: string
    role: string
  } | null
  currentUserId: number | undefined
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'save'])

const username = ref('')
const email = ref('')
const role = ref('')

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      username.value = newUser.username
      email.value = newUser.email
      role.value = newUser.role
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (!props.user) return

  emit('save', {
    id: props.user.id,
    username: username.value,
    email: email.value,
    role: role.value,
  })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
      <div class="fixed inset-0 transition-opacity">
        <div class="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
      </div>

      <div
        class="bg-black/90 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full backdrop-blur-xl border border-green-500/20"
      >
        <form @submit.prevent="handleSubmit" class="p-6">
          <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="user-pen" class="text-green-400" />
            Edit User
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <input
                v-model="username"
                type="text"
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>

            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                v-model="email"
                type="email"
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>

            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Role</label>
              <select
                v-model="role"
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              >
                <option value="A" class="bg-gray-900">Admin</option>
                <option value="U" class="bg-gray-900">User</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
