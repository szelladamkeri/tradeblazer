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

  // Fix the isAdmin computation to check role (which is what the User interface uses)
  const isAdmin = computed(() => {
    // Debug check to help identify the issue
    console.log('Current user role/type:', user.value?.role, user.value?.type)
    // Check both role and type fields to ensure compatibility
    return user.value?.role === 'A' || user.value?.type === 'A'
  })

  function setUser(userData: User | null, tokenData: string | null = null) {
    user.value = userData
    token.value = tokenData

    if (userData) {
      // Ensure role and type are synchronized
      if (userData.role && !userData.type) {
        userData.type = userData.role
      } else if (userData.type && !userData.role) {
        userData.role = userData.type as 'A' | 'U'
      }
      
      localStorage.setItem('user', JSON.stringify({ user: userData }))
      checkAvatar()
    } else {
      avatar.value.available = false
      avatar.value.loading = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
  }

  function getAuthHeader() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  function initializeFromStorage() {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setUser(data.user)
      } catch (e) {
        logout()
      }
    }
  }

  async function refreshUser() {
    try {
      const response = await fetch('http://localhost:3000/api/user/' + user.value?.id)
      if (!response.ok) throw new Error('Failed to fetch user data')

      const userData = await response.json()
      if (userData) {
        user.value = {
          ...userData,
          displayName: userData.displayName || userData.username,
          // Ensure both role and type fields are set correctly
          role: userData.role || userData.type,
          type: userData.type || userData.role
        }
        avatarTimestamp.value = Date.now()
        await checkAvatar()
        localStorage.setItem('user', JSON.stringify({ user: user.value }))
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
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

      const data = await response.json();
      avatar.value.available = data.hasAvatar;
      avatarTimestamp.value = Date.now(); // Force refresh
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
