'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-dialog'

interface PipelineActionsProps {
  businessId: string
  businessName: string
  status: string
}

export function PipelineActions({ businessId, businessName, status }: PipelineActionsProps) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const isArchived = status === 'archived'

  async function handleArchive() {
    setLoading(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isArchived ? 'discovered' : 'archived' }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
        router.push('/pipeline')
      }
    } finally {
      setLoading(false)
      setShowDelete(false)
    }
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="More actions"
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-700 outline-none hover:bg-gray-50"
              onSelect={handleArchive}
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isArchived ? 'unarchive' : 'archive'}
              </span>
              {isArchived ? 'Restore' : 'Archive'}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
              onSelect={() => setShowDelete(true)}
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Delete confirmation dialog */}
      <AlertDialog.Root open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-xl">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900">
              Delete {businessName}?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-500">
              This will permanently remove this prospect and all generated sites, landing pages, emails, and activity history. This cannot be undone.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Close asChild>
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50">
                  Cancel
                </button>
              </AlertDialog.Close>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
