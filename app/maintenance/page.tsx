'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus, AlertCircle, Wrench } from 'lucide-react'
import useSWR, { mutate } from 'swr'

interface MaintenanceTicket {
  id: string
  ticketId: string
  asset: { name: string; assetId: string }
  type: string
  status: string
  description?: string
  createdAt: string
  dueDate?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MaintenancePage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ assetId: '', type: 'PREVENTIVE', description: '' })

  const { data, isLoading, error: fetchError } = useSWR('/api/maintenance', fetcher, {
    revalidateOnFocus: false,
  })

  const tickets: MaintenanceTicket[] = data?.data || []
  const assets = data?.assets || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create ticket')
      mutate('/api/maintenance')
      setShowForm(false)
      setFormData({ assetId: '', type: 'PREVENTIVE', description: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update ticket')
      mutate('/api/maintenance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-hidden">
        <Header />

        <main className="overflow-y-auto">
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Maintenance</h1>
                <p className="text-muted-foreground">Track maintenance schedules and tickets</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Tickets</div>
                <div className="text-2xl font-bold mt-2">{tickets.length}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Open</div>
                <div className="text-2xl font-bold mt-2">
                  {tickets.filter((t) => t.status === 'OPEN').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold mt-2">
                  {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold mt-2">
                  {tickets.filter((t) => t.status === 'COMPLETED').length}
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {(error || fetchError) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div className="text-sm text-destructive">
                  {error || fetchError?.message || 'An error occurred'}
                </div>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="bg-card border border-border rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Asset</label>
                      <select
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      >
                        <option value="">Select Asset</option>
                        {assets.map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.assetId} - {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      >
                        <option value="PREVENTIVE">Preventive</option>
                        <option value="CORRECTIVE">Corrective</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tickets Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Ticket ID</th>
                    <th className="px-6 py-3 text-left font-semibold">Asset</th>
                    <th className="px-6 py-3 text-left font-semibold">Type</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Created</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No maintenance tickets
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 font-medium text-primary">{ticket.ticketId}</td>
                        <td className="px-6 py-4">{ticket.asset.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {ticket.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                            className="px-2 py-1 rounded text-xs border border-border bg-background"
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <Wrench className="w-4 h-4 inline text-muted-foreground" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
