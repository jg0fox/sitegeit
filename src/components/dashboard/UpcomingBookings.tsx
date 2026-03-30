'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking {
  id: string
  start_time: string
  end_time: string
  guest_name: string
  meeting_type: string
  zoom_join_url: string | null
  businesses: { id: string; name: string } | null
}

export function UpcomingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/bookings?upcoming=true')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.slice(0, 3))
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming bookings</CardTitle>
          <Link
            href="/settings/bookings"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            No upcoming bookings
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <div key={b.id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{b.guest_name}</p>
                  <span className="text-xs text-gray-400">
                    {b.meeting_type === 'zoom' ? 'Zoom' : b.meeting_type === 'phone' ? 'Phone' : 'In person'}
                  </span>
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
                    className="text-xs text-primary hover:underline"
                  >
                    {b.businesses.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
