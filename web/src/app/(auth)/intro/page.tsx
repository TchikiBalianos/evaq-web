'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Map, Backpack, Users, ArrowRight, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const slides = [
  {
    id: 'alerts',
    title: 'Surveillance Globale',
    desc: 'EVAQ surveille en continu les sources GDACS, ReliefWeb et les signaux SENTINEL pour vous alerter en temps reel.',
    icon: Shield,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    id: 'evac',
    title: 'Itineraires de Fuite',
    desc: 'Calculez des routes optimales basées sur le type de menace et les conditions environnementales (vent, relief).',
    icon: Map,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'kit',
    title: 'RPG Kit de Survie',
    desc: 'Gerez votre inventaire comme dans un RPG. Recevez des alertes d\'expiration et des suggestions de packs.',
    icon: Backpack,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    id: 'neighborhood',
    title: 'Cercle de Confiance',
    desc: 'Unissez-vous a vos proches. Partagez votre position et vos SOS en mode securise et local.',
    icon: Users,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
]

export default function IntroPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const { t } = useI18n()

  const next = () => {
    if (current === slides.length - 1) {
      localStorage.setItem('evaq-intro-seen', 'true')
      router.push('/login')
    } else {
      setCurrent(current + 1)
    }
  }

  const slide = slides[current]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center max-w-sm"
        >
          <div className={`p-8 rounded-[2.5rem] ${slide.bg} mb-8 transition-colors duration-500`}>
            <Icon size={64} className={`${slide.color} transition-colors duration-500`} />
          </div>

          <h1 className="text-3xl font-black font-outfit mb-4 tracking-tight">
            {slide.title}
          </h1>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-12 px-4">
            {slide.desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-foreground' : 'w-1.5 bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={next}
        className="w-full max-w-xs h-14 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
      >
        <span>{current === slides.length - 1 ? 'Commencer' : 'Suivant'}</span>
        {current === slides.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
      </button>

      {/* Skip */}
      {current < slides.length - 1 && (
        <button
          onClick={() => {
            localStorage.setItem('evaq-intro-seen', 'true')
            router.push('/login')
          }}
          className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Passer l'introduction
        </button>
      )}

      {/* Decoration background */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />
    </div>
  )
}
