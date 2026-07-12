'use client'

import { useCommandPalette } from '@/hooks/use-command-palette'
import { Search, X } from 'lucide-react'

export function CommandPalette() {
  const { isOpen, setIsOpen, searchQuery, search, results, selectedIndex, handleKeyDown } = useCommandPalette()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets, users, maintenance..."
              value={searchQuery}
              onChange={(e) => search(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
              autoFocus
            />
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-background rounded-lg transition">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No results found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action()
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left transition flex items-start justify-between gap-4 ${
                      idx === selectedIndex ? 'bg-primary/10' : 'hover:bg-background'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                      {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-background text-muted-foreground capitalize">
                        {item.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
            <p>
              <span className="font-semibold">↑↓</span> to navigate
              <span className="font-semibold ml-2">Enter</span> to select
              <span className="font-semibold ml-2">Esc</span> to close
            </p>
            <kbd className="px-2 py-1 rounded bg-background border border-border text-xs">Cmd K</kbd>
          </div>
        </div>
      </div>
    </>
  )
}
