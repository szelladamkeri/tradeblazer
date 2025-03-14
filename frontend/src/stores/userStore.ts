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

  const isAdmin = computed(() => user.value?.role === 'A')

  function setUser(userData: User | null, tokenData: string | null = null) {
    user.value = userData
    token.value = tokenData

    if (userData) {
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
