<template>
  <div class="watchlist-container">
    <h1>Your Watchlist</h1>
    
    <div v-if="!isLoggedIn" class="login-prompt">
      <p>Please log in to view your watchlist</p>
      <button @click="$router.push('/login')" class="login-button">Go to Login</button>
    </div>
    
    <div v-else>
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchWatchlist" class="retry-button">Retry</button>
      </div>
      
      <div v-else-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading your watchlist...</p>
      </div>
      
      <div v-else-if="watchlist.length === 0" class="empty-watchlist">
        <p>Your watchlist is empty.</p>
        <button @click="$router.push('/search')" class="browse-button">
          Browse Assets
        </button>
      </div>
      
      <div v-else>
        <div class="watchlist-grid">
          <div v-for="item in watchlist" :key="item.id" class="watchlist-item">
            <div class="card-header">
              <span class="asset-symbol">{{ item.symbol }}</span>
              <span class="asset-type" :class="`type-${item.type}`">{{ item.type }}</span>
            </div>
            
            <h3 class="asset-name">{{ item.name }}</h3>
            
            <div class="asset-price">
              <span>Current Price:</span>
              <span class="price">${{ Number(item.price).toLocaleString() }}</span>
            </div>
            
            <div class="card-actions">
              <button @click="removeFromWatchlist(item.watchlistId)" class="remove-button">
                Remove
              </button>
              <button @click="goToTrade(item.id)" class="trade-button">
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';

const userStore = useUserStore();
const watchlist = ref([]);
const loading = ref(true);
const error = ref(null);

const isLoggedIn = computed(() => userStore.isLoggedIn);

async function fetchWatchlist() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(
      `http://localhost:3000/api/users/${userStore.user.id}/watchlist` // Updated endpoint
    );
    watchlist.value = response.data;
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    error.value = 'Failed to load watchlist. Please try again.';
  } finally {
    loading.value = false;
  }
}

async function removeFromWatchlist(watchlistId) {
  try {
    await axios.delete(`http://localhost:3000/api/users/${userStore.user.id}/watchlist/${watchlistId}`); // Updated endpoint
    watchlist.value = watchlist.value.filter(item => item.watchlistId !== watchlistId);
  } catch (err) {
    console.error('Error removing from watchlist:', err);
    alert('Failed to remove asset from watchlist. Please try again.');
  }
}

function goToTrade(assetId) {
  router.push(`/trade/${assetId}`);
}

onMounted(() => {
  if (isLoggedIn.value) {
    fetchWatchlist();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.watchlist-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.watchlist-container h1 {
  margin-bottom: 30px;
  color: #333;
}

.login-prompt, .empty-watchlist, .loading, .error-message {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.login-button, .browse-button, .retry-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 20px;
  cursor: pointer;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.watchlist-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.watchlist-item:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.asset-symbol {
  font-weight: bold;
  color: #555;
}

.asset-type {
  font-size: 0.8em;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: capitalize;
}

.type-stock {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type-forex {
  background-color: #fff8e1;
  color: #ff8f00;
}

.type-crypto {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.asset-name {
  margin: 10px 0;
  font-size: 1.2em;
  color: #333;
}

.asset-price {
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
}

.price {
  font-weight: bold;
  color: #2e7d32;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.remove-button, .trade-button {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.remove-button {
  background-color: #f5f5f5;
  color: #d32f2f;
}

.trade-button {
  background-color: #4caf50;
  color: white;
}

.error-message {
  text-align: center;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 8px;
  color: #d32f2f;
  margin: 20px 0;
}

.retry-button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 15px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
