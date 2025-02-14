<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const userStore = useUserStore()

const isEmailOrUsernameValid = computed(() => email.value?.length >= 3)
const isPasswordValid = computed(() => password.value?.length >= 6)
const isFormValid = computed(() => isEmailOrUsernameValid.value && isPasswordValid.value)

const handleLogin = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  error.value = null

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: email.value, // Make sure this matches the backend parameter name
        password: password.value,
      }),
    })

    let data
    try {
      const text = await response.text()
      data = JSON.parse(text)
    } catch (parseError) {
      throw new Error('Server returned invalid JSON')
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Login failed')
    }

    localStorage.setItem('user', JSON.stringify(data))
    userStore.setUser(data.user)
    router.push('/')
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Connection error - please check if the server is running'
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
        <div class="space-y-8">
          <div class="text-center">
            <h2 class="text-white text-2xl sm:text-3xl font-bold mb-2">Login to TradeBlazer</h2>
            <p class="text-gray-400">Enter your credentials to access your account</p>
          </div>

          <form @submit="handleLogin" class="space-y-6">
            <div class="min-h-[48px] transition-all duration-200" v-if="error">
              <div class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg">
                {{ error }}
              </div>
            </div>

            <div class="space-y-2">
              <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                <span>Email or Username</span>
                <transition name="fade">
                  <font-awesome-icon
                    v-if="email && isEmailOrUsernameValid"
                    icon="check-circle"
                    class="text-green-400 ml-2"
                  />
                </transition>
              </label>
              <input
                type="text"
                v-model="email"
                required
                :class="[
                  'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                  email
                    ? isEmailOrUsernameValid
                      ? 'border-green-500'
                      : 'border-red-500'
                    : 'border-gray-600',
                ]"
                placeholder="Enter your email or username"
              />
            </div>

            <div class="space-y-2">
              <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                <span>Password</span>
                <transition name="fade">
                  <font-awesome-icon
                    v-if="password && isPasswordValid"
                    icon="check-circle"
                    class="text-green-400 ml-2"
                  />
                </transition>
              </label>
              <input
                type="password"
                v-model="password"
                required
                :class="[
                  'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                  password
                    ? isPasswordValid
                      ? 'border-green-500'
                      : 'border-red-500'
                    : 'border-gray-600',
                ]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              :disabled="!isFormValid || loading"
              :class="[
                'w-full p-3 rounded-lg text-white font-medium transition-all duration-200',
                isFormValid
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed opacity-50',
              ]"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>

            <div class="text-center text-gray-400">
              <span>Don't have an account? </span>
              <router-link to="/register" class="text-green-500 hover:text-green-400"
                >Register</router-link
              >
            </div>
          </form>
        </div>
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

<style scoped>
body {
  background-image: url();
  background-color: var(--vt-c-black-mute);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
