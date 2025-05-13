<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const userStore = useUserStore();

// Panel data
const activities = ref({
  data: [] as any[],
  loading: true,
  error: null as string | null
});

// Format price for activity descriptions
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Fetch recent activity data
const fetchActivities = async () => {
  try {
    activities.value.loading = true;
    activities.value.error = null;
    
    if (!userStore.isAuthenticated || !userStore.user?.id) {
      activities.value.data = [{
        id: 'empty',
        title: 'No Recent Activity',
        description: 'Please log in to view your activities',
        timestamp: new Date().toISOString()
      }];
      activities.value.loading = false;
      return;
    }
    
    // Arrays to hold our activity data
    let allActivities: {id: string; title: string; description: string; timestamp: string}[] = [];
    
    // Fetch transaction data
    try {
      const transactionsResponse = await fetch(
        `http://localhost:3000/api/transactions/user/${userStore.user.id}/recent?limit=20`, 
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      );
      
      if (transactionsResponse.ok) {
        const transactions = await transactionsResponse.json();
        
        if (Array.isArray(transactions)) {
          // Map transactions to activities
          const transactionActivities = transactions.map(transaction => ({
            id: `t_${transaction.id}`,
            title: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            description: `${transaction.type === 'deposit' ? 'Added' : 'Transferred'} $${formatPrice(transaction.amount)}`,
            timestamp: transaction.created_at
          }));
          
          allActivities = [...allActivities, ...transactionActivities];
        }
      }
    } catch (transactionErr) {
      console.error('Error fetching transactions:', transactionErr);
    }
    
    // Fetch order data
    try {
      const ordersResponse = await fetch(
        `http://localhost:3000/api/orders/${userStore.user.id}`, 
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      );
      
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        
        if (Array.isArray(orders)) {
          // Map orders to activities
          const orderActivities = orders.map(order => ({
            id: `o_${order.id}`,
            title: `${order.tradeType === 'buy' ? 'Buy' : 'Sell'} Order`,
            description: `${order.tradeType === 'buy' ? 'Bought' : 'Sold'} ${order.assetSymbol} at $${formatPrice(order.price)}`,
            timestamp: order.createdAt
          }));
          
          allActivities = [...allActivities, ...orderActivities];
        }
      }
    } catch (orderErr) {
      console.error('Error fetching orders:', orderErr);
    }
    
    // If we have activities, sort and limit them
    if (allActivities.length > 0) {
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Limit to 5 most recent
      activities.value.data = allActivities.slice(0, 5);
    } else {
      // No activities found
      activities.value.data = [{
        id: 'empty',
        title: 'No Recent Activity',
        description: 'No activity found in your account',
        timestamp: new Date().toISOString()
      }];
    }
  } catch (err) {
    console.error('Error fetching activities:', err);
    activities.value.error = 'Failed to load activities';
    activities.value.data = [];
  } finally {
    activities.value.loading = false;
  }
};

const retryActivities = () => fetchActivities();

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchActivities();
  }
});
</script>

<template>
  <div v-if="activities.loading" class="flex-1 flex items-center justify-center">
    <LoadingSpinner class="w-6 h-6" />
  </div>
  <div v-else-if="activities.error" class="flex-1 flex flex-col items-center justify-center">
    <div class="text-red-400 mb-3">{{ activities.error }}</div>
    <button @click="retryActivities" 
            class="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm">
      <font-awesome-icon icon="sync" class="mr-1" /> Retry
    </button>
  </div>
  <div v-else class="activity-list">
    <div v-if="activities.data.length === 0" class="flex items-center justify-center h-full text-gray-400">
      No recent activity
    </div>
    <div v-else class="activity-items-container">
      <div v-for="activity in activities.data" :key="activity.id" 
           class="activity-item">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div class="mb-1 sm:mb-0">
            <div class="font-medium text-white">{{ activity.title }}</div>
            <div class="text-xs text-gray-400">{{ new Date(activity.timestamp).toLocaleString() }}</div>
          </div>
          <div class="text-sm text-gray-400">
            {{ activity.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-list {
  height: 100%;
  max-height: 225px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%; /* Ensure full width */
}

.activity-items-container {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  height: 100%;
  padding-right: 4px;
  width: 100%; /* Ensure full width */
}

.activity-item {
  padding: 8px;
  margin-bottom: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-items-container::-webkit-scrollbar {
  width: 3px;
}

.activity-items-container::-webkit-scrollbar-track {
  background: transparent;
}

.activity-items-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Extra small screens (phones) */
@media (max-width: 479px) {
  .activity-list {
    max-height: 175px;
  }
  
  .activity-item {
    padding: 6px;
    margin-bottom: 4px;
  }
}

/* Small screens (large phones) */
@media (min-width: 480px) and (max-width: 639px) {
  .activity-list {
    max-height: 195px;
  }
  
  .activity-item {
    padding: 6px;
    margin-bottom: 4px;
  }
}

/* Medium screens */
@media (min-width: 640px) and (max-width: 1023px) {
  .activity-list {
    max-height: 210px;
  }
  
  .activity-item {
    padding: 6px;
    margin-bottom: 5px;
    font-size: 0.9rem;
  }
  
  .activity-item .text-sm {
    font-size: 0.8rem;
  }
  
  .activity-item .text-xs {
    font-size: 0.7rem;
  }
}
</style> 