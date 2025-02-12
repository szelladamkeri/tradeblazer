<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const handleRegister = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  error.value = null

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords don't match"
    loading.value = false
    return
  }

  try {
    console.log('Sending registration request...')
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()
    console.log('Registration response:', data)

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    // Success - redirect to login
    router.push('/login')
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageHeader />
  <PageMain>
    <div class="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
      <div class="max-w-md w-full px-4 py-8 sm:px-6">
        <div class="text-center">
          <h2 class="text-white text-2xl sm:text-3xl font-bold mb-2">Create Your Account</h2>
          <p class="text-gray-400 text-sm sm:text-base">
            Join TradeBlazer and start your trading journey
          </p>
        </div>

        <form @submit="handleRegister" class="space-y-6">
          <div v-if="error" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg">
            {{ error }}
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Username</label>
              <input
                v-model="username"
                type="text"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Password</label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Confirm Password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full p-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <div class="text-center text-gray-400">
            <span>Already have an account? </span>
            <router-link to="/login" class="text-green-500 hover:text-green-400">Login</router-link>
          </div>
        </form>
      </div>
    </div>
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
</style>
