'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const CATEGORY_SUGGESTIONS = [
  'Plumber', 'Electrician', 'HVAC', 'Roofer', 'General Contractor', 'Handyman',
  'Auto Repair', 'Towing', 'Landscaper', 'Cleaning',
  'Dentist', 'Chiropractor', 'Veterinarian', 'Spa', 'Yoga', 'Gym',
  'Bakery', 'Restaurant', 'Cafe', 'Bar', 'Florist',
  'Lawyer', 'Accounting', 'Real Estate', 'Insurance',
  'Barber', 'Hair Salon', 'Nail Salon', 'Photography', 'Pet Groomer',
]

interface FormData {
  name: string
  category: string
  phone: string
  email: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
  website_url: string
  owner_name: string
}

const EMPTY_FORM: FormData = {
  name: '',
  category: '',
  phone: '',
  email: '',
  address_street: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  website_url: '',
  owner_name: '',
}

export function ManualAddDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM })

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.category.trim()) {
      toast.error('Name and category are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.name} added to pipeline`)
        setForm({ ...EMPTY_FORM })
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add business')
      }
    } catch {
      toast.error('Failed to add business')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Add manually
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Add business manually
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Add a business from an in-person meeting, referral, or demo. It will flow through the normal pipeline.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Name + Category (required) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Business name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Joe's Plumbing"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  list="category-suggestions"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Plumber"
                  required
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="joe@business.com"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-600">Street address</label>
              <input
                type="text"
                value={form.address_street}
                onChange={(e) => update('address_street', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">City</label>
                <input
                  type="text"
                  value={form.address_city}
                  onChange={(e) => update('address_city', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Phoenix"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">State</label>
                <input
                  type="text"
                  value={form.address_state}
                  onChange={(e) => update('address_state', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="AZ"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">ZIP</label>
                <input
                  type="text"
                  value={form.address_zip}
                  onChange={(e) => update('address_zip', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="85001"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Website + Owner */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Website URL</label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => update('website_url', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://joesplumbing.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Owner name</label>
                <input
                  type="text"
                  value={form.owner_name}
                  onChange={(e) => update('owner_name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Joe Smith"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button size="sm" type="submit" disabled={saving}>
                {saving ? 'Adding...' : 'Add to pipeline'}
              </Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
