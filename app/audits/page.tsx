'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import useSWR, { mutate } from 'swr'

interface AuditRecord {
  id: string
  auditId: string
  asset?: { name: string; assetId: string }
  status: string
  discrepancies: number
  verifiedAt?: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AuditsPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ assetId: '', notes: '' })

  const { data, isLoading, error: fetchError } = useSWR('/api/audits', fetcher, {
    revalidateOnFocus: false,
  })

  const audits: AuditRecord[] = data?.data || []
  const assets = data?.assets || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create audit')
      mutate('/api/audits')
      setShowForm(false)
      setFormData({ assetId: '', notes: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/audits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update audit')
      mutate('/api/audits')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update audit')
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
                <h1 className="text-3xl font-bold">Audit Management</h1>
                <p className="text-muted-foreground">Asset audits and compliance tracking</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Audit
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Audits</div>
                <div className="text-2xl font-bold mt-2">{audits.length}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold mt-2">
                  {audits.filter((a) => a.status === 'PENDING').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Verified</div>
                <div className="text-2xl font-bold mt-2">
                  {audits.filter((a) => a.status === 'VERIFIED').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Discrepancies</div>
                <div className="text-2xl font-bold mt-2">{audits.reduce((sum, a) => sum + a.discrepancies, 0)}</div>
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
                  <div>
                    <label className="block text-sm font-medium mb-1">Asset (Optional)</label>
                    <select
                      value={formData.assetId}
                      onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="">All Assets</option>
                      {assets.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.assetId} - {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                      {isSubmitting ? 'Creating...' : 'Start Audit'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Audits Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Audit ID</th>
                    <th className="px-6 py-3 text-left font-semibold">Asset</th>
                    <th className="px-6 py-3 text-left font-semibold">Discrepancies</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {audits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No audit records
                      </td>
                    </tr>
                  ) : (
                    audits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 font-medium text-primary">{audit.auditId}</td>
                        <td className="px-6 py-4">{audit.asset?.name || 'System Audit'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${audit.discrepancies > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {audit.discrepancies} found
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {audit.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleVerify(audit.id, 'VERIFIED')}
                                  className="p-1 hover:bg-green-100 rounded transition"
                                  title="Verify"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </button>
                                <button
                                  onClick={() => handleVerify(audit.id, 'REJECTED')}
                                  className="p-1 hover:bg-red-100 rounded transition"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </button>
                              </>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {audit.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{new Date(audit.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <a href={`/audits/${audit.id}`} className="text-primary hover:underline">
                            View
                          </a>
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
