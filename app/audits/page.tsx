'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus } from 'lucide-react'

export default function AuditsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Audit Management</h1>
                <p className="text-muted-foreground">Asset audits and compliance tracking</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Audit
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Audit Trails</h3>
              <p className="text-muted-foreground">Audit management system coming soon</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
