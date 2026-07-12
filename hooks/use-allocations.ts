import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiClient } from '@/lib/api'

interface CreateAllocationInput {
  assetId: string
  toUserId: string
  startDate: string
  endDate?: string
  reason?: string
}

/**
 * Hook to fetch allocations list
 */
export function useAllocations(filters?: { status?: string }) {
  return useQuery(
    ['allocations', filters],
    () => apiClient.getAllocations(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  )
}

/**
 * Hook to create allocation
 */
export function useCreateAllocation() {
  const queryClient = useQueryClient()

  return useMutation(
    (data: CreateAllocationInput) => apiClient.createAllocation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['allocations'])
        queryClient.invalidateQueries(['assets'])
      },
    }
  )
}

/**
 * Hook to approve allocation
 */
export function useApproveAllocation() {
  const queryClient = useQueryClient()

  return useMutation(
    (id: string) => apiClient.approveAllocation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['allocations'])
      },
    }
  )
}

/**
 * Hook to reject allocation
 */
export function useRejectAllocation() {
  const queryClient = useQueryClient()

  return useMutation(
    (data: { id: string; reason: string }) => apiClient.rejectAllocation(data.id, data.reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['allocations'])
      },
    }
  )
}
