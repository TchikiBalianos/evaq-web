'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

type Theme = 'system' | 'light' | 'dark'

const ICONS: Record<Theme, string> = {
  light: '\u2600',
  dark: '\uD83C\uDF19',
  system: '\uD83D\uDDA5',
}

const CYCLE: Theme[] = ['system', 'light', 'dark']

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const { t } = useI18n()

  useEffect(() => {
    async function init() {
      const stored = localStorage.getItem('evaq-theme') as Theme | null
      if (stored && CYCLE.includes(stored)) {
        setTheme(stored)
        applyTheme(stored)
      }
    }
    init()
  }, [])

  function toggle() {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]
    setTheme(next)
    applyTheme(next)
    localStorage.setItem('evaq-theme', next)
  }

  const label = t(`theme.${theme}`)

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-md text-sm hover:bg-surface transition-colors"
      title={`${t('theme.label')} : ${label}`}
      aria-label={`${t('theme.change')} (${label})`}
    >
      {ICONS[theme]}
    </button>
  )
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}
