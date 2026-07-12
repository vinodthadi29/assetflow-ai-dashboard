'use client'

import { useEffect, useState } from 'react'
import { AICopilot } from '@/components/ai-copilot'
import { CommandPalette } from '@/components/command-palette'

export function Providers() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render interactive components until after hydration
  if (!mounted) {
    return null
  }

  return (
    <>
      <CommandPalette />
      <AICopilot />
    </>
  )
}
