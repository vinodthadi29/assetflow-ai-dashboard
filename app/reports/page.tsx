'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDown, RefreshCw, Eye } from 'lucide-react'

const reports = [
  {
    id: 1,
    name: 'Monthly Asset Inventory',
    description: 'Complete asset count and status report',
    type: 'inventory',
    frequency: 'Monthly',
    lastGenerated: '2025-07-10',
    format: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 2,
    name: 'Maintenance Schedule',
    description: 'Upcoming maintenance tasks and history',
    type: 'maintenance',
    frequency: 'Weekly',
    lastGenerated: '2025-07-08',
    format: ['PDF', 'Excel'],
  },
  {
    id: 3,
    name: 'Depreciation Analysis',
    description: 'Asset value depreciation and cost analysis',
    type: 'financial',
    frequency: 'Quarterly',
    lastGenerated: '2025-07-01',
    format: ['PDF', 'Excel'],
  },
  {
    id: 4,
    name: 'Compliance Audit',
    description: 'Regulatory compliance and audit trail report',
    type: 'compliance',
    frequency: 'Annually',
    lastGenerated: '2025-06-15',
    format: ['PDF'],
  },
  {
    id: 5,
    name: 'Allocation Workflow',
    description: 'Asset allocation and transfer history',
    type: 'workflow',
    frequency: 'On Demand',
    lastGenerated: '2025-07-09',
    format: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 6,
    name: 'ROI Performance',
    description: 'Asset utilization and return on investment',
    type: 'analytics',
    frequency: 'Monthly',
    lastGenerated: '2025-07-05',
    format: ['PDF', 'Excel'],
  },
]

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Reports & Exports</h1>
              <p className="text-muted-foreground">Generate and download comprehensive reports in multiple formats</p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:border-primary/50 transition">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{report.name}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded">
                        {report.frequency}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last generated: {report.lastGenerated}</span>
                      <span className="text-xs text-muted-foreground">Available formats: {report.format.join(', ')}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                        <FileDown className="w-4 h-4" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <CardDescription>Create custom reports with selected data and filters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Report Name</label>
                      <input
                        type="text"
                        placeholder="Enter report name"
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Report Type</label>
                      <select className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none">
                        <option>Asset Inventory</option>
                        <option>Maintenance</option>
                        <option>Financial</option>
                        <option>Compliance</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Export Format</label>
                      <select className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none">
                        <option>PDF</option>
                        <option>Excel</option>
                        <option>CSV</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                      <FileDown className="w-4 h-4" />
                      Generate Report
                    </Button>
                    <Button variant="outline">Schedule Export</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
