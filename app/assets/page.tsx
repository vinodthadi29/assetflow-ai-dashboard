'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus, Filter } from 'lucide-react'

export default function AssetsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Assets Inventory</h1>
                <p className="text-muted-foreground">Manage and track all enterprise assets</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-card transition flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Assets Inventory</h3>
              <p className="text-muted-foreground">Full asset inventory management coming soon</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
