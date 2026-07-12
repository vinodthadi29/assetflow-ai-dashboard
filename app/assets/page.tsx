'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus, Download, Upload, BarChart3, AlertCircle } from 'lucide-react'
import { AssetTable } from '@/components/assets/asset-table'
import { AssetFilters, type AssetFilters as AssetFiltersType } from '@/components/assets/asset-filters'
import { AssetForm } from '@/components/assets/asset-form'
import useSWR, { mutate } from 'swr'

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
  description?: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AssetsPage() {
  const [filters, setFilters] = useState<AssetFiltersType>({ search: '' })
  const [sortBy, setSortBy] = useState('assetId')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build query string
  const queryParams = new URLSearchParams()
  if (filters.search) queryParams.append('search', filters.search)
  if (filters.category) queryParams.append('category', filters.category)
  if (filters.status) queryParams.append('status', filters.status)
  if (filters.location) queryParams.append('location', filters.location)
  queryParams.append('sortBy', sortBy)
  queryParams.append('sortOrder', sortOrder)

  const { data, isLoading, error: fetchError } = useSWR(
    `/api/assets?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const assets: Asset[] = data?.data || []
  const categories = [...new Set(assets.map((a) => a.category))].filter(Boolean)
  const statuses = [...new Set(assets.map((a) => a.status))].filter(Boolean)
  const locations = [...new Set(assets.map((a) => a.location))].filter(Boolean)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    try {
      const response = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete asset')
      mutate(`/api/assets?${queryParams.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}/duplicate`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to duplicate asset')
      mutate(`/api/assets?${queryParams.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate asset')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RETIRED' }),
      })
      if (!response.ok) throw new Error('Failed to archive asset')
      mutate(`/api/assets?${queryParams.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive asset')
    }
  }

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const method = editingAsset ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save asset')
      mutate(`/api/assets?${queryParams.toString()}`)
      setShowForm(false)
      setEditingAsset(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/assets/export?format=csv&${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to export assets')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export assets')
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
                <h1 className="text-3xl font-bold">Assets Inventory</h1>
                <p className="text-muted-foreground">
                  Manage and track all enterprise assets
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setEditingAsset(null)
                    setShowForm(true)
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Assets</div>
                <div className="text-2xl font-bold mt-2">{assets.length}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Available</div>
                <div className="text-2xl font-bold mt-2">
                  {assets.filter((a) => a.status === 'AVAILABLE').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">In Use</div>
                <div className="text-2xl font-bold mt-2">
                  {assets.filter((a) => a.status === 'IN_USE').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">In Maintenance</div>
                <div className="text-2xl font-bold mt-2">
                  {assets.filter((a) => a.status === 'IN_MAINTENANCE').length}
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

            {/* Filters */}
            <AssetFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              statuses={statuses}
              locations={locations}
            />

            {/* Table */}
            <AssetTable
              assets={assets}
              isLoading={isLoading}
              onDelete={handleDelete}
              onEdit={(asset) => {
                setEditingAsset(asset)
                setShowForm(true)
              }}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
        </main>
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <AssetForm
          initialData={editingAsset ? {
            name: editingAsset.name,
            description: editingAsset.description || '',
            category: editingAsset.category,
            location: editingAsset.location,
            status: editingAsset.status,
            purchaseValue: editingAsset.purchaseValue?.toString() || '',
            currentValue: editingAsset.currentValue?.toString() || '',
            serialNumber: editingAsset.serialNumber || '',
          } : {}}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingAsset(null)
          }}
          isLoading={isSubmitting}
          isEditing={!!editingAsset}
        />
      )}
    </div>
  )
}
