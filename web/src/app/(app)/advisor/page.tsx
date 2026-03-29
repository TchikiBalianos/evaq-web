import SENTINELChat from '@/components/sentinel-chat'

export const metadata = {
  title: 'SENTINEL AI — Conseiller de crise',
  description: 'Posez vos questions à SENTINEL pour obtenir des conseils de survie et des protocoles d\'urgence en temps réel.',
}

export default function AdvisorPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">SENTINEL_AI</h1>
        <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase mt-1 opacity-70">Crisis Intelligence Interface</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <SENTINELChat />
      </div>
      
      <footer className="mt-4 text-[9px] text-muted/50 text-center uppercase tracking-widest font-medium">
        Sentinel V3.2.0 • Data Source: SGDSN / ASN / ARS • Powered by EVAQ Network
      </footer>
    </div>
  )
}
