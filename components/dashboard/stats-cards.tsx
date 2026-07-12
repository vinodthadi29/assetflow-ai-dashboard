'use client'

import { TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react'

const stats = [
  {
    label: 'Total Assets',
    value: '2,847',
    change: '+12%',
    icon: TrendingUp,
    color: 'text-primary',
  },
  {
    label: 'In Use',
    value: '2,156',
    change: '+8%',
    icon: CheckCircle,
    color: 'text-accent',
  },
  {
    label: 'Maintenance Due',
    value: '84',
    change: '-3%',
    icon: AlertCircle,
    color: 'text-orange-500',
  },
  {
    label: 'Awaiting Approval',
    value: '23',
    change: '+5%',
    icon: Clock,
    color: 'text-blue-500',
  },
]

export function StatsCards() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-background/50 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">{stat.change}</span> from last month
            </p>
          </div>
        )
      })}
    </div>
  )
}
