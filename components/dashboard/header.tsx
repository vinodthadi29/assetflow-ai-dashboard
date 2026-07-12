'use client'

import { useState, useEffect } from 'react'
import { Search, User, LogOut, ChevronDown } from 'lucide-react'
import { NotificationCenter } from '@/components/notification-center'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  if (!mounted || !user) {
    return (
      <header className="sticky top-0 z-40 border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="px-8 py-4 flex items-center justify-between relative">
          <div className="flex-1" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="px-8 py-4 flex items-center justify-between relative">
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
          <NotificationCenter />
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-2 rounded-lg bg-background text-muted-foreground hover:text-foreground transition"
            >
              <User className="w-5 h-5" />
              <ChevronDown className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border/30 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border/30">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-accent mt-1">{user.role}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-background hover:text-foreground flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
