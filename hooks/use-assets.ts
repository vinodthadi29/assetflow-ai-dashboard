import useSWR, { mutate as swrMutate } from 'swr'

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
    },
  }).then(res => res.json())

export function useAssets(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters)
  const key = `/api/assets?${params.toString()}`
  const { data, error, isLoading } = useSWR(key, fetcher, { revalidateOnFocus: false })
  return { data, isLoading, error, mutate: () => swrMutate(key) }
}
