'use client'

import { CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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

interface AllocationTableProps {
  allocations: Allocation[]
  isLoading: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onReturn: (id: string) => void
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export function AllocationTable({
  allocations,
  isLoading,
  onApprove,
  onReject,
  onReturn,
}: AllocationTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="h-96 flex items-center justify-center">
          <div className="text-muted-foreground">Loading allocations...</div>
        </div>
      </div>
    )
  }

  if (allocations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="h-96 flex flex-col items-center justify-center gap-2">
          <div className="text-lg font-semibold text-foreground">No allocations found</div>
          <div className="text-sm text-muted-foreground">Create your first allocation to get started</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Allocation ID</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Asset</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Assigned To</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Period</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
            <th className="px-6 py-3 text-right font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {allocations.map((allocation) => (
            <tr key={allocation.id} className="hover:bg-muted/50 transition">
              <td className="px-6 py-4">
                <Link href={`/allocations/${allocation.id}`} className="font-medium text-primary hover:underline">
                  {allocation.allocationId}
                </Link>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-foreground">{allocation.asset.name}</div>
                <div className="text-xs text-muted-foreground">{allocation.asset.assetId}</div>
              </td>
              <td className="px-6 py-4 text-sm text-foreground">{allocation.toUser.name}</td>
              <td className="px-6 py-4 text-sm text-foreground">
                {new Date(allocation.startDate).toLocaleDateString()} -
                {allocation.endDate ? ` ${new Date(allocation.endDate).toLocaleDateString()}` : ' Open'}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[allocation.status] || 'bg-gray-100 text-gray-800'}`}>
                  {allocation.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === allocation.id ? null : allocation.id)}
                      className="p-2 hover:bg-muted rounded-lg transition"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === allocation.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                        {allocation.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                onApprove(allocation.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                onReject(allocation.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {allocation.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              onReturn(allocation.id)
                              setOpenMenuId(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            Mark as Returned
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
