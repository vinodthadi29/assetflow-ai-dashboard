'use client'

import { useState } from 'react'
import { ChevronDown, Edit, Trash2, MoreHorizontal, Copy, Archive } from 'lucide-react'
import Link from 'next/link'

interface Asset {
  id: string
  assetId: string
  name: string
  category: string
  status: string
  location: string
  purchaseValue?: number
  currentValue?: number
  serialNumber?: string
  assignedTo?: string
  createdAt: string
}

interface AssetTableProps {
  assets: Asset[]
  isLoading: boolean
  onDelete: (id: string) => void
  onEdit: (asset: Asset) => void
  onDuplicate: (id: string) => void
  onArchive: (id: string) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (field: string) => void
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  IN_USE: 'bg-blue-100 text-blue-800',
  IN_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  RESERVED: 'bg-purple-100 text-purple-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  LOST: 'bg-red-100 text-red-800',
  DAMAGED: 'bg-orange-100 text-orange-800',
}

export function AssetTable({
  assets,
  isLoading,
  onDelete,
  onEdit,
  onDuplicate,
  onArchive,
  sortBy,
  sortOrder,
  onSort,
}: AssetTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="h-96 flex items-center justify-center">
          <div className="text-muted-foreground">Loading assets...</div>
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="h-96 flex flex-col items-center justify-center gap-2">
          <div className="text-lg font-semibold text-foreground">No assets found</div>
          <div className="text-sm text-muted-foreground">Create your first asset to get started</div>
        </div>
      </div>
    )
  }

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <th className="px-6 py-3 text-left">
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
      >
        {label}
        {sortBy === field && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              sortOrder === 'desc' ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
    </th>
  )

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <SortHeader field="assetId" label="Asset ID" />
            <SortHeader field="name" label="Name" />
            <SortHeader field="category" label="Category" />
            <SortHeader field="status" label="Status" />
            <th className="px-6 py-3 text-left font-semibold text-foreground">Location</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Assigned To</th>
            <th className="px-6 py-3 text-right font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-muted/50 transition">
              <td className="px-6 py-4">
                <Link
                  href={`/assets/${asset.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {asset.assetId}
                </Link>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-foreground">{asset.name}</div>
                {asset.serialNumber && (
                  <div className="text-xs text-muted-foreground">SN: {asset.serialNumber}</div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-foreground">{asset.category}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[asset.status] || 'bg-gray-100 text-gray-800'}`}>
                  {asset.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-foreground">{asset.location}</td>
              <td className="px-6 py-4 text-sm text-foreground">{asset.assignedTo || '-'}</td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === asset.id ? null : asset.id)}
                      className="p-2 hover:bg-muted rounded-lg transition"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === asset.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            onEdit(asset)
                            setOpenMenuId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDuplicate(asset.id)
                            setOpenMenuId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            onArchive(asset.id)
                            setOpenMenuId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                        <button
                          onClick={() => {
                            onDelete(asset.id)
                            setOpenMenuId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
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
