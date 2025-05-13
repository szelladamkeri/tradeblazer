<template>
  <!-- First check API heartbeat status -->
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />

  <!-- Then check for other errors -->
  <FullPageError v-else-if="pageError" :message="pageError.message" :error-type="pageError.type" @retry="retryAction" />

  <!-- Only render normal page when there's no error -->
  <div v-else class="withdraw-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white/10 rounded-xl p-6 border border-white/10">
            <div class="flex items-center gap-3 mb-6">
              <font-awesome-icon icon="money-bill-wave" class="text-green-400 text-2xl" />
              <h1 class="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
            </div>

            <div v-if="loading" class="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>

            <form v-else @submit.prevent="handleWithdraw" class="space-y-6">
              <div v-if="error" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg text-sm">
                {{ error }}
              </div>
              <div v-if="successMessage" class="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded-lg text-sm">
                {{ successMessage }}
              </div>

              <div>
                <label for="amount" class="block text-sm font-medium text-gray-300 mb-1">
                  Amount (USD)
                </label>
                <input type="number" id="amount" v-model.number="amount" min="1" :max="availableBalance" step="0.01" required
                  class="w-full p-3 rounded-lg bg-white/5 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
                  placeholder="Enter amount to withdraw" />
                <div class="flex justify-between mt-1">
                                  <p v-if="amount && amount < 1" class="text-yellow-400 text-xs">Minimum withdrawal is $1.00</p>
                <p v-else-if="amount && amount > availableBalance" class="text-yellow-400 text-xs">Exceeds available balance</p>
                  <p class="text-xs text-gray-400">Available: ${{ formatCurrency(availableBalance) }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Withdrawal Method
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" v-for="method in paymentMethods" :key="method.id" @click="selectedMethod = method.id"
                    :class="[
                      'p-3 rounded-lg border text-left transition-colors flex items-center gap-3',
                      selectedMethod === method.id
                        ? 'bg-green-500/20 border-green-500 text-white'
                        : 'bg-white/5 border-gray-600 text-gray-300 hover:bg-white/10 hover:border-gray-500'
                    ]">
                    <font-awesome-icon :icon="method.icon" class="w-5 h-5" />
                    <span>{{ method.name }}</span>
                  </button>
                </div>
                <p v-if="!selectedMethod && formTouched" class="text-yellow-400 text-xs mt-1">Please select a withdrawal method</p>
              </div>

              <div class="border-t border-white/10 pt-4">
                <p class="text-sm text-gray-400 mb-1">Summary:</p>
                <p class="text-lg text-white font-medium">Withdrawal Amount: {{ formatCurrency(amount ?? 0) }}</p>
                <p class="text-xs text-gray-500">A small processing fee may apply depending on your withdrawal method.</p>
              </div>

              <button type="submit" :disabled="!isFormValid || submitting" :class="[
                'w-full p-3 rounded-lg text-white font-medium transition-all duration-200 mt-4 flex items-center justify-center gap-2',
                isFormValid && !submitting
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed opacity-50',
              ]">
                <LoadingSpinner v-if="submitting" class="w-5 h-5" />
                <span>{{ submitting ? 'Processing...' : 'Confirm Withdrawal' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import PageMain from '@/components/PageMain.vue';
import PageHeader from '@/components/PageHeader.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import FullPageError from '@/components/FullPageError.vue';
import { handleApiError } from '@/utils/errorHandler';
import { useApiHeartbeat } from '@/composables/useApiHeartbeat';
import { useI18n } from 'vue-i18n';
import { useCurrencyFormatter } from '@/utils/formatters';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
const { formatCurrency } = useCurrencyFormatter();

const amount = ref<number | null>(null);
const selectedMethod = ref<string | null>(null);
const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const pageError = ref<{ message: string; type: string } | null>(null);
const formTouched = ref(false);

const paymentMethods = ref([
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'building-columns' },
  { id: 'paypal', name: 'PayPal', icon: ['fab', 'paypal'] }
]);

const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat();

const isLoggedIn = computed(() => userStore.isAuthenticated);
const availableBalance = computed(() => userStore.user?.balance || 0);

const isFormValid = computed(() => {
  return amount.value !== null && 
         amount.value >= 1 && 
         amount.value <= availableBalance.value && 
         selectedMethod.value !== null;
});

const handleWithdraw = async () => {
  formTouched.value = true;
  if (!isFormValid.value || submitting.value) return;

  submitting.value = true;
  error.value = null;
  successMessage.value = null;

  console.log(`Initiating withdrawal of $${amount.value} via ${selectedMethod.value}`);

  try {
    const response = await fetch('http://localhost:3000/api/portfolio/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        userId: userStore.user?.id,
        amount: amount.value,
        method: selectedMethod.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to process withdrawal. Please try again.' }));
      throw new Error(errorData.message || 'Withdrawal failed');
    }

    const result = await response.json();
    const withdrawalAmount = amount.value;
    successMessage.value = `Successfully initiated withdrawal of $${withdrawalAmount?.toFixed(2)}. Please allow 1-3 business days for processing.`;

    // Reset form
    amount.value = null;
    selectedMethod.value = null;
    formTouched.value = false;

    // Refresh user data
    await userStore.refreshUser();
    
    // Update portfolio data
    if (userStore.user) {
      try {
        const portfolioResponse = await fetch(`http://localhost:3000/api/portfolio/${userStore.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.token}`,
          },
        });
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          userStore.user.balance = portfolioData.balance;
          localStorage.setItem('user', JSON.stringify({ 
            user: userStore.user,
            token: userStore.token 
          }));
        }
      } catch (portfolioError) {
        console.error('Error fetching portfolio data after withdrawal:', portfolioError);
      }
    }
  } catch (err) {
    console.error('Withdrawal error:', err);
    const processedError = handleApiError(err);
    error.value = processedError.message;
  } finally {
    submitting.value = false;
  }
};

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement;
  const rect = main.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  main.style.setProperty('--mouse-x', `${x}%`);
  main.style.setProperty('--mouse-y', `${y}%`);
};

// Add mouse move tracking for the header gradient effect
const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

// Retry action for FullPageError
const retryAction = () => {
  pageError.value = null;
};

onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }
});
</script>

<style scoped>
/* Scrollbar styling */
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

/* View container */
.withdraw-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Page main content */
:deep(.page-main) {
  flex: 1;
  overflow: hidden;
}

.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Form elements */
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style> 