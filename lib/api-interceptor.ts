'use client'

export class APIClient {
  private baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers = new Headers(options.headers || {})
    
    // Add auth token if available
    const accessToken = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null
    
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    
    headers.set('Content-Type', 'application/json')

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle token expiration
      if (response.status === 401) {
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refreshToken') 
          : null
        
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${this.baseURL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              localStorage.setItem('accessToken', data.accessToken)
              
              // Retry original request with new token
              headers.set('Authorization', `Bearer ${data.accessToken}`)
              return this.request(endpoint, { ...options, headers })
            }
          } catch (error) {
            console.error('[v0] Token refresh failed:', error)
          }
        }
        
        // Clear auth and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Handle empty responses
      const text = await response.text()
      if (!text) {
        return {} as T
      }

      return JSON.parse(text) as T
    } catch (error) {
      console.error(`[v0] API request failed: ${endpoint}`, error)
      throw error
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new APIClient()
