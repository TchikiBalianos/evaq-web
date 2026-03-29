'use client'

import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
import { useI18n } from '@/lib/i18n'
import { LocaleToggle } from '@/components/locale-toggle'

export default function LoginPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LocaleToggle />
      </div>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-mono font-bold text-3xl tracking-widest">EVAQ</h1>
          <p className="text-sm text-muted mt-2">{t('auth.login_subtitle')}</p>
        </div>

        <AuthForm mode="login" />

        <p className="text-center text-sm text-muted">
          {t('auth.no_account')}{' '}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  )
}
