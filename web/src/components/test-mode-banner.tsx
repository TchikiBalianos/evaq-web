'use client'

import { useTestMode } from '@/lib/test-mode-context'
import { useI18n } from '@/lib/i18n'

const EVENT_TYPE_ICONS: Record<string, string> = {
  EQ: '🌍', FL: '🌊', TC: '🌀', VO: '🌋', DR: '☀️', WF: '🔥',
  CONFLICT: '⚔️', HEALTH: '🏥', NUCLEAR: '☢️', CHEMICAL: '🧪',
  SHORTAGE: '📦', CYBER: '💻', UNREST: '🚧',
}

export function TestModeBanner() {
  const { testMode, activeScenario, showScenarios, scenarios, activateScenario, deactivateTest, toggleScenarioPicker, closeScenarioPicker } = useTestMode()
  const { locale } = useI18n()

  // Scenario picker overlay (shown when user clicks test button in header)
  if (showScenarios && !testMode) {
    return (
      <div className="sticky top-14 z-40 border-b border-red-500/30 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
              {locale === 'fr' ? '🧪 Mode Test — Choisir un scenario de crise' : '🧪 Test Mode — Choose a crisis scenario'}
            </h2>
            <button
              onClick={closeScenarioPicker}
              className="text-xs text-muted hover:text-foreground px-2 py-1"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-muted">
            {locale === 'fr'
              ? 'Simule des evenements de crise sur toute l\'application. Les alertes fictives s\'ajoutent aux alertes reelles sur le dashboard, la carte et les alertes.'
              : 'Simulates crisis events across the entire app. Fake alerts are added alongside real alerts on dashboard, map and alerts.'}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => activateScenario(scenario)}
                className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {scenario.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {locale === 'fr' ? scenario.name_fr : scenario.name_en}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 line-clamp-2">
                      {locale === 'fr' ? scenario.description_fr : scenario.description_en}
                    </p>
                    <p className="text-[10px] text-red-500/70 mt-1">
                      {scenario.alerts.length} {locale === 'fr' ? 'alertes simulees' : 'simulated alerts'}
                      {' · '}
                      {[...new Set(scenario.alerts.map((a) => a.event_type))].map((t) => EVENT_TYPE_ICONS[t] ?? '⚠️').join(' ')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Active test banner (persistent red strip under header)
  if (testMode && activeScenario) {
    return (
      <div className="sticky top-14 z-40 border-b border-red-500/40 bg-red-500/10 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex-shrink-0">
              MODE TEST
            </span>
            <span className="text-xs text-foreground/70 truncate">
              {activeScenario.icon}{' '}
              {locale === 'fr' ? activeScenario.name_fr : activeScenario.name_en}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleScenarioPicker}
              className="text-[10px] text-red-500/70 hover:text-red-500 transition-colors"
            >
              {locale === 'fr' ? 'Changer' : 'Switch'}
            </button>
            <button
              onClick={deactivateTest}
              className="text-[10px] text-red-500 underline hover:text-red-400 transition-colors"
            >
              {locale === 'fr' ? 'Desactiver' : 'Deactivate'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
