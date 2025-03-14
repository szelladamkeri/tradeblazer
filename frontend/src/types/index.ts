// User-related types
export interface User {
  id: number
  username: string
  email: string
  displayName?: string
  role: 'A' | 'U'  // 'A' for Admin, 'U' for User
  created_at?: string
}

// Error-related types
export interface ApiError {
  message: string
  type: 'general' | 'connection' | 'auth' | 'notFound'
}

// Store-related types
export interface UserState {
  user: User | null
  isAuthenticated: boolean
  avatar: {
    available: boolean
    timestamp?: number
  }
}

// API Response types
export interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}
