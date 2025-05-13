import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserState } from '@/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const avatarTimestamp = ref<number>(Date.now())
  const avatar = ref({
    available: false,
    loading: false,
  })

  // Add debug logging to isAdmin computed
  const isAdmin = computed(() => {
    // Check for type since that's what's in the database
    const result = user.value?.type === 'A'
    console.log('isAdmin check:', {
      hasUser: !!user.value,
      userType: user.value?.type,
      isAdmin: result
    })
    return result
  })

  function setUser(userData: User | null, tokenData: string | null = null) {
    if (userData) {
      // Use type instead of role since that's what's in the database
      user.value = {
        ...userData,
        // Ensure username is available - the backend might provide it as 'name' 
        username: userData.username || (userData as any).name,
        // Ensure displayName is available
        displayName: userData.displayName || userData.username || (userData as any).name,
        type: userData.type || 'U',
        role: userData.type || 'U' // Keep role for backward compatibility
      }
      token.value = tokenData

      localStorage.setItem('user', JSON.stringify({
        user: user.value,
        token: tokenData
      }))
      checkAvatar()
    } else {
      user.value = null
      token.value = null
      avatar.value.available = false
      avatar.value.loading = false
      localStorage.removeItem('user')
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
  }

  function getAuthHeader(): HeadersInit {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  }

  function initializeFromStorage() {
    const stored = localStorage.getItem('user')
    console.log('Initializing from storage:', stored ? stored.substring(0, 100) + (stored.length > 100 ? '...' : '') : 'null')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        console.log('Parsed storage data:', JSON.stringify(data, null, 2).substring(0, 200) + (JSON.stringify(data).length > 200 ? '...' : ''))
        setUser(data.user, data.token)
      } catch (e) {
        console.error('Storage parse error:', e)
        logout()
      }
    }
  }

  async function refreshUser() {
    if (!user.value?.id) {
      console.error('refreshUser called without user ID.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/user/${user.value.id}`, {
        headers: getAuthHeader() // Ensure auth header is sent
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
      }

      const userData = await response.json();
      console.log('[userStore] Fetched user data in refreshUser:', userData); // Log fetched data

      if (userData) {
        user.value = {
          ...user.value, // Keep existing properties like token if not in userData
          ...userData,
          username: userData.username || userData.name,
          displayName: userData.displayName || userData.username || userData.name,
          role: userData.role || userData.type,
          type: userData.type || userData.role
        };
        console.log('[userStore] Updated user.value in store:', JSON.parse(JSON.stringify(user.value))); // Log updated store state

        avatarTimestamp.value = Date.now();
        // Re-enable checkAvatar now that the backend endpoint is implemented
        await checkAvatar();

        localStorage.setItem('user', JSON.stringify({ 
          user: user.value,
          token: token.value 
        }));
      } else {
        console.warn('[userStore] refreshUser received empty data.');
      }
    } catch (error) {
      console.error('[userStore] Error refreshing user data:', error);
    }
  }

  async function checkAvatar() {
    if (!user.value?.username) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/checkfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: 'avatarCheck',
          username: user.value.username,
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        avatar.value.available = data.hasAvatar;
        avatarTimestamp.value = Date.now(); // Force refresh
      } else {
        console.error('Non-JSON response received:', await response.text());
        avatar.value.available = false;
      }
    } catch (error) {
      console.error('Error checking avatar:', error);
      avatar.value.available = false;
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    avatarTimestamp,
    avatar,
    isAdmin,
    setUser,
    logout,
    getAuthHeader,
    initializeFromStorage,
    refreshUser,
    checkAvatar,
  }
})
