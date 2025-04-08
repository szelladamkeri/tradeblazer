// User-related types
export interface User {
  id: number
  username: string
  email: string
  displayName?: string
  type: 'A' | 'U'  // Changed from role to type to match database
  role?: 'A' | 'U' // Keep for backward compatibility
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
