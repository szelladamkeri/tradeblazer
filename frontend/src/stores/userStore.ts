import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
  avatar: string | undefined
  type: string
  created_at: string
  displayName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  avatarTimestamp: number
  avatar: {
    available: boolean
    loading: boolean
  }
}

export const useUserStore = defineStore('user', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    avatarTimestamp: Date.now(),
    avatar: {
      available: false,
      loading: false,
    },
  }),

  getters: {
    isAdmin: (state) => {
      console.log('User type:', state.user?.type)
      return state.user?.type === 'A'
    },
  },

  actions: {
    setUser(userData: User | null, token: string | null = null) {
      this.user = userData
      this.token = token
      this.isAuthenticated = !!userData

      if (userData) {
        localStorage.setItem('user', JSON.stringify({ user: userData }))
        this.checkAvatar() // Check avatar when setting user
      } else {
        this.avatar.available = false
        this.avatar.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('user')
    },

    getAuthHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    },

    initializeFromStorage() {
      const stored = localStorage.getItem('user')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          this.setUser(data.user)
        } catch (e) {
          this.logout()
        }
      }
    },

    async refreshUser() {
      try {
        const response = await fetch('http://localhost:3000/api/user/' + this.user?.id)
        if (!response.ok) throw new Error('Failed to fetch user data')

        const userData = await response.json()
        if (userData) {
          this.user = {
            ...userData,
            displayName: userData.displayName || userData.username,
          }
          this.avatarTimestamp = Date.now()
          await this.checkAvatar() // Check avatar after user refresh
          localStorage.setItem('user', JSON.stringify({ user: this.user }))
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
      }
    },

    async checkAvatar() {
      if (!this.user?.username || this.avatar.loading) return

      this.avatar.loading = true
      try {
        const response = await fetch('http://localhost:3000/api/checkfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purpose: 'avatarCheck',
            username: this.user.username,
          }),
        })
        const data = await response.json()
        this.avatar.available = data.hasAvatar
        if (data.hasAvatar) {
          // Preload the avatar image
          const img = new Image()
          img.src = `/src/assets/avatars/${this.user.username}.jpg?t=${this.avatarTimestamp}`
        }
      } catch (error) {
        console.error('Error checking avatar:', error)
        this.avatar.available = false
      } finally {
        this.avatar.loading = false
      }
    },
  },
})
