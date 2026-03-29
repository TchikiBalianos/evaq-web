'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    async function init() {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const standalone = window.matchMedia('(display-mode: standalone)').matches

      setIsIOS(ios)
      setIsStandalone(standalone)
      setDismissed(localStorage.getItem('evaq-install-dismissed') === '1')
    }
    init()
  }, [])

  if (isStandalone || dismissed || !isIOS) return null

  const handleDismiss = () => {
    localStorage.setItem('evaq-install-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border bg-surface p-4 shadow-lg sm:left-auto sm:right-4 sm:w-80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">{t('install.title')}</p>
          <p className="text-xs text-muted mt-1">{t('install.message')}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted hover:text-foreground text-lg leading-none"
          aria-label={t('install.close')}
        >
          ×
        </button>
      </div>
    </div>
  )
}
