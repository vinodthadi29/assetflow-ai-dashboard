import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  sub: string
  email: string
  name?: string
  role: string
  iat: number
  exp: number
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
  department?: string
}

class AuthManager {
  private tokenKey = 'authToken'
  private userKey = 'authUser'

  /**
   * Store authentication token and user data
   */
  setAuth(token: string, user: AuthUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token)
      localStorage.setItem(this.userKey, JSON.stringify(user))
    }
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey)
    }
    return null
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.userKey)
      return user ? JSON.parse(user) : null
    }
    return null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return decoded.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.role === role
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser()
    return user ? roles.includes(user.role) : false
  }

  /**
   * Check if user has permission based on role
   */
  canApprove(): boolean {
    return this.hasAnyRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'])
  }

  canCreateAsset(): boolean {
    return this.hasAnyRole(['ADMIN', 'ASSET_MANAGER'])
  }

  canManageAudits(): boolean {
    return this.hasAnyRole(['ADMIN', 'ASSET_MANAGER'])
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.userKey)
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

export const authManager = new AuthManager()
