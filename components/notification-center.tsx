'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}`,
    },
  }).then((res) => res.json())

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, mutate } = useSWR(
    mounted ? '/api/notifications?limit=10' : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const notifications = data?.data || []
  const unreadCount = data?.unreadCount || 0

  const handleMarkRead = async (notificationId: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ action: 'mark-read', notificationId }),
    })
    mutate()
  }

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ action: 'mark-all-read' }),
    })
    mutate()
  }

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-background rounded-lg transition"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 rounded-xl border border-border bg-card shadow-2xl z-50 max-h-96 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1 hover:bg-background rounded-lg transition"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-background rounded-lg transition"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification: any) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl
                        }
                        if (!notification.readAt) {
                          handleMarkRead(notification.id)
                        }
                      }}
                      className={`w-full text-left p-4 hover:bg-background transition flex items-start gap-3 ${
                        !notification.readAt ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.readAt && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
