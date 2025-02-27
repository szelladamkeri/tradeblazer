<template>
  <div class="trade-container">
    <h1>Trade Asset</h1>

    <div v-if="loading" class="loading">
      Loading asset details...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="asset" class="trade-content">
      <div class="asset-info">
        <h2>{{ asset.name }} ({{ asset.symbol }})</h2>
        <div class="current-price">
          Current Price: ${{ Number(asset.price).toLocaleString() }}
        </div>
      </div>

      <div class="trade-form" v-if="isLoggedIn">
        <div class="form-group">
          <label>Trade Type</label>
          <select v-model="tradeType">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div class="form-group">
          <label>Quantity</label>
          <input type="number" v-model="quantity" min="0" step="0.01">
        </div>

        <div class="trade-summary">
          <p>Total Value: ${{ (quantity * asset.price).toLocaleString() }}</p>
        </div>

        <button @click="executeTrade" :disabled="!canTrade" class="trade-button">
          Execute Trade
        </button>
      </div>

      <div v-else class="login-prompt">
        <p>Please log in to trade</p>
        <button @click="$router.push('/login')" class="login-button">
          Go to Login
        </button>
      </div>
    </div>
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
