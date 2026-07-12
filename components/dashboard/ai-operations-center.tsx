'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, Lightbulb, Zap, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Insight {
  type: 'warning' | 'opportunity' | 'recommendation' | 'forecast'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionItems: Array<{
    action: string
    impact: string
  }>
}

export function AIOperationsCenter() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/ai/insights', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
    const interval = setInterval(fetchInsights, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-blue-500" />
      case 'forecast':
        return <Zap className="w-5 h-5 text-purple-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-primary" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30'
      case 'opportunity':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30'
      case 'recommendation':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'
      case 'forecast':
        return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30'
      default:
        return 'bg-primary/5 border-primary/20'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          AI Operations Center
        </h2>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
          {insights.length} Insights
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="p-6 rounded-xl border border-border bg-card/50 text-center">
          <p className="text-muted-foreground">No critical insights at this time. Your operations are running smoothly!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-4 transition cursor-pointer ${getBgColor(insight.type)} ${
                expandedIndex === idx ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcon(insight.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-sm font-bold">{Math.round(insight.confidence * 100)}%</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          insight.impact === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : insight.impact === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {insight.impact}
                      </span>
                    </div>
                  </div>

                  {expandedIndex === idx && (
                    <div className="mt-4 pt-4 border-t border-current border-opacity-10">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">RECOMMENDED ACTIONS:</p>
                      <div className="space-y-2">
                        {insight.actionItems.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex gap-3">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{item.action}</p>
                              <p className="text-xs text-muted-foreground">{item.impact}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="default" className="flex-1">
                          Take Action
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        <Clock className="w-3 h-3 inline mr-1" />
        Insights updated every 5 minutes
      </div>
    </div>
  )
}
