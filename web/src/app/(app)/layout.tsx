import { Header } from '@/components/header'
import { InstallPrompt } from '@/components/install-prompt'
import { GeoStatus } from '@/components/geo-status'
import { SwRegister } from '@/components/sw-register'
import { I18nProvider } from '@/lib/i18n'
import { TestModeProvider } from '@/lib/test-mode-context'
import { TestModeBanner } from '@/components/test-mode-banner'
import { BottomNav } from '@/components/bottom-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <TestModeProvider>
        <Header />
        <TestModeBanner />
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 pb-24">{children}</main>
        <BottomNav />
        <InstallPrompt />
        <GeoStatus />
        <SwRegister />
      </TestModeProvider>
    </I18nProvider>
  )
}
