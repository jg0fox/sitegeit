'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { toast } from 'sonner'

interface ProfileData {
  full_name: string
  email: string
  avatar_url: string
  calendly_link: string
  email_signature: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileData>({
    full_name: '',
    email: '',
    avatar_url: '',
    calendly_link: '',
    email_signature: '',
  })

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/settings/profile')
      if (res.ok) {
        const data = await res.json()
        setForm({
          full_name: data.full_name || '',
          email: data.email || '',
          avatar_url: data.avatar_url || '',
          calendly_link: data.calendly_link || '',
          email_signature: data.email_signature || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          avatar_url: form.avatar_url,
          calendly_link: form.calendly_link,
          email_signature: form.email_signature,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to update profile')
        return
      }
      toast.success('Profile updated')
      router.refresh()
    } catch {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="py-12 text-center text-sm text-gray-400">Loading profile...</p>
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
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your operator info used in outreach emails and landing pages.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar fullName={form.full_name} avatarUrl={form.avatar_url} size="md" />
            <div className="text-sm text-gray-500">
              {form.avatar_url ? 'Avatar loaded from URL' : 'Showing initials'}
            </div>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="full_name"
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              disabled
              className="mt-1 block w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">Email is managed by authentication.</p>
          </div>

          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <input
              id="avatar_url"
              type="url"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outreach configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="calendly_link" className="block text-sm font-medium text-gray-700">
              Calendly link
            </label>
            <input
              id="calendly_link"
              type="url"
              value={form.calendly_link}
              onChange={(e) => setForm({ ...form, calendly_link: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://calendly.com/your-name"
            />
            <p className="mt-1 text-xs text-gray-400">
              Used in outreach emails and landing pages for booking meetings.
            </p>
          </div>

          <div>
            <label htmlFor="email_signature" className="block text-sm font-medium text-gray-700">
              Email signature
            </label>
            <textarea
              id="email_signature"
              rows={4}
              value={form.email_signature}
              onChange={(e) => setForm({ ...form, email_signature: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name&#10;Your title&#10;your@email.com"
            />
            <p className="mt-1 text-xs text-gray-400">
              Appended to outreach emails. Plain text only.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </div>
  )
}
