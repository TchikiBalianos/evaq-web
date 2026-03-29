'use client'

import { I18nProvider, useI18n } from '@/lib/i18n'

export default function OfflinePage() {
  return (
    <I18nProvider>
      <OfflineContent />
    </I18nProvider>
  )
}

function OfflineContent() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="font-mono font-bold text-2xl tracking-widest">EVAQ</h1>
      <p className="font-semibold">{t('offline.no_connection')}</p>
      <p className="text-sm text-muted max-w-xs">{t('offline.message')}</p>
      <button
        onClick={() => window.location.reload()}
        className="h-10 px-6 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors"
      >
        {t('offline.retry')}
      </button>
    </div>
  )
}
