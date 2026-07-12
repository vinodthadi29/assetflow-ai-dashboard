'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus, AlertCircle } from 'lucide-react'
import { AllocationTable } from '@/components/allocations/allocation-table'
import { AllocationForm } from '@/components/allocations/allocation-form'
import useSWR, { mutate } from 'swr'

interface Allocation {
  id: string
  allocationId: string
  asset: { name: string; assetId: string }
  toUser: { name: string }
  status: string
  startDate: string
  endDate?: string
  reason?: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AllocationsPage() {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, isLoading, error: fetchError } = useSWR('/api/allocations', fetcher, {
    revalidateOnFocus: false,
  })

  const allocations: Allocation[] = data?.data || []
  const assets = data?.assets || []
  const users = data?.users || []

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create allocation')
      mutate('/api/allocations')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create allocation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/allocations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })
      if (!response.ok) throw new Error('Failed to approve allocation')
      mutate('/api/allocations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve allocation')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/allocations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })
      if (!response.ok) throw new Error('Failed to reject allocation')
      mutate('/api/allocations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject allocation')
    }
  }

  const handleReturn = async (id: string) => {
    try {
      const response = await fetch(`/api/allocations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      if (!response.ok) throw new Error('Failed to mark allocation as returned')
      mutate('/api/allocations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return allocation')
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
                <h1 className="text-3xl font-bold">Asset Allocations</h1>
                <p className="text-muted-foreground">Manage asset allocations and transfers</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Allocation
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Allocations</div>
                <div className="text-2xl font-bold mt-2">{allocations.length}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold mt-2">
                  {allocations.filter((a) => a.status === 'PENDING').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold mt-2">
                  {allocations.filter((a) => a.status === 'APPROVED').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold mt-2">
                  {allocations.filter((a) => a.status === 'COMPLETED').length}
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

            {/* Table */}
            <AllocationTable
              allocations={allocations}
              isLoading={isLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              onReturn={handleReturn}
            />
          </div>
        </main>
      </div>

      {/* Allocation Form Modal */}
      {showForm && (
        <AllocationForm
          assets={assets}
          users={users}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}
