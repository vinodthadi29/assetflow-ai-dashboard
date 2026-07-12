import axios, { AxiosInstance, AxiosError } from 'axios'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

interface ApiErrorResponse {
  success: false
  error: string
  details?: any
}

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Assets endpoints
  async getAssets(filters?: { category?: string; status?: string; limit?: number; offset?: number }) {
    const response = await this.client.get<ApiResponse>('/api/assets', { params: filters })
    return response.data
  }

  async createAsset(data: any) {
    const response = await this.client.post<ApiResponse>('/api/assets', data)
    return response.data
  }

  async getAsset(id: string) {
    const response = await this.client.get<ApiResponse>(`/api/assets/${id}`)
    return response.data
  }

  async updateAsset(id: string, data: any) {
    const response = await this.client.patch<ApiResponse>(`/api/assets/${id}`, data)
    return response.data
  }

  async deleteAsset(id: string) {
    const response = await this.client.delete<ApiResponse>(`/api/assets/${id}`)
    return response.data
  }

  // Allocations endpoints
  async getAllocations(filters?: { status?: string; limit?: number; offset?: number }) {
    const response = await this.client.get<ApiResponse>('/api/allocations', { params: filters })
    return response.data
  }

  async createAllocation(data: any) {
    const response = await this.client.post<ApiResponse>('/api/allocations', data)
    return response.data
  }

  async approveAllocation(id: string) {
    const response = await this.client.post<ApiResponse>(`/api/allocations/${id}/approve`)
    return response.data
  }

  async rejectAllocation(id: string, reason: string) {
    const response = await this.client.post<ApiResponse>(`/api/allocations/${id}/reject`, { reason })
    return response.data
  }

  // Bookings endpoints
  async getBookings(filters?: { limit?: number; offset?: number }) {
    const response = await this.client.get<ApiResponse>('/api/bookings', { params: filters })
    return response.data
  }

  async createBooking(data: any) {
    const response = await this.client.post<ApiResponse>('/api/bookings', data)
    return response.data
  }

  // Maintenance endpoints
  async getMaintenanceTickets(filters?: { status?: string; priority?: string }) {
    const response = await this.client.get<ApiResponse>('/api/maintenance', { params: filters })
    return response.data
  }

  async createMaintenanceTicket(data: any) {
    const response = await this.client.post<ApiResponse>('/api/maintenance', data)
    return response.data
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.client.get<ApiResponse>('/api/dashboard/stats')
    return response.data
  }

  async getRecentActivity(limit: number = 10) {
    const response = await this.client.get<ApiResponse>('/api/activity', { params: { limit } })
    return response.data
  }
}

export const apiClient = new ApiClient()
