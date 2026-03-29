'use client'

import { useActionState } from 'react'
import { signIn, signUp } from '@/app/actions/auth'
import { useI18n } from '@/lib/i18n'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === 'login' ? signIn : signUp
  const [state, formAction, pending] = useActionState(action, null)
  const { t } = useI18n()

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          {t('auth.email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t('auth.email_placeholder')}
          className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
          required
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          {t('auth.password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'register' ? t('auth.password_placeholder') : ''}
          className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
          minLength={mode === 'register' ? 12 : undefined}
          required
          disabled={pending}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-defcon-2 bg-defcon-2-bg rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending
          ? t('auth.loading')
          : mode === 'login'
            ? t('auth.login')
            : t('auth.register')}
      </button>
    </form>
  )
}
