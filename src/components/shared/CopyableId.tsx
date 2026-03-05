'use client'

import { useState } from 'react'

export function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  const short = id.slice(0, 8)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback — select text
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copy ID: ${id}`}
      className="inline-flex items-center gap-1 rounded px-1 py-0.5 font-mono text-[10px] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
    >
      #{short}
      <span className="material-symbols-outlined text-[12px]">
        {copied ? 'check' : 'content_copy'}
      </span>
    </button>
  )
}
