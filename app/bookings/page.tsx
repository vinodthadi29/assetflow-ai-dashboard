'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Plus, AlertCircle, Calendar } from 'lucide-react'
import useSWR, { mutate } from 'swr'

interface Booking {
  id: string
  bookingId: string
  asset: { name: string; assetId: string }
  user: { name: string }
  status: string
  startDate: string
  endDate: string
  purpose?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BookingsPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ assetId: '', startDate: '', endDate: '', purpose: '' })

  const { data, isLoading, error: fetchError } = useSWR('/api/bookings', fetcher, {
    revalidateOnFocus: false,
  })

  const bookings: Booking[] = data?.data || []
  const assets = data?.assets || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to create booking')
      mutate('/api/bookings')
      setShowForm(false)
      setFormData({ assetId: '', startDate: '', endDate: '', purpose: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
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
                <h1 className="text-3xl font-bold">Asset Bookings</h1>
                <p className="text-muted-foreground">Calendar-based resource booking system</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Booking
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Bookings</div>
                <div className="text-2xl font-bold mt-2">{bookings.length}</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold mt-2">
                  {bookings.filter((b) => b.status === 'PENDING').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-bold mt-2">
                  {bookings.filter((b) => b.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold mt-2">
                  {bookings.filter((b) => b.status === 'COMPLETED').length}
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

            {/* Form */}
            {showForm && (
              <div className="bg-card border border-border rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Asset</label>
                      <select
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      >
                        <option value="">Select Asset</option>
                        {assets.map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.assetId} - {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Purpose</label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                        placeholder="Purpose of booking"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      />
                    </div>
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
                      {isSubmitting ? 'Creating...' : 'Create Booking'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Calendar View */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Booking Calendar</h2>
              </div>
              <div className="text-muted-foreground text-center py-12">
                <p>Calendar view of bookings will display here</p>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Booking ID</th>
                    <th className="px-6 py-3 text-left font-semibold">Asset</th>
                    <th className="px-6 py-3 text-left font-semibold">Booked By</th>
                    <th className="px-6 py-3 text-left font-semibold">Period</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 font-medium text-primary">{booking.bookingId}</td>
                        <td className="px-6 py-4">{booking.asset.name}</td>
                        <td className="px-6 py-4">{booking.user.name}</td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {booking.status}
                          </span>
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
