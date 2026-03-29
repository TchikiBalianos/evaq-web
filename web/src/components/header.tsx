'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { LocaleToggle } from './locale-toggle'
import { useI18n } from '@/lib/i18n'
import { useTestMode } from '@/lib/test-mode-context'

const NAV_LINKS = [
  { href: '/dashboard', labelKey: 'nav.dashboard', shortKey: 'nav.dashboard.short' },
  { href: '/alertes', labelKey: 'nav.alerts', shortKey: 'nav.alerts' },
  { href: '/plan-fuite', labelKey: 'nav.evacuation', shortKey: 'nav.evacuation.short' },
  { href: '/kit', labelKey: 'nav.kit', shortKey: 'nav.kit.short' },
]

export function Header() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { testMode, deactivateTest, toggleScenarioPicker } = useTestMode()

  return (
    <header className={`sticky top-0 z-50 border-b bg-background/90 backdrop-blur-sm ${
      testMode ? 'border-red-500/40' : 'border-border'
    }`}>
      <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="font-mono font-bold text-lg tracking-widest">
            EVAQ
          </Link>
          {/* Test mode button — prominent */}
          <button
            onClick={() => testMode ? deactivateTest() : toggleScenarioPicker()}
            className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
              testMode
                ? 'bg-red-600 text-white border border-red-500 animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            {testMode ? '⚠ TEST ON ✕' : '🧪 TEST'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, labelKey, shortKey }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-surface font-medium text-foreground'
                      : 'text-muted hover:text-foreground hover:bg-surface'
                  }`}
                  title={t(labelKey)}
                >
                  <span className="hidden sm:inline">{t(labelKey)}</span>
                  <span className="sm:hidden">{t(shortKey)}</span>
                </Link>
              )
            })}
          </nav>
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
