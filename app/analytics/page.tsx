'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { AssetUtilizationChart, MaintenanceTrendChart, AssetAgeDistributionChart, CostAnalysisChart } from '@/components/dashboard/analytics-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Wrench, AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Analytics & Insights</h1>
              <p className="text-muted-foreground">Comprehensive asset analytics and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Total Asset Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$2.4M</div>
                  <p className="text-xs text-muted-foreground mt-1">+$125K this quarter</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-accent" />
                    Maintenance Due
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    Maintenance Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$45K</div>
                  <p className="text-xs text-muted-foreground mt-1">YTD spending</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground mt-1">Critical issues</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AssetUtilizationChart />
              <MaintenanceTrendChart />
              <AssetAgeDistributionChart />
              <CostAnalysisChart />
            </div>

            {/* Additional Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated recommendations based on current data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">High maintenance demand</p>
                      <p className="text-xs text-muted-foreground">12 assets require maintenance in the next 30 days. Consider scheduling batches to optimize costs.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Aging asset fleet</p>
                      <p className="text-xs text-muted-foreground">45 assets are over 10 years old. Plan for replacement to reduce maintenance costs.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Utilization opportunity</p>
                      <p className="text-xs text-muted-foreground">120 assets are available. Consider cross-department utilization to maximize ROI.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
