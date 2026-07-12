import useSWR, { mutate as swrMutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAllocations(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters)
  const key = `/api/allocations?${params.toString()}`
  const { data, error, isLoading } = useSWR(key, fetcher, { revalidateOnFocus: false })
  return {
    data,
    isLoading,
    error,
    mutate: () => swrMutate(key),
  }
}
