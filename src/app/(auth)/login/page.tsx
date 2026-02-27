'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Could not send magic link. Check your email and try again.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sitegeit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lead pipeline &amp; website generator
        </p>
      </div>

      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-card">
        {sent ? (
          <div className="text-center">
            <span className="material-symbols-outlined mb-3 text-4xl text-primary">
              mark_email_read
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We sent a sign-in link to{' '}
              <span className="font-medium text-gray-700">{email}</span>. Click
              the link to sign in.
            </p>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="mt-4 text-sm font-medium text-primary hover:text-primary-hover"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900">Sign in</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your email to receive a sign-in link.
            </p>

            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending link...' : 'Send sign-in link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
