'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { SimulationScenario } from './simulation-scenarios'
import { TUTORIAL_SCENARIOS, ADVANCED_SCENARIOS } from './simulation-scenarios'

interface SimulationContextValue {
  /** Whether simulation mode is active */
  simulationActive: boolean
  /** Currently active scenario */
  activeScenario: SimulationScenario | null
  /** Whether the scenario picker overlay is open */
  showPicker: boolean
  /** Current tutorial step (1-5), 0 = not in tutorial */
  tutorialStep: number
  /** Whether running tutorial mode (vs. advanced/free) */
  isTutorial: boolean
  /** All tutorial scenarios (DEFCON 5 → 1) */
  tutorialScenarios: SimulationScenario[]
  /** All advanced scenarios */
  advancedScenarios: SimulationScenario[]
  /** User position for geo-aware scenarios */
  userPosition: { lat: number; lon: number } | null
  /** Set user position (called by dashboard/map when geo available) */
  setUserPosition: (lat: number, lon: number) => void
  /** Start the guided tutorial */
  startTutorial: () => void
  /** Go to next tutorial step */
  nextStep: () => void
  /** Go to previous tutorial step */
  prevStep: () => void
  /** Activate a specific scenario (advanced mode) */
  activateScenario: (scenario: SimulationScenario) => void
  /** Deactivate simulation */
  deactivate: () => void
  /** Toggle picker overlay */
  togglePicker: () => void
  /** Close picker */
  closePicker: () => void
}

const SimulationContext = createContext<SimulationContextValue>({
  simulationActive: false,
  activeScenario: null,
  showPicker: false,
  tutorialStep: 0,
  isTutorial: false,
  tutorialScenarios: TUTORIAL_SCENARIOS,
  advancedScenarios: ADVANCED_SCENARIOS,
  userPosition: null,
  setUserPosition: () => {},
  startTutorial: () => {},
  nextStep: () => {},
  prevStep: () => {},
  activateScenario: () => {},
  deactivate: () => {},
  togglePicker: () => {},
  closePicker: () => {},
})

export function useSimulation() {
  return useContext(SimulationContext)
}

// Keep backward compat alias
export const useTestMode = useSimulation

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulationActive, setSimulationActive] = useState(false)
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [isTutorial, setIsTutorial] = useState(false)
  const [userPosition, setUserPositionState] = useState<{ lat: number; lon: number } | null>(null)

  const setUserPosition = useCallback((lat: number, lon: number) => {
    setUserPositionState({ lat, lon })
  }, [])

  const startTutorial = useCallback(() => {
    setIsTutorial(true)
    setTutorialStep(1)
    setActiveScenario(TUTORIAL_SCENARIOS[0])
    setSimulationActive(true)
    setShowPicker(false)
  }, [])

  const nextStep = useCallback(() => {
    const next = tutorialStep + 1
    if (next > TUTORIAL_SCENARIOS.length) {
      // Tutorial complete
      setSimulationActive(false)
      setActiveScenario(null)
      setTutorialStep(0)
      setIsTutorial(false)
      return
    }
    setTutorialStep(next)
    setActiveScenario(TUTORIAL_SCENARIOS[next - 1])
  }, [tutorialStep])

  const prevStep = useCallback(() => {
    const prev = tutorialStep - 1
    if (prev < 1) return
    setTutorialStep(prev)
    setActiveScenario(TUTORIAL_SCENARIOS[prev - 1])
  }, [tutorialStep])

  const activateScenario = useCallback((scenario: SimulationScenario) => {
    setActiveScenario(scenario)
    setSimulationActive(true)
    setShowPicker(false)
    setIsTutorial(false)
    setTutorialStep(0)
  }, [])

  const deactivate = useCallback(() => {
    setSimulationActive(false)
    setActiveScenario(null)
    setShowPicker(false)
    setTutorialStep(0)
    setIsTutorial(false)
  }, [])

  const togglePicker = useCallback(() => {
    setShowPicker((prev) => !prev)
  }, [])

  const closePicker = useCallback(() => {
    setShowPicker(false)
  }, [])

  const value = useMemo<SimulationContextValue>(() => ({
    simulationActive,
    activeScenario,
    showPicker,
    tutorialStep,
    isTutorial,
    tutorialScenarios: TUTORIAL_SCENARIOS,
    advancedScenarios: ADVANCED_SCENARIOS,
    userPosition,
    setUserPosition,
    startTutorial,
    nextStep,
    prevStep,
    activateScenario,
    deactivate,
    togglePicker,
    closePicker,
  }), [simulationActive, activeScenario, showPicker, tutorialStep, isTutorial, userPosition, setUserPosition, startTutorial, nextStep, prevStep, activateScenario, deactivate, togglePicker, closePicker])

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
