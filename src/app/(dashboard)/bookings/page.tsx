'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { EmailComposeDialog } from '@/components/shared/EmailComposeDialog'
import { EmailThread } from '@/components/shared/EmailThread'

interface Booking {
  id: string
  start_time: string
  end_time: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  guest_message: string | null
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

function MeetingTypeBadge({ type }: { type: string }) {
  const label = type === 'zoom' ? 'Zoom' : type === 'phone' ? 'Phone' : 'In person'
  const icon = type === 'zoom' ? 'videocam' : type === 'phone' ? 'call' : 'location_on'
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {label}
    </span>
  )
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)
  const [emailBooking, setEmailBooking] = useState<Booking | null>(null)
  const [expandedThread, setExpandedThread] = useState<string | null>(null)

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
                <div key={b.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Name + status */}
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{b.guest_name}</p>
                        <StatusBadge status={b.status} />
                        <MeetingTypeBadge type={b.meeting_type} />
                      </div>

                      {/* Date/time */}
                      <p className="mt-1 text-sm text-gray-600">
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

                      {/* Contact info */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <a
                          href={`mailto:${b.guest_email}`}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          {b.guest_email}
                        </a>
                        {b.guest_phone && (
                          <a
                            href={`tel:${b.guest_phone}`}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            {b.guest_phone}
                          </a>
                        )}
                      </div>

                      {/* Guest message */}
                      {b.guest_message && (
                        <p className="mt-2 rounded bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 italic">
                          &ldquo;{b.guest_message}&rdquo;
                        </p>
                      )}

                      {/* Linked business */}
                      {b.businesses && (
                        <Link
                          href={`/pipeline/${b.businesses.id}`}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-[14px]">storefront</span>
                          {b.businesses.name}
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 flex-col items-end gap-2">
                      <button
                        onClick={() => setEmailBooking(b)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Email
                      </button>
                      {b.zoom_join_url && (
                        <a
                          href={b.zoom_join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">videocam</span>
                          Join Zoom
                        </a>
                      )}
                      <button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Thread toggle */}
                  <button
                    onClick={() => setExpandedThread(expandedThread === b.id ? null : b.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">forum</span>
                    Email history
                    <span className="material-symbols-outlined text-[14px]">
                      {expandedThread === b.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {/* Email thread */}
                  {expandedThread === b.id && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <EmailThread
                        bookingId={b.id}
                        businessId={b.businesses?.id}
                        recipientEmail={b.guest_email}
                        recipientName={b.guest_name}
                        defaultSubject={`Your upcoming appointment — ${new Date(b.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                      />
                    </div>
                  )}
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
                  <div key={b.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{b.guest_name}</p>
                          <StatusBadge status={b.status} />
                          <MeetingTypeBadge type={b.meeting_type} />
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
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
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            {b.guest_email}
                          </span>
                          {b.guest_phone && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <span className="material-symbols-outlined text-[14px]">call</span>
                              {b.guest_phone}
                            </span>
                          )}
                        </div>
                        {b.businesses && (
                          <Link
                            href={`/pipeline/${b.businesses.id}`}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <span className="material-symbols-outlined text-[14px]">storefront</span>
                            {b.businesses.name}
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Email dialog */}
      {emailBooking && (
        <EmailComposeDialog
          recipientEmail={emailBooking.guest_email}
          recipientName={emailBooking.guest_name}
          bookingId={emailBooking.id}
          businessId={emailBooking.businesses?.id}
          defaultSubject={`Your upcoming appointment — ${new Date(emailBooking.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
          onClose={() => setEmailBooking(null)}
          onSent={loadBookings}
        />
      )}
    </div>
  )
}
