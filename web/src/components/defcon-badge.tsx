'use client'

import type { DefconLevel } from '@/lib/supabase/types'
import { useI18n } from '@/lib/i18n'

const DEFCON_STYLE: Record<
  DefconLevel,
  { color: string; bg: string; pulse: boolean }
> = {
  5: { color: 'text-defcon-5', bg: 'bg-defcon-5-bg', pulse: false },
  4: { color: 'text-defcon-4', bg: 'bg-defcon-4-bg', pulse: false },
  3: { color: 'text-defcon-3', bg: 'bg-defcon-3-bg', pulse: true },
  2: { color: 'text-defcon-2', bg: 'bg-defcon-2-bg', pulse: true },
  1: { color: 'text-white', bg: 'bg-defcon-1-bg', pulse: true },
}

interface DefconBadgeProps {
  level: DefconLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function DefconBadge({ level, size = 'md', showLabel = true }: DefconBadgeProps) {
  const { t } = useI18n()
  const style = DEFCON_STYLE[level]
  const sublabel = t(`defcon.level.${level}`)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-3 py-1 rounded-md',
    lg: 'text-lg px-4 py-2 rounded-lg font-semibold',
  }

  return (
    <div className={`inline-flex items-center gap-2 ${style.bg} ${sizeClasses[size]}`}>
      {style.pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              level === 1 ? 'bg-white' : `bg-defcon-${level}`
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              level === 1 ? 'bg-white' : `bg-defcon-${level}`
            }`}
          />
        </span>
      )}
      <span className={`font-mono font-bold ${style.color}`}>DEFCON {level}</span>
      {showLabel && (
        <span className={`${style.color} opacity-80`}>— {sublabel}</span>
      )}
    </div>
  )
}
