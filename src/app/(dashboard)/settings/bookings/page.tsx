'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Booking {
  id: string
  start_time: string
  end_time: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  meeting_type: string
  status: string
  zoom_join_url: string | null
  businesses: { id: string; name: string; category: string } | null
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'border-green-200 bg-green-50 text-green-700',
    rescheduled: 'border-blue-200 bg-blue-50 text-blue-700',
    cancelled: 'border-red-200 bg-red-50 text-red-700',
    completed: 'border-gray-200 bg-gray-50 text-gray-600',
    no_show: 'border-orange-200 bg-orange-50 text-orange-700',
  }
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] || styles.confirmed}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)

  async function loadBookings() {
    const res = await fetch('/api/bookings')
    if (res.ok) {
      setBookings(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
  }, [])

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Booking marked as ${status.replace('_', ' ')}`)
      loadBookings()
    } else {
      toast.error('Failed to update booking')
    }
  }

  const now = new Date()
  const upcoming = bookings.filter(
    (b) => new Date(b.start_time) >= now && ['confirmed', 'rescheduled'].includes(b.status)
  )
  const past = bookings.filter(
    (b) => new Date(b.start_time) < now || !['confirmed', 'rescheduled'].includes(b.status)
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to settings
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your upcoming and past bookings.
        </p>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming ({upcoming.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No upcoming bookings</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcoming.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{b.guest_name}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(b.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(b.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      {' · '}
                      {b.meeting_type === 'zoom' ? 'Zoom' : b.meeting_type === 'phone' ? 'Phone' : 'In person'}
                    </p>
                    {b.businesses && (
                      <Link
                        href={`/businesses/${b.businesses.id}`}
                        className="mt-0.5 text-xs text-primary hover:underline"
                      >
                        {b.businesses.name}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {b.zoom_join_url && (
                      <a
                        href={b.zoom_join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Join Zoom
                      </a>
                    )}
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past bookings */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex w-full items-center justify-between"
          >
            <CardTitle>Past ({past.length})</CardTitle>
            <span className="material-symbols-outlined text-[20px] text-gray-400">
              {showPast ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </CardHeader>
        {showPast && (
          <CardContent>
            {past.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No past bookings</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {past.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{b.guest_name}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(b.start_time).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(b.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                      {b.businesses && (
                        <Link
                          href={`/businesses/${b.businesses.id}`}
                          className="mt-0.5 text-xs text-primary hover:underline"
                        >
                          {b.businesses.name}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {['confirmed', 'rescheduled'].includes(b.status) && new Date(b.start_time) < now && (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, 'completed')}
                            className="rounded-md border border-green-200 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'no_show')}
                            className="rounded-md border border-orange-200 px-2.5 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50"
                          >
                            No-show
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
