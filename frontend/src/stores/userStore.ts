import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
  avatar: string | undefined
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useUserStore = defineStore('user', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  actions: {
    setUser(userData: User | null, token: string | null = null) {
      this.user = userData
      this.token = token
      this.isAuthenticated = !!userData

      if (userData) {
        localStorage.setItem('user', JSON.stringify({ user: userData }))
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
  },
})
