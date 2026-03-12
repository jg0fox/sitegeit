'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  full_name: string | null
  email: string
  avatar_url: string | null
  calendly_link: string | null
  email_signature: string | null
}

let cachedProfile: UserProfile | null = null

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(cachedProfile)
  const [loading, setLoading] = useState(!cachedProfile)

  useEffect(() => {
    if (cachedProfile) return

    async function fetchProfile() {
      try {
        const res = await fetch('/api/settings/profile')
        if (res.ok) {
          const data = await res.json()
          cachedProfile = data
          setUser(data)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  function refresh() {
    cachedProfile = null
    setLoading(true)
    fetch('/api/settings/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          cachedProfile = data
          setUser(data)
        }
      })
      .finally(() => setLoading(false))
  }

  return { user, loading, refresh }
}
