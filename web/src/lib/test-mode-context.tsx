'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { TestScenario } from './test-scenarios'
import { TEST_SCENARIOS } from './test-scenarios'

interface TestModeContextValue {
  /** Whether test mode is currently active */
  testMode: boolean
  /** The currently active scenario (null if no test mode) */
  activeScenario: TestScenario | null
  /** Whether the scenario picker is open */
  showScenarios: boolean
  /** All available scenarios */
  scenarios: TestScenario[]
  /** Activate a specific scenario */
  activateScenario: (scenario: TestScenario) => void
  /** Deactivate test mode */
  deactivateTest: () => void
  /** Toggle the scenario picker */
  toggleScenarioPicker: () => void
  /** Close the scenario picker */
  closeScenarioPicker: () => void
}

const TestModeContext = createContext<TestModeContextValue>({
  testMode: false,
  activeScenario: null,
  showScenarios: false,
  scenarios: TEST_SCENARIOS,
  activateScenario: () => {},
  deactivateTest: () => {},
  toggleScenarioPicker: () => {},
  closeScenarioPicker: () => {},
})

export function useTestMode() {
  return useContext(TestModeContext)
}

export function TestModeProvider({ children }: { children: React.ReactNode }) {
  const [testMode, setTestMode] = useState(false)
  const [activeScenario, setActiveScenario] = useState<TestScenario | null>(null)
  const [showScenarios, setShowScenarios] = useState(false)

  const activateScenario = useCallback((scenario: TestScenario) => {
    setActiveScenario(scenario)
    setTestMode(true)
    setShowScenarios(false)
  }, [])

  const deactivateTest = useCallback(() => {
    setTestMode(false)
    setActiveScenario(null)
    setShowScenarios(false)
  }, [])

  const toggleScenarioPicker = useCallback(() => {
    setShowScenarios((prev) => !prev)
  }, [])

  const closeScenarioPicker = useCallback(() => {
    setShowScenarios(false)
  }, [])

  const value = useMemo<TestModeContextValue>(() => ({
    testMode,
    activeScenario,
    showScenarios,
    scenarios: TEST_SCENARIOS,
    activateScenario,
    deactivateTest,
    toggleScenarioPicker,
    closeScenarioPicker,
  }), [testMode, activeScenario, showScenarios, activateScenario, deactivateTest, toggleScenarioPicker, closeScenarioPicker])

  return (
    <TestModeContext.Provider value={value}>
      {children}
    </TestModeContext.Provider>
  )
}
