<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { validateUsername, validateEmail, validatePassword } from '@/utils/validation'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const isUsernameValid = computed(() => !validateUsername(username.value))
const isEmailValid = computed(() => !validateEmail(email.value))
const isPasswordValid = computed(() => !validatePassword(password.value))
const isConfirmPasswordValid = computed(
  () => password.value === confirmPassword.value && confirmPassword.value,
)

const isFormValid = computed(
  () =>
    isUsernameValid.value &&
    isEmailValid.value &&
    isPasswordValid.value &&
    isConfirmPasswordValid.value,
)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = null

  // Validate all fields
  const usernameError = validateUsername(username.value)
  if (usernameError) {
    error.value = usernameError
    return
  }

  const emailError = validateEmail(email.value)
  if (emailError) {
    error.value = emailError
    return
  }

  const passwordError = validatePassword(password.value)
  if (passwordError) {
    error.value = passwordError
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

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

        <form @submit="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg">
            {{ error }}
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                <span>Username</span>
                <transition name="fade">
                  <font-awesome-icon
                    v-if="username && isUsernameValid"
                    icon="check-circle"
                    class="text-green-400 ml-2"
                  />
                </transition>
              </label>
              <input
                v-model="username"
                type="text"
                required
                :class="[
                  'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                  username
                    ? isUsernameValid
                      ? 'border-green-500'
                      : 'border-red-500'
                    : 'border-gray-600',
                ]"
              />
            </div>

            <div class="space-y-2">
              <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                <span>Email</span>
                <transition name="fade">
                  <font-awesome-icon
                    v-if="email && isEmailValid"
                    icon="check-circle"
                    class="text-green-400 ml-2"
                  />
                </transition>
              </label>
              <input
                v-model="email"
                type="email"
                required
                :class="[
                  'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                  email
                    ? isEmailValid
                      ? 'border-green-500'
                      : 'border-red-500'
                    : 'border-gray-600',
                ]"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Password</label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-gray-200 text-sm font-medium">Confirm Password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
              />
            </div>
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
