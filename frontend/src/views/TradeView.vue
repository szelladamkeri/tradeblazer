<template>
  <div class="flex flex-col">
    <PageHeader class="mb-4" />
    <PageMain>
      <div class="w-full h-full overflow-y-auto px-2 sm:px-4 py-4">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>

        <div v-else-if="error" class="text-red-500 text-center py-4 animate-bounce-slow">
          {{ error }}
        </div>

        <div v-else-if="asset" class="space-y-6">
          <div class="bg-white/10 p-6 rounded-xl border border-white/10">
            <h2 class="text-2xl font-bold text-white mb-4">{{ asset.name }} ({{ asset.symbol }})</h2>
            <div class="text-green-400 text-3xl font-bold">
              ${{ formatPrice(asset.price) }}
            </div>
          </div>

          <div class="bg-white/10 p-6 rounded-xl border border-white/10" v-if="isLoggedIn">
            <h3 class="text-xl font-bold text-white mb-4">Trade Asset</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-200 text-sm font-medium mb-2">Trade Type</label>
                <select v-model="tradeType" 
                  class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label class="block text-gray-200 text-sm font-medium mb-2">Quantity</label>
                <input type="number" v-model="quantity" min="0" step="0.01" 
                  class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white">
              </div>

              <div class="p-4 bg-black/30 rounded-lg mt-6">
                <div class="flex justify-between items-center">
                  <span class="text-gray-300">Total Value:</span>
                  <span class="text-green-400 text-xl font-bold">
                    ${{ formatPrice(quantity * asset.price) }}
                  </span>
                </div>
              </div>

              <button @click="executeTrade" :disabled="!canTrade" 
                class="w-full mt-4 py-3 px-5 bg-green-600 disabled:bg-green-600/50 text-white rounded-lg">
                Execute Trade
              </button>
            </div>
          </div>

          <div v-else class="bg-white/10 p-6 rounded-xl border border-white/10 text-center">
            <p class="text-gray-300 mb-4">Please log in to trade this asset</p>
            <button @click="$router.push('/login')" 
              class="py-3 px-6 bg-green-600 text-white rounded-lg">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const asset = ref(null);
const loading = ref(true);
const error = ref(null);
const tradeType = ref('buy');
const quantity = ref(1);

const isLoggedIn = computed(() => userStore.isLoggedIn);
const canTrade = computed(() => quantity.value > 0);

async function fetchAssetDetails() {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`http://localhost:3000/api/assets/data/${route.params.id}`); // Updated endpoint
    asset.value = response.data;
  } catch (err) {
    console.error('Error fetching asset:', err);
    error.value = 'Failed to load asset details';
  } finally {
    loading.value = false;
  }
}

async function executeTrade() {
  if (!isLoggedIn.value || !asset.value) return;

  try {
    await axios.post(`http://localhost:3000/api/users/${userStore.user.id}/trades`, { // Updated endpoint
      assetId: asset.value.id,
      type: tradeType.value,
      quantity: quantity.value,
      price: asset.value.price
    });

    router.push('/portfolio');
  } catch (err) {
    console.error('Trade execution error:', err);
    alert('Failed to execute trade. Please try again.');
  }
}

onMounted(() => {
  fetchAssetDetails();
});
</script>

<style scoped>
.trade-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.asset-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.trade-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.trade-button {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.trade-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error-message {
  padding: 20px;
  background: #ffebee;
  color: #d32f2f;
  border-radius: 8px;
  margin: 20px 0;
}
</style>
