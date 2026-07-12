'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Leaf, DollarSign } from 'lucide-react'

interface Metrics {
  assetROI: number
  idleCost: number
  maintenanceForecast: number
  carbonSavings: number
  departmentEfficiency: Record<string, number>
}

export function SmartAnalytics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/ai/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMetrics(data.metrics)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (isLoading || !metrics) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  const metrics_list = [
    {
      label: 'Asset ROI',
      value: `${metrics.assetROI.toFixed(1)}%`,
      change: '+4.2%',
      icon: TrendingUp,
      color: 'text-green-500',
      desc: 'Return on asset investment',
    },
    {
      label: 'Annual Idle Cost',
      value: `₹${Math.round(metrics.idleCost / 100000) * 100000}`,
      change: '-2.1%',
      icon: TrendingDown,
      color: 'text-red-500',
      desc: 'Cost of underutilized assets',
    },
    {
      label: 'Maintenance Forecast',
      value: `₹${Math.round(metrics.maintenanceForecast / 1000)}K`,
      change: '+1.8%',
      icon: DollarSign,
      color: 'text-orange-500',
      desc: '30-day maintenance projection',
    },
    {
      label: 'Carbon Savings',
      value: `${metrics.carbonSavings.toFixed(0)} kg CO₂`,
      change: '+12.5%',
      icon: Leaf,
      color: 'text-emerald-500',
      desc: 'Annual environmental impact',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4">Smart Analytics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics_list.map((metric, idx) => {
            const Icon = metric.icon
            return (
              <div key={idx} className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-background/50 ${metric.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">{metric.change}</p>
                  <p className="text-xs text-muted-foreground">{metric.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {Object.keys(metrics.departmentEfficiency).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Department Efficiency Scores</h3>
          <div className="space-y-2">
            {Object.entries(metrics.departmentEfficiency).map(([dept, score]) => (
              <div key={dept} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
                <span className="text-sm font-medium">{dept}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition"
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-right w-10">{Math.round(score)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
