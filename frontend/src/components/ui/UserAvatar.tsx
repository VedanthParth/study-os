import { cn } from '@/utils/cn'

interface UserAvatarProps {
  name: string
  size?: number
  className?: string
}

/** Initial-based avatar — warm ink disc, used in the top strip and sidebar card. */
export function UserAvatar({ name, size = 36, className }: UserAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] font-semibold text-[var(--button-primary-text)]',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
