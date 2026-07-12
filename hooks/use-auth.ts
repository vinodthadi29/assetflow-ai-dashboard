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
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initial: AuthState = { user: null, accessToken: null, isLoading: true, isAuthenticated: false, error: null }

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>(initial)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    if (storedUser && storedToken) {
      try {
        setState({ user: JSON.parse(storedUser), accessToken: storedToken, isLoading: false, isAuthenticated: true, error: null })
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        setState({ ...initial, isLoading: false })
      }
    } else {
      setState({ ...initial, isLoading: false })
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Login failed')
      }
      const data = await res.json()
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      setState({ user: data.user, accessToken: data.accessToken, isLoading: false, isAuthenticated: true, error: null })
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setState(prev => ({ ...prev, isLoading: false, error: msg }))
      return false
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string, role: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Registration failed')
      }
      setState(prev => ({ ...prev, isLoading: false }))
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setState(prev => ({ ...prev, isLoading: false, error: msg }))
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch {}
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setState({ ...initial, isLoading: false })
    router.push('/login')
  }, [router])

  return { ...state, login, register, logout }
}
