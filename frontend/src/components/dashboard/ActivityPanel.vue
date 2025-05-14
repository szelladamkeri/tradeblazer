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
        timestamp: new Date().toISOString(),
        type: 'system'
      }];
      activities.value.loading = false;
      return;
    }
    
    // Arrays to hold our activity data
    let allActivities: {id: string; title: string; description: string; timestamp: string; type: string}[] = [];
    
    // Fetch transaction data
    try {
      const transactionsResponse = await fetch(
        `http://localhost:3000/api/transactions/user/${userStore.user.id}/recent?limit=50`, 
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
            timestamp: transaction.created_at,
            type: 'transaction'
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
        `http://localhost:3000/api/orders/${userStore.user.id}?limit=50`, 
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
            timestamp: order.createdAt,
            type: 'order'
          }));
          
          allActivities = [...allActivities, ...orderActivities];
        }
      }
    } catch (orderErr) {
      console.error('Error fetching orders:', orderErr);
    }
    
    // Fetch login logs
    try {
      const logsResponse = await fetch(
        `http://localhost:3000/api/users/${userStore.user.id}/logs?limit=50`, 
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      );
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        
        if (Array.isArray(logs)) {
          // Map logs to activities
          const logActivities = logs.map(log => {
            let title = 'System Log';
            let description = 'System activity recorded';
            
            // Customize based on log type
            if (log.action === 'login') {
              title = 'Account Login';
              description = `Login from ${log.ip || 'unknown location'}`;
            } else if (log.action === 'logout') {
              title = 'Account Logout';
              description = 'Session ended';
            } else if (log.action === 'password_change') {
              title = 'Password Changed';
              description = 'Account security updated';
            } else if (log.action === 'profile_update') {
              title = 'Profile Updated';
              description = 'Account information changed';
            } else if (log.action) {
              title = log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' ');
              description = log.details || 'System action performed';
            }
            
            return {
              id: `l_${log.id}`,
              title,
              description,
              timestamp: log.created_at,
              type: 'log'
            };
          });
          
          allActivities = [...allActivities, ...logActivities];
        }
      }
    } catch (logErr) {
      console.error('Error fetching logs:', logErr);
    }
    
    // Fetch watchlist changes
    try {
      const watchlistResponse = await fetch(
        `http://localhost:3000/api/watchlist/history/${userStore.user.id}?limit=50`, 
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      );
      
      if (watchlistResponse.ok) {
        const watchlistChanges = await watchlistResponse.json();
        
        if (Array.isArray(watchlistChanges)) {
          // Map watchlist changes to activities
          const watchlistActivities = watchlistChanges.map(change => ({
            id: `w_${change.id}`,
            title: change.action === 'add' ? 'Added to Watchlist' : 'Removed from Watchlist',
            description: `${change.action === 'add' ? 'Started tracking' : 'Stopped tracking'} ${change.symbol}`,
            timestamp: change.created_at,
            type: 'watchlist'
          }));
          
          allActivities = [...allActivities, ...watchlistActivities];
        }
      }
    } catch (watchlistErr) {
      console.error('Error fetching watchlist history:', watchlistErr);
    }
    
    // If we have activities, sort and limit them
    if (allActivities.length > 0) {
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Limit to 20 most recent
      activities.value.data = allActivities.slice(0, 20);
    } else {
      // No activities found
      activities.value.data = [{
        id: 'empty',
        title: 'No Recent Activity',
        description: 'No activity found in your account',
        timestamp: new Date().toISOString(),
        type: 'system'
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
           class="activity-item"
           :class="{ 
             'border-l-green-500': activity.type === 'order',
             'border-l-purple-500': activity.type === 'transaction',
             'border-l-blue-500': activity.type === 'log',
             'border-l-yellow-500': activity.type === 'watchlist',
             'border-l-gray-500': activity.type === 'system'
           }">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div class="mb-1 sm:mb-0">
            <div class="font-medium text-white flex items-center">
              <!-- Show different icons based on activity type -->
              <font-awesome-icon 
                :icon="
                  activity.type === 'order' ? 'exchange-alt' : 
                  activity.type === 'transaction' ? 'money-bill-wave' :
                  activity.type === 'log' ? 'history' :
                  activity.type === 'watchlist' ? 'star' : 'info-circle'
                " 
                class="mr-2"
                :class="{ 
                  'text-green-400': activity.type === 'order',
                  'text-purple-400': activity.type === 'transaction',
                  'text-blue-400': activity.type === 'log',
                  'text-yellow-400': activity.type === 'watchlist',
                  'text-gray-400': activity.type === 'system'
                }"
              />
              {{ activity.title }}
            </div>
            <div class="text-xs text-gray-400">{{ new Date(activity.timestamp).toLocaleString() }}</div>
          </div>
          <div class="text-sm text-gray-300">
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
  max-height: 400px; /* Increased height to show more activities */
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
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left-width: 3px;
  border-left-style: solid;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
    max-height: 350px;
  }
  
  .activity-item {
    padding: 10px;
    margin-bottom: 6px;
  }
}

/* Small screens (large phones) */
@media (min-width: 480px) and (max-width: 639px) {
  .activity-list {
    max-height: 350px;
  }
  
  .activity-item {
    padding: 10px 12px;
    margin-bottom: 6px;
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