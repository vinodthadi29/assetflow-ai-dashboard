'use client'

import { Search, Bell, User } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets, allocations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-6">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button className="p-2 rounded-lg bg-background text-muted-foreground hover:text-foreground transition">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
