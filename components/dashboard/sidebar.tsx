'use client'

import { Cpu, Home, Package, RotateCcw, Calendar, FileText, Settings, LogOut, BarChart3, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Assets', href: '/assets' },
  { icon: RotateCcw, label: 'Allocations', href: '/allocations' },
  { icon: Calendar, label: 'Bookings', href: '/bookings' },
  { icon: FileText, label: 'Maintenance', href: '/maintenance' },
  { icon: FileText, label: 'Audits', href: '/audits' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Zap, label: 'Reports', href: '/reports' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2 border-b border-border/30">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Cpu className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AssetFlow
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-border/30">
        <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/50 transition">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/50 transition">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
