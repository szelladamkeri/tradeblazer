<template>
  <!-- First check API heartbeat status -->
  <FullPageError v-if="!isApiAvailable && apiError" :message="apiError.message" :error-type="apiError.type"
    @retry="checkApiHeartbeat" />

  <!-- Then check for other errors -->
  <FullPageError v-else-if="pageError" :message="pageError.message" :error-type="pageError.type" @retry="retryAction" />

  <!-- Only render normal page when there's no error -->
  <div v-else class="deposit-view view-container">
    <PageHeader @mousemove="handleHeaderMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white/10 rounded-xl p-6 border border-white/10">
            <div class="flex items-center gap-3 mb-6">
              <font-awesome-icon icon="money-bill-transfer" class="text-green-400 text-2xl" />
              <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('deposit.title') }}</h1>
            </div>

            <div v-if="loading" class="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>

            <form v-else @submit.prevent="handleDeposit" class="space-y-6">
              <div v-if="error" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg text-sm">
                {{ error }}
              </div>
              <div v-if="successMessage" class="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded-lg text-sm">
                {{ successMessage }}
              </div>

              <div>
                <label for="amount" class="block text-sm font-medium text-gray-300 mb-1">
                  {{ t('deposit.amount') }} (USD)
                </label>
                <input type="number" id="amount" v-model.number="amount" min="1" step="0.01" required
                  class="w-full p-3 rounded-lg bg-white/5 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring focus:ring-green-500/20"
                  :placeholder="t('deposit.enterAmount')" />
                <p v-if="amount && amount < 1" class="text-red-400 text-xs mt-1">{{ t('deposit.minAmountError') }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  {{ t('deposit.paymentMethod') }}
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
                 <p v-if="!selectedMethod && formTouched" class="text-red-400 text-xs mt-1">{{ t('deposit.selectMethodError') }}</p>
              </div>

              <div class="border-t border-white/10 pt-4">
                <p class="text-sm text-gray-400 mb-1">{{ t('deposit.summary') }}:</p>
                <p class="text-lg text-white font-medium">{{ t('deposit.depositAmount') }}: {{ formatCurrency(amount ?? 0) }}</p>
                <p class="text-xs text-gray-500">{{ t('deposit.feeInfo') }}</p>
              </div>

              <button type="submit" :disabled="!isFormValid || submitting" :class="[
                'w-full p-3 rounded-lg text-white font-medium transition-all duration-200 mt-4 flex items-center justify-center gap-2',
                isFormValid && !submitting
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed opacity-50',
              ]">
                <LoadingSpinner v-if="submitting" class="w-5 h-5" />
                <span>{{ submitting ? t('deposit.processing') : t('deposit.confirmDeposit') }}</span>
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
import { useCurrencyFormatter } from '@/utils/formatters'; // Import the currency formatter
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // Keep this component import

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
const { formatCurrency } = useCurrencyFormatter(); // Instantiate the formatter

const amount = ref<number | null>(null);
const selectedMethod = ref<string | null>(null);
const loading = ref(false); // For initial page load/data fetching if needed
const submitting = ref(false); // For form submission state
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const pageError = ref<{ message: string; type: string } | null>(null); // For critical page errors
const formTouched = ref(false); // Track if the form has been interacted with

const paymentMethods = ref([
  { id: 'credit_card', name: t('deposit.creditCard'), icon: 'credit-card' },
  { id: 'bank_transfer', name: t('deposit.bankTransfer'), icon: 'building-columns' },
  { id: 'paypal', name: t('deposit.paypal'), icon: ['fab', 'paypal'] }
  // Removed Skrill { id: 'skrill', name: t('deposit.skrill'), icon: 'money-check-dollar' }
]);

const { isApiAvailable, apiError, checkApiHeartbeat } = useApiHeartbeat();

const isLoggedIn = computed(() => userStore.isAuthenticated);

const isFormValid = computed(() => {
  return amount.value !== null && amount.value >= 1 && selectedMethod.value !== null;
});

const handleDeposit = async () => {
  formTouched.value = true;
  if (!isFormValid.value || submitting.value) return;

  submitting.value = true;
  error.value = null;
  successMessage.value = null;

  // --- Payment Method Specific Logic ---
  // TODO: Implement actual payment processing logic here based on selectedMethod.value
  // This will likely involve:
  // 1. Conditional rendering of forms for card details or bank info.
  // 2. Using a payment gateway SDK (Stripe, Braintree, PayPal SDK).
  // 3. Handling redirects/callbacks for methods like PayPal.
  // 4. Sending payment tokens/details securely to the backend for processing.
  // The current fetch call is likely a placeholder for recording the deposit *after* successful payment.

  console.log(`Initiating deposit of $${amount.value} via ${selectedMethod.value}`);

  // Example placeholder logic:
  if (selectedMethod.value === 'credit_card') {
    // TODO: Show card form, use Stripe Elements/SDK, get token, send to backend
    console.warn('Credit Card processing not implemented.');
  } else if (selectedMethod.value === 'bank_transfer') {
    // TODO: Show bank details/instructions, potentially use Plaid or similar
    console.warn('Bank Transfer processing not implemented.');
  } else if (selectedMethod.value === 'paypal') {
    // TODO: Redirect to PayPal or use PayPal SDK
    console.warn('PayPal processing not implemented.');
  }

  // --- Current Placeholder Backend Call ---
  // This call might need to happen *after* successful payment confirmation from the gateway
  try {
    const response = await fetch('http://localhost:3000/api/portfolio/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        userId: userStore.user?.id,
        amount: amount.value,
        method: selectedMethod.value, // Include method if backend uses it
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to process deposit. Please try again.' }));
      // If payment gateway interaction failed earlier, this backend call might not even be reached
      // or might need different error handling.
      throw new Error(errorData.message || 'Deposit failed');
    }

    const result = await response.json();
    successMessage.value = t('deposit.successMessage', { amount: amount.value?.toFixed(2) });
    amount.value = null; // Reset amount
    selectedMethod.value = null; // Reset method
    formTouched.value = false; // Reset touch state
    await userStore.refreshUser(); // Corrected: Use refreshUser instead of refreshBalance

    // Optionally redirect or show persistent success state
    // setTimeout(() => router.push('/portfolio'), 3000);

  } catch (err) {
    console.error('Deposit error:', err);
    const processedError = handleApiError(err);
    error.value = processedError.message; // Show error to the user
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

// Add mouse move tracking for the header gradient effect (copied)
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
  // Add logic to retry the primary action, e.g., fetching initial data if needed
  // For now, just clears the error
};

onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }
  // Initial data fetching if required, e.g., available deposit methods
  // setLoading(true) ... setLoading(false)
});

</script>

<style scoped>
/* Add styles consistent with other views, e.g., scrollbar */
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

/* Ensure view container takes full height */
.deposit-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Ensure PageMain content area scrolls */
:deep(.page-main) {
  flex: 1;
  overflow: hidden; /* Prevent PageMain itself from scrolling */
}

.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Style adjustments for form elements if needed */
input[type="number"] {
  appearance: textfield; /* Standard property */
  -moz-appearance: textfield; /* Firefox */
  -moz-appearance: textfield; /* Firefox */
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0; /* Safari and Chrome */
}
</style>