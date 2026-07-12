'use client'

import { Clock } from 'lucide-react'

const activities = [
  { action: 'Asset allocated', asset: 'AST-001', user: 'John Smith', time: '2 hours ago' },
  { action: 'Maintenance completed', asset: 'AST-003', user: 'Tech Team', time: '5 hours ago' },
  { action: 'Asset transferred', asset: 'AST-002', user: 'Sarah Johnson', time: '1 day ago' },
  { action: 'Booking confirmed', asset: 'AST-004', user: 'Mike Davis', time: '2 days ago' },
]

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div
            key={idx}
            className="pb-3 border-b border-border/20 last:border-0 last:pb-0"
          >
            <p className="text-sm text-foreground">
              <span className="font-medium text-primary">{activity.action}</span>
              {' '}
              <span className="text-muted-foreground">({activity.asset})</span>
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">{activity.user}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
