'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  category: string
  action: () => void
}

export function useCommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<CommandItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before using router
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const search = useCallback(
    async (query: string) => {
      setSearchQuery(query)

      if (!query) {
        setResults([])
        return
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          const items: CommandItem[] = data.results.map((result: any) => ({
            id: result.id,
            title: result.title,
            subtitle: result.subtitle,
            category: result.type,
            action: () => {
              // Navigate only if mounted and router is ready
              if (mounted) {
                router.push(`/${result.type}s/${result.id}`)
              }
            },
          }))

          setResults(items)
          setSelectedIndex(0)
        }
      } catch (error) {
        console.error('[v0] Search error:', error)
      }
    },
    []
  )

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((i) => (i + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((i) => (i - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && results[selectedIndex]) {
      event.preventDefault()
      results[selectedIndex].action()
      setIsOpen(false)
    }
  }

  return {
    isOpen,
    setIsOpen,
    searchQuery,
    search,
    results,
    selectedIndex,
    handleKeyDown,
  }
}
