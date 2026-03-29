'use client'

import { useI18n } from '@/lib/i18n'

export function LocaleToggle() {
  const { locale, setLocale } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      className="flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold hover:bg-surface transition-colors"
      title={locale === 'fr' ? 'Switch to English' : 'Passer en francais'}
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en francais'}
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
