export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required'
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 20) return 'Username must be less than 20 characters'
  if (/\s/.test(username)) return 'Username cannot contain spaces'
  if (!/^[a-zA-Z0-9_-]+$/.test(username))
    return 'Username can only contain letters, numbers, underscores and dashes'
  return null
}

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  if (!/\d/.test(password)) return 'Password must contain at least one number'
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter'
  return null
}

export const hasChanges = (original: any, current: any, fields: string[]): boolean => {
  return fields.some((field) => original[field] !== current[field])
}
