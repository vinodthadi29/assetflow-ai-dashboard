'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AIOperationsCenter } from '@/components/dashboard/ai-operations-center'
import { SmartAnalytics } from '@/components/dashboard/smart-analytics'
import { AssetsList } from '@/components/dashboard/assets-list'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { MaintenanceSchedule } from '@/components/dashboard/maintenance-schedule'
import { ProtectedRoute } from '@/components/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Good Morning, Asset Manager</h1>
              <p className="text-muted-foreground">AI-powered operations center showing critical insights.</p>
            </div>

            {/* AI Operations Center - Featured Section */}
            <AIOperationsCenter />

            {/* Stats Cards */}
            <StatsCards />

            {/* Smart Analytics */}
            <SmartAnalytics />

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AssetsList />
              </div>
              <div className="space-y-8">
                <MaintenanceSchedule />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  )
}
