'use client'

import { useState } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'

interface BookingFormProps {
  assetId: string
  assetName: string
  onClose: () => void
  onSuccess?: () => void
}

export function BookingForm({ assetId, assetName, onClose, onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    purpose: '',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    available: boolean
    conflicts: string[]
  } | null>(null)

  const handleCheckAvailability = async () => {
    if (!formData.startDate || !formData.endDate) return

    setIsLoading(true)
    try {
      // TODO: Call API to check availability
      // For now, mock response
      setCheckResult({
        available: true,
        conflicts: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.startDate || !formData.endDate || !checkResult?.available) {
      return
    }

    setIsLoading(true)
    try {
      // TODO: Create booking via API
      onSuccess?.()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold">Book Asset</h2>
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

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date
              <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, startDate: e.target.value })
                setCheckResult(null)
              }}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              End Date
              <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => {
                setFormData({ ...formData, endDate: e.target.value })
                setCheckResult(null)
              }}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Purpose
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground focus:border-primary outline-none transition resize-none"
              rows={3}
              placeholder="What will you use this asset for?"
            />
          </div>

          {/* Availability Check */}
          {!checkResult && formData.startDate && formData.endDate && (
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-background/50 transition font-medium disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Check Availability'}
            </button>
          )}

          {/* Availability Result */}
          {checkResult && (
            <div className={`flex gap-3 p-4 rounded-lg border ${
              checkResult.available
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {checkResult.available ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                {checkResult.available ? (
                  <p className="text-green-200">This asset is available for the selected dates.</p>
                ) : (
                  <>
                    <p className="text-red-200 mb-2">This asset has conflicts:</p>
                    <ul className="list-disc list-inside text-red-200">
                      {checkResult.conflicts.map((conflict, i) => (
                        <li key={i}>{conflict}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              Calendar bookings prevent allocation conflicts and ensure fair resource sharing.
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
              disabled={isLoading || !checkResult?.available}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
