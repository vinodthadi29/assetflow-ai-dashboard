'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AllocationFormData {
  assetId: string
  toUserId: string
  startDate: string
  endDate: string
  reason: string
}

interface AllocationFormProps {
  assets: Array<{ id: string; assetId: string; name: string }>
  users: Array<{ id: string; name: string }>
  onSubmit: (data: AllocationFormData) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export function AllocationForm({
  assets,
  users,
  onSubmit,
  onClose,
  isLoading = false,
}: AllocationFormProps) {
  const [formData, setFormData] = useState<AllocationFormData>({
    assetId: '',
    toUserId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: '',
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
    if (!formData.assetId) newErrors.assetId = 'Asset is required'
    if (!formData.toUserId) newErrors.toUserId = 'User is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }
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
      <div className="bg-card border border-border rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Allocate Asset</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset *</label>
            <select
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetId} - {asset.name}
                </option>
              ))}
            </select>
            {errors.assetId && <p className="text-xs text-destructive mt-1">{errors.assetId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assign To *</label>
            <select
              name="toUserId"
              value={formData.toUserId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.toUserId && <p className="text-xs text-destructive mt-1">{errors.toUserId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Reason for allocation..."
            />
          </div>

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
              {isLoading ? 'Allocating...' : 'Allocate Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
