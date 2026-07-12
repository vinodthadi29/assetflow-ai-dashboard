'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'
  department?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>(initialState)

  // Load stored tokens on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      const storedUser = localStorage.getItem('user')
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (storedUser && storedAccessToken) {
        try {
          const user = JSON.parse(storedUser)
          setState({
            user,
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } catch (error) {
          console.error('[v0] Failed to parse stored auth:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setState({ ...initialState, isLoading: false })
        }
      } else {
        setState({ ...initialState, isLoading: false })
      }
    }

    loadStoredAuth()
  }, [])

  const register = useCallback(
    async (email: string, password: string, name: string, role: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Registration failed')
        }

        setState((prev) => ({ ...prev, isLoading: false, error: null }))
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
        return false
      }
    },
    []
  )

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Login failed')
        }

        const data = await response.json()
        const { user, accessToken, refreshToken } = data

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        setState({
          user,
          accessToken,
          refreshToken,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
        return false
      }
    },
    []
  )

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const refreshToken = localStorage.getItem('refreshToken')

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      })
    } catch (error) {
      console.error('[v0] Logout error:', error)
    } finally {
      // Clear storage and state regardless of API result
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      setState(initialState)
      router.push('/login')
    }
  }, [state.accessToken, router])

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newAccessToken = data.accessToken

      localStorage.setItem('accessToken', newAccessToken)

      setState((prev) => ({
        ...prev,
        accessToken: newAccessToken,
        isAuthenticated: true,
      }))

      return true
    } catch (error) {
      console.error('[v0] Token refresh failed:', error)
      // If refresh fails, logout the user
      await logout()
      return false
    }
  }, [logout])

  return {
    ...state,
    register,
    login,
    logout,
    refreshAccessToken,
  }
}
