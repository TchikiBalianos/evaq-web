'use client'

import dynamic from 'next/dynamic'

const EvacuationMap = dynamic(
  () => import('@/components/evacuation-map').then((m) => m.EvacuationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="animate-pulse text-sm text-muted">Chargement de la carte...</div>
      </div>
    ),
  }
)

export default function PlanFuitePage() {
  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 z-10">
      <EvacuationMap />
    </div>
  )
}
