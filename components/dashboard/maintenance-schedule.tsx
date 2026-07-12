'use client'

import { Calendar, AlertCircle } from 'lucide-react'

const schedule = [
  { asset: 'MacBook Pro 16"', date: 'Today', priority: 'high' },
  { asset: 'Dell Monitor 27"', date: 'Tomorrow', priority: 'medium' },
  { asset: 'Office Chair Pro', date: '3 days', priority: 'high' },
  { asset: 'Printer HP Color', date: '1 week', priority: 'low' },
]

export function MaintenanceSchedule() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
        <Calendar className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        {schedule.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${
              item.priority === 'high'
                ? 'border-red-500/30 bg-red-500/5'
                : item.priority === 'medium'
                ? 'border-orange-500/30 bg-orange-500/5'
                : 'border-green-500/30 bg-green-500/5'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.asset}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              {item.priority === 'high' && (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
