'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'

export interface AssetFilters {
  search: string
  category?: string
  status?: string
  location?: string
  condition?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

interface AssetFiltersProps {
  filters: AssetFilters
  onFiltersChange: (filters: AssetFilters) => void
  categories: string[]
  statuses: string[]
  locations: string[]
}

const ASSET_STATUSES = [
  'AVAILABLE',
  'IN_USE',
  'IN_MAINTENANCE',
  'RESERVED',
  'RETIRED',
  'LOST',
  'DAMAGED',
]

export function AssetFilters({
  filters,
  onFiltersChange,
  categories,
  statuses = ASSET_STATUSES,
  locations,
}: AssetFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })
  }

  const handleLocationChange = (value: string) => {
    onFiltersChange({ ...filters, location: value === 'all' ? undefined : value })
  }

  const handleClearFilters = () => {
    onFiltersChange({ search: '' })
  }

  const hasActiveFilters = filters.search || filters.category || filters.status || filters.location

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by asset name, ID, or serial number..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={filters.category || 'all'}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={filters.status || 'all'}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.location || 'all'}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
