import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiClient } from '@/lib/api'

interface Asset {
  id: string
  name: string
  category: string
  status: string
  location: string
  owner?: string
}

interface CreateAssetInput {
  name: string
  category: string
  location: string
  description?: string
  purchaseValue?: number
}

/**
 * Hook to fetch assets list
 */
export function useAssets(filters?: { category?: string; status?: string }) {
  return useQuery(
    ['assets', filters],
    () => apiClient.getAssets(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )
}

/**
 * Hook to fetch single asset
 */
export function useAsset(id: string) {
  return useQuery(
    ['asset', id],
    () => apiClient.getAsset(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  )
}

/**
 * Hook to create asset
 */
export function useCreateAsset() {
  const queryClient = useQueryClient()

  return useMutation(
    (data: CreateAssetInput) => apiClient.createAsset(data),
    {
      onSuccess: () => {
        // Invalidate assets list to trigger refetch
        queryClient.invalidateQueries(['assets'])
      },
    }
  )
}

/**
 * Hook to update asset
 */
export function useUpdateAsset(id: string) {
  const queryClient = useQueryClient()

  return useMutation(
    (data: Partial<Asset>) => apiClient.updateAsset(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['asset', id])
        queryClient.invalidateQueries(['assets'])
      },
    }
  )
}

/**
 * Hook to delete asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation(
    (id: string) => apiClient.deleteAsset(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assets'])
      },
    }
  )
}
