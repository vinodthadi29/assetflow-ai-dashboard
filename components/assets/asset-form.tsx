'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AssetFormData {
  name: string
  description: string
  category: string
  subcategory: string
  location: string
  status: string
  purchaseDate: string
  purchaseValue: string
  currentValue: string
  manufacturer: string
  model: string
  serialNumber: string
  warrantyExpiry: string
  depreciationRate: string
  assignedTo: string
  notes: string
}

interface AssetFormProps {
  initialData?: Partial<AssetFormData>
  onSubmit: (data: AssetFormData) => Promise<void>
  onClose: () => void
  isLoading?: boolean
  isEditing?: boolean
}

const ASSET_CATEGORIES = [
  'COMPUTERS',
  'MONITORS',
  'FURNITURE',
  'EQUIPMENT',
  'VEHICLES',
  'MACHINERY',
  'TOOLS',
  'OTHER',
]

const ASSET_STATUSES = [
  'AVAILABLE',
  'IN_USE',
  'IN_MAINTENANCE',
  'RESERVED',
  'RETIRED',
  'LOST',
  'DAMAGED',
]

export function AssetForm({
  initialData = {},
  onSubmit,
  onClose,
  isLoading = false,
  isEditing = false,
}: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    category: initialData.category || '',
    subcategory: initialData.subcategory || '',
    location: initialData.location || '',
    status: initialData.status || 'AVAILABLE',
    purchaseDate: initialData.purchaseDate || '',
    purchaseValue: initialData.purchaseValue || '',
    currentValue: initialData.currentValue || '',
    manufacturer: initialData.manufacturer || '',
    model: initialData.model || '',
    serialNumber: initialData.serialNumber || '',
    warrantyExpiry: initialData.warrantyExpiry || '',
    depreciationRate: initialData.depreciationRate || '0',
    assignedTo: initialData.assignedTo || '',
    notes: initialData.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Asset name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('[v0] Form submission error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Asset' : 'Create New Asset'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Asset Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Dell Laptop"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Asset description..."
            />
          </div>

          {/* Location and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Office A-203"
              />
              {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {ASSET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Dell"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., XPS 13"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serial Number</label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., ABCD1234567890"
            />
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Warranty Expiry</label>
              <input
                type="date"
                name="warrantyExpiry"
                value={formData.warrantyExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Value</label>
              <input
                type="number"
                name="purchaseValue"
                value={formData.purchaseValue}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Value</label>
              <input
                type="number"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Depreciation Rate (%)</label>
              <input
                type="number"
                name="depreciationRate"
                value={formData.depreciationRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Employee name or ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Asset' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
