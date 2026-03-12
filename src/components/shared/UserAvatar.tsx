import { cn } from '@/lib/utils/cn'

interface UserAvatarProps {
  fullName?: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return (parts[0]?.[0] || '?').toUpperCase()
}

export function UserAvatar({ fullName, avatarUrl, size = 'sm' }: UserAvatarProps) {
  const sizeClass = size === 'md' ? 'h-9 w-9' : 'h-8 w-8'
  const textClass = size === 'md' ? 'text-sm' : 'text-xs'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'User avatar'}
        className={cn(sizeClass, 'rounded-full object-cover')}
      />
    )
  }

  const initials = fullName ? getInitials(fullName) : '?'

  return (
    <div
      className={cn(
        sizeClass,
        textClass,
        'flex items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600'
      )}
    >
      {initials}
    </div>
  )
}
