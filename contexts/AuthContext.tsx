'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app load
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // In a real app, you'd make an API call to check if the session is still valid
      // For now, we'll just set loading to false since we're using cookies
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear user state even if API call fails
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 