'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface AllocationFormProps {
  assetId: string
  assetName: string
  onClose: () => void
  onSuccess?: () => void
}

export function AllocationForm({ assetId, assetName, onClose, onSuccess }: AllocationFormProps) {
  const [formData, setFormData] = useState({
    toUserId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.toUserId || !formData.startDate) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assetId, toUserId: formData.toUserId, startDate: formData.startDate, endDate: formData.endDate || undefined, reason: formData.reason || undefined }),
      })
      if (!res.ok) throw new Error('Failed')
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to create allocation:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold">Allocate Asset</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background rounded transition"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Asset Info */}
          <div className="p-4 bg-background/50 rounded-lg border border-border/30">
            <p className="text-sm text-muted-foreground">Asset</p>
            <p className="font-semibold">{assetName}</p>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Allocate To
              <span className="text-primary">*</span>
            </label>
            <select
              value={formData.toUserId}
              onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition"
              required
            >
              <option value="">Select user...</option>
              <option value="user-1">John Smith</option>
              <option value="user-2">Sarah Johnson</option>
              <option value="user-3">Mike Davis</option>
              <option value="user-4">Emily Brown</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date
              <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition"
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty for indefinite allocation</p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition resize-none"
              rows={3}
              placeholder="Why is this asset being allocated?"
            />
          </div>

          {/* Info */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              This allocation will require approval from an Asset Manager before becoming active.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-background/50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.toUserId || !formData.startDate}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Request Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
