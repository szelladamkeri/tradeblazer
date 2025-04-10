<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import CheckIcon from '@/components/CheckIcon.vue' // Import the new component
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

const verificationNeeded = ref(false)
const verificationEmail = ref('')
const resendingVerification = ref(false)
const resendSuccess = ref(false)
const resendError = ref<string | null>(null)

const handleLogin = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  error.value = null
  verificationNeeded.value = false

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {  // Updated endpoint
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
      // Check if this is a verification needed error
      if (response.status === 403 && data?.verification_needed) {
        verificationNeeded.value = true
        verificationEmail.value = email.value
        return
      }
      throw new Error(data?.message || 'Login failed')
    }

    // Let userStore handle data persistence and state management
    userStore.setUser(data.user, data.token)
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

const resendVerification = async () => {
  if (resendingVerification.value || !verificationEmail.value) return

  resendingVerification.value = true
  resendError.value = null
  resendSuccess.value = false

  try {
    const response = await fetch('http://localhost:3000/api/verification/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: verificationEmail.value
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to resend verification email')
    }

    resendSuccess.value = true
  } catch (err) {
    console.error('Resend verification error:', err)
    resendError.value = err instanceof Error ? err.message : 'Failed to resend verification email'
  } finally {
    resendingVerification.value = false
  }
}

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement;
  const rect = main.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  main.style.setProperty('--mouse-x', `${x}%`);
  main.style.setProperty('--mouse-y', `${y}%`);
};
</script>

<template>
  <div class="login-view view-container">
    <PageHeader @mousemove="handleMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
        <div class="max-w-md w-full px-4 py-8 sm:px-6">
          <!-- Verification Needed View -->
          <div v-if="verificationNeeded" class="space-y-6">
            <div class="text-center">
              <font-awesome-icon icon="envelope" class="text-yellow-500 text-5xl mb-4" />
              <h2 class="text-white text-2xl sm:text-3xl font-bold mb-2">Verify Your Email</h2>
              <p class="text-gray-400 text-sm sm:text-base mb-4">
                Your account needs verification. Please check your email at <span class="text-green-500 font-medium">{{
                  verificationEmail }}</span>
              </p>
              <p class="text-gray-400 text-sm">
                Click the verification link we sent to activate your account.
              </p>
            </div>

            <!-- Resend verification section -->
            <div class="mt-8 border-t border-white/10 pt-6">
              <p class="text-gray-400 text-sm mb-4 text-center">
                Didn't receive the email? Check your spam folder or resend it.
              </p>

              <div v-if="resendSuccess"
                class="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded-lg mb-4 text-center">
                Verification email resent successfully!
              </div>

              <div v-if="resendError" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg mb-4 text-center">
                {{ resendError }}
              </div>

              <button @click="resendVerification" :disabled="resendingVerification"
                class="w-full p-3 rounded-lg text-white font-medium transition-all duration-200"
                :class="resendingVerification ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700'">
                {{ resendingVerification ? 'Sending...' : 'Resend Verification Email' }}
              </button>
            </div>

            <div class="text-center text-gray-400 mt-4">
              <button @click="verificationNeeded = false" class="text-green-500 hover:text-green-400">
                Back to Login
              </button>
            </div>
          </div>

          <!-- Regular Login View -->
          <div v-else>
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
                      <CheckIcon v-if="email && isEmailOrUsernameValid" class="text-green-400 ml-2" />
                    </transition>
                  </label>
                  <input type="text" v-model="email" required :class="[
                    'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                    email
                      ? isEmailOrUsernameValid
                        ? 'border-green-500'
                        : 'border-red-500'
                      : 'border-gray-600',
                  ]" placeholder="Enter your email or username" />
                </div>

                <div class="space-y-2">
                  <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                    <span>Password</span>
                    <transition name="fade">
                      <CheckIcon v-if="password && isPasswordValid" class="text-green-400 ml-2" />
                    </transition>
                  </label>
                  <input type="password" v-model="password" required :class="[
                    'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                    password
                      ? isPasswordValid
                        ? 'border-green-500'
                        : 'border-red-500'
                      : 'border-gray-600',
                  ]" placeholder="Enter your password" />
                </div>

                <button type="submit" :disabled="!isFormValid || loading" :class="[
                  'w-full p-3 rounded-lg text-white font-medium transition-all duration-200',
                  isFormValid
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 cursor-not-allowed opacity-50',
                ]">
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>

                <div class="text-center text-gray-400">
                  <span>Don't have an account? </span>
                  <router-link to="/register" class="text-green-500 hover:text-green-400">Register</router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
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

/* Add interactive gradient effect */
:deep(.page-main)::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(74, 222, 128, 0.08) 0%,
      transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 1;
  border-radius: 0.75rem;
}

:deep(.page-main):hover::after {
  opacity: 1;
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

/* Remove duplicate page-header styles as they're now handled by the PageHeader component */
/*
.page-header {
  height: 4rem;
  width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto;
  margin-bottom: 1rem !important;
}

@media (max-width: 1400px) {
  .page-header {
    width: 95vw !important;
    max-width: 1366px !important;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 90vw !important;
    max-width: 1024px !important;
  }
}

@media (max-width: 640px) {
  .page-header {
    height: 3.5rem;
    width: calc(100vw - 2rem) !important;
  }
}
*/
</style>