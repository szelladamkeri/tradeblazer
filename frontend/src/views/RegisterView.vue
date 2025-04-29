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
const full_name = ref('')  // Added full name field
const address = ref('')    // Added address field
const error = ref<string | null>(null)
const loading = ref(false)

const isUsernameValid = computed(() => !validateUsername(username.value))
const isEmailValid = computed(() => !validateEmail(email.value))
const isPasswordValid = computed(() => !validatePassword(password.value))
const isConfirmPasswordValid = computed(
  () => password.value === confirmPassword.value && confirmPassword.value,
)
const isFullNameValid = computed(() => full_name.value.trim().length >= 3)  // Simple validation for full name
const isAddressValid = computed(() => address.value.trim().length >= 5)    // Simple validation for address

const isFormValid = computed(
  () =>
    isUsernameValid.value &&
    isEmailValid.value &&
    isPasswordValid.value &&
    isConfirmPasswordValid.value &&
    isFullNameValid.value &&   // Added to form validation
    isAddressValid.value,      // Added to form validation
)

// Add registration success state
const registrationSuccess = ref(false)
const registeredEmail = ref('')

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

  if (full_name.value.trim().length < 3) {
    error.value = 'Full name must be at least 3 characters'
    return
  }

  if (address.value.trim().length < 5) {
    error.value = 'Please enter a valid address'
    return
  }

  loading.value = true

  try {
    console.log('Sending registration request...')
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username.value,
        email: email.value,
        password: password.value,
        full_name: full_name.value,  // Added full_name to the request
        address: address.value,       // Added address to the request
      }),
    })

    const data = await response.json()
    console.log('Registration response:', data)

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    // Show verification needed screen instead of redirecting
    registrationSuccess.value = true
    registeredEmail.value = email.value
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}

// Add resend verification function
const resendingVerification = ref(false)
const resendSuccess = ref(false)
const resendError = ref<string | null>(null)

const resendVerification = async () => {
  if (resendingVerification.value || !registeredEmail.value) return

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
        email: registeredEmail.value
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

// Add FAQ toggle state
const showFAQ = ref(false)
</script>

<template>
  <div class="register-view view-container">
    <PageHeader @mousemove="handleMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove" class="flex-grow">
      <div class="w-full px-4 py-8 overflow-auto">
        <div class="max-w-4xl mx-auto">
          <div class="pb-8">
            <!-- Registration Form Card -->
            <div class="bg-white/10 rounded-xl p-6 border border-white/10">
              <!-- Registration Success View -->
              <div v-if="registrationSuccess" class="space-y-6">
                <div class="text-center">
                  <font-awesome-icon icon="check-circle" class="text-green-500 text-5xl mb-4" />
                  <h2 class="text-white text-2xl sm:text-3xl font-bold mb-2">Verify Your Email</h2>
                  <p class="text-gray-400 text-sm sm:text-base mb-4">
                    We've sent a verification link to <span class="text-green-500 font-medium">{{ registeredEmail
                    }}</span>
                  </p>
                  <p class="text-gray-400 text-sm">
                    Please check your inbox and click the verification link to activate your account.
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
                  <span>Already verified? </span>
                  <router-link to="/login" class="text-green-500 hover:text-green-400">Login</router-link>
                </div>
              </div>

              <!-- Registration Form -->
              <div v-else>
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

                  <!-- Two-column form layout -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Username Field - Column 1 -->
                    <div class="space-y-2">
                      <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                        <span>Username</span>
                        <transition name="fade">
                          <font-awesome-icon v-if="username && isUsernameValid" icon="check-circle"
                            class="text-green-400 ml-2" />
                        </transition>
                      </label>
                      <input v-model="username" type="text" required :class="[
                        'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                        username
                          ? isUsernameValid
                            ? 'border-green-500'
                            : 'border-red-500'
                          : 'border-gray-600',
                      ]" />
                    </div>

                    <!-- Email Field - Column 2 -->
                    <div class="space-y-2">
                      <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                        <span>Email</span>
                        <transition name="fade">
                          <font-awesome-icon v-if="email && isEmailValid" icon="check-circle"
                            class="text-green-400 ml-2" />
                        </transition>
                      </label>
                      <input v-model="email" type="email" required :class="[
                        'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                        email
                          ? isEmailValid
                            ? 'border-green-500'
                            : 'border-red-500'
                          : 'border-gray-600',
                      ]" />
                    </div>

                    <!-- Full Name Field - Column 1 -->
                    <div class="space-y-2">
                      <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                        <span>Full Name</span>
                        <transition name="fade">
                          <font-awesome-icon v-if="full_name && isFullNameValid" icon="check-circle"
                            class="text-green-400 ml-2" />
                        </transition>
                      </label>
                      <input v-model="full_name" type="text" required placeholder="Enter your full name" :class="[
                        'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors',
                        full_name
                          ? isFullNameValid
                            ? 'border-green-500'
                            : 'border-red-500'
                          : 'border-gray-600',
                      ]" />
                    </div>

                    <!-- Password Field - Column 2 -->
                    <div class="space-y-2">
                      <label class="block text-gray-200 text-sm font-medium">Password</label>
                      <input v-model="password" type="password" required
                        class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20" />
                    </div>

                    <!-- Address Field - Full Width -->
                    <div class="space-y-2 md:col-span-2">
                      <label class="flex items-center justify-between text-gray-200 text-sm font-medium">
                        <span>Address</span>
                        <transition name="fade">
                          <font-awesome-icon v-if="address && isAddressValid" icon="check-circle"
                            class="text-green-400 ml-2" />
                        </transition>
                      </label>
                      <textarea v-model="address" required placeholder="Your full address" :class="[
                        'w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500/20 transition-colors resize-none',
                        address
                          ? isAddressValid
                            ? 'border-green-500'
                            : 'border-red-500'
                          : 'border-gray-600',
                      ]" rows="2"></textarea>
                    </div>

                    <!-- Confirm Password Field - Full Width -->
                    <div class="space-y-2 md:col-span-2">
                      <label class="block text-gray-200 text-sm font-medium">Confirm Password</label>
                      <input v-model="confirmPassword" type="password" required
                        class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20" />
                    </div>
                  </div>

                  <button type="submit" :disabled="!isFormValid || loading" :class="[
                    'w-full p-3 rounded-lg text-white font-medium transition-all duration-200 mt-4',
                    isFormValid
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 cursor-not-allowed opacity-50',
                  ]">
                    {{ loading ? 'Creating Account...' : 'Create Account' }}
                  </button>

                  <div class="text-center text-gray-400">
                    <span>Already have an account? </span>
                    <router-link to="/login" class="text-green-500 hover:text-green-400">Login</router-link>
                  </div>

                  <!-- New help section -->
                  <div class="mt-6 pt-6 border-t border-white/10 text-center">
                    <p class="text-gray-400 text-sm mb-2">Need help with registration?</p>
                    <div class="flex justify-center space-x-4">
                      <a href="mailto:support@tradeblazer.com"
                        class="text-green-500 hover:text-green-400 text-sm flex items-center">
                        <font-awesome-icon icon="envelope" class="mr-1" />
                        <span>Email Support</span>
                      </a>
                      <a href="#" @click.prevent="showFAQ = !showFAQ"
                        class="text-green-500 hover:text-green-400 text-sm flex items-center">
                        <font-awesome-icon icon="question-circle" class="mr-1" />
                        <span>FAQ</span>
                      </a>
                    </div>
                  </div>

                  <!-- FAQ Panel -->
                  <div v-if="showFAQ" class="bg-white/5 p-4 rounded-lg mt-3 text-sm">
                    <h3 class="text-white font-medium mb-3">Frequently Asked Questions</h3>
                    <div class="space-y-3">
                      <div>
                        <p class="text-green-400 font-medium">How does the verification process work?</p>
                        <p class="text-gray-300 mt-1">After registration, we'll send a verification email to your
                          address.
                          Click the link in the email to activate your account.</p>
                      </div>
                      <div>
                        <p class="text-green-400 font-medium">I didn't receive a verification email</p>
                        <p class="text-gray-300 mt-1">Check your spam folder or use the "Resend Verification Email"
                          option
                          on the verification page.</p>
                      </div>
                      <div>
                        <p class="text-green-400 font-medium">What if I need further assistance?</p>
                        <p class="text-gray-300 mt-1">Contact our support team at support@tradeblazer.com and we'll help
                          you
                          resolve any issues.</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
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

/* Media query adjustments for smaller screens */
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

/* CLEAN UP: Remove all duplicate and conflicting styles - ONLY keep these critical styles */
:deep(.page-main) {
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: auto;
  overflow: visible;
}

.view-container {
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
}

/* Add flex-grow to ensure expansion */
.flex-grow {
  flex: 1;
}

/* Mobile adjustments */
@media (max-width: 640px) {

  /* Ensure proper spacing on small screens */
  .pb-8 {
    padding-bottom: 4rem;
  }
}
</style>