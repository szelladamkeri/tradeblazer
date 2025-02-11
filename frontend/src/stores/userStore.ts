import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
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
    isAuthenticated: false
  }),

  actions: {
    setUser(userData: User | null, token: string | null = null) {
      this.user = userData;
      this.token = token;
      this.isAuthenticated = !!userData;
      
      if (userData && token) {
        localStorage.setItem('auth', JSON.stringify({ user: userData, token }));
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('auth');
    },

    getAuthHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },

    initializeFromStorage() {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const { user, token } = JSON.parse(stored);
          this.setUser(user, token);
        } catch (e) {
          this.logout();
        }
      }
    }
  }
});
