'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function RealtimeRefresh() {
  const router = useRouter()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let realtimeConnected = false

    const channel = supabase
      .channel('pipeline-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'businesses' },
        () => {
          router.refresh()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeConnected = true
          // Stop polling if we have a live connection
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[RealtimeRefresh] Subscription failed:', status, '— falling back to polling')
          realtimeConnected = false
          startPolling()
        }
      })

    function startPolling() {
      if (pollRef.current) return
      pollRef.current = setInterval(() => {
        if (!realtimeConnected) {
          router.refresh()
        }
      }, 10000) // Poll every 10 seconds as fallback
    }

    // Start polling as a safety net — will be cleared if realtime connects
    const pollDelay = setTimeout(() => {
      if (!realtimeConnected) {
        startPolling()
      }
    }, 5000)

    return () => {
      clearTimeout(pollDelay)
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
