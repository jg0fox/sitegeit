import Link from 'next/link'
import { TierBadge } from '@/components/shared/TierBadge'
import { formatDistanceToNow } from 'date-fns'

interface ClientBusiness {
  id: string
  name: string
  category: string | null
  status: string
  tier: string | null
  monthly_rate: number | null
  converted_at: string | null
  address_city: string | null
  address_state: string | null
  generated_sites: { deploy_url: string | null; custom_domain: string | null }[]
}

interface ClientListProps {
  businesses: ClientBusiness[]
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-500',
  churned: 'bg-red-400',
  closed_won: 'bg-emerald-400',
  closed_lost: 'bg-gray-400',
}

export function ClientList({ businesses }: ClientListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-3 font-medium text-gray-500">Business</th>
            <th className="hidden px-4 py-3 font-medium text-gray-500 sm:table-cell">Tier</th>
            <th className="hidden px-4 py-3 font-medium text-gray-500 md:table-cell">Rate</th>
            <th className="hidden px-4 py-3 font-medium text-gray-500 md:table-cell">Domain</th>
            <th className="hidden px-4 py-3 font-medium text-gray-500 lg:table-cell">Converted</th>
            <th className="px-4 py-3 font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {businesses.map((b) => {
            const site = b.generated_sites?.[0]
            const domain = site?.custom_domain || site?.deploy_url || null

            return (
              <tr key={b.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/clients/${b.id}`}
                    className="font-medium text-gray-900 hover:text-primary"
                  >
                    {b.name}
                  </Link>
                  {(b.address_city || b.category) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[b.category, b.address_city && b.address_state ? `${b.address_city}, ${b.address_state}` : b.address_city].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {b.tier ? <TierBadge tier={b.tier} /> : <span className="text-gray-400">—</span>}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {b.monthly_rate ? (
                    <span className="font-medium text-gray-900">${b.monthly_rate}/mo</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {domain ? (
                    <span className="text-xs text-gray-600">{domain}</span>
                  ) : (
                    <span className="text-xs text-gray-400">No site</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  {b.converted_at ? (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(b.converted_at), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${STATUS_DOT[b.status] || 'bg-gray-300'}`}
                    />
                    <span className="text-xs capitalize text-gray-600">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
