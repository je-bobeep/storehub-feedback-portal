import { User, AuthSession } from './types'

// Mock user storage (in production, this would be a database)
const mockUsers: User[] = []

// Helper to create a user
export function createUser(username: string, email: string, password: string): User {
  // In production, hash the password properly
  const user: User = {
    id: Date.now().toString(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString()
  }
  
  // Store user with password (in production, hash this)
  mockUsers.push(user)
  
  // Also store password separately (in production, this would be hashed in database)
  ;(global as any).userPasswords = (global as any).userPasswords || new Map()
  ;(global as any).userPasswords.set(user.email, password)
  
  return user
}

// Helper to find user by email
export function findUserByEmail(email: string): User | null {
  return mockUsers.find(user => user.email === email.toLowerCase()) || null
}

// Helper to verify password
export function verifyPassword(email: string, password: string): boolean {
  const passwords = (global as any).userPasswords || new Map()
  return passwords.get(email.toLowerCase()) === password
}

// Helper to authenticate user
export function authenticateUser(email: string, password: string): User | null {
  const user = findUserByEmail(email)
  if (!user) return null
  
  if (!verifyPassword(email, password)) return null
  
  return user
}

// Helper to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper to validate username
export function isValidUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
}

// Helper to check if user exists
export function userExists(email: string, username?: string): boolean {
  return mockUsers.some(user => 
    user.email === email.toLowerCase() || 
    (username && user.username.toLowerCase() === username.toLowerCase())
  )
} 