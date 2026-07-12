'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { ArrowLeft, Edit2, Trash2, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function AssetDetailPage() {
  const [isEditing, setIsEditing] = useState(false)

  const asset = {
    id: 'AST-001',
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for development',
    category: 'COMPUTERS',
    status: 'IN_USE',
    location: 'Office A - Desk 1',
    owner: 'John Smith',
    purchaseDate: '2023-06-15',
    purchaseValue: 2499,
    currentValue: 1874,
    serialNumber: 'C02XXXXXX',
    qrCode: 'AST-001-QR',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16-inch (2023)',
    warranty: '2024-06-15',
    depreciationRate: 15,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Link href="/assets" className="p-2 hover:bg-card rounded-lg transition">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div>
                  <div className="text-sm text-primary font-medium">{asset.id}</div>
                  <h1 className="text-3xl font-bold">{asset.name}</h1>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-card rounded-lg transition" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-card rounded-lg transition">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500">
                {asset.status === 'IN_USE' ? 'In Use' : asset.status}
              </span>
              <span className="text-sm text-muted-foreground">{asset.location}</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Overview</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Category</label>
                      <p className="text-foreground font-medium">{asset.category}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Owner</label>
                      <p className="text-foreground font-medium">{asset.owner}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Location</label>
                      <p className="text-foreground font-medium">{asset.location}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Status</label>
                      <p className="text-foreground font-medium capitalize">{asset.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Technical Details</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Manufacturer</label>
                      <p className="text-foreground font-medium">{asset.manufacturer}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Model</label>
                      <p className="text-foreground font-medium">{asset.model}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Serial Number</label>
                      <p className="text-foreground font-medium text-sm">{asset.serialNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Warranty Expires</label>
                      <p className="text-foreground font-medium">{asset.warranty}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Financial Details</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Purchase Date</label>
                      <p className="text-foreground font-medium">{asset.purchaseDate}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Purchase Value</label>
                      <p className="text-foreground font-medium">${asset.purchaseValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Current Value</label>
                      <p className="text-foreground font-medium text-accent">${asset.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Depreciation Rate</label>
                      <p className="text-foreground font-medium">{asset.depreciationRate}% / year</p>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-border/30">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Allocated to John Smith</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pb-3 border-b border-border/30">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Asset created</p>
                        <p className="text-xs text-muted-foreground">June 15, 2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* QR Code */}
                <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
                  <QrCode className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">QR Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">{asset.qrCode}</p>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium">
                    Print QR Code
                  </button>
                </div>

                {/* Actions */}
                <div className="rounded-xl border border-border bg-card/50 p-6 space-y-3">
                  <button className="w-full px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition text-sm font-medium">
                    Allocate Asset
                  </button>
                  <button className="w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-background/50 transition text-sm font-medium">
                    Schedule Maintenance
                  </button>
                  <button className="w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-background/50 transition text-sm font-medium">
                    Create Booking
                  </button>
                </div>

                {/* Metadata */}
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <h3 className="font-semibold mb-4">Metadata</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">June 15, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="text-foreground">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asset ID</span>
                      <span className="text-foreground font-mono text-xs">{asset.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
