'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Trophy, ChevronRight, RotateCcw, X, ShieldCheck } from 'lucide-react'

interface RPGQuizProps {
  onComplete: (score: number) => void
  onClose: () => void
}

export default function RPGQuiz({ onComplete, onClose }: RPGQuizProps) {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const questions = [
    { key: 'kit.rpg_q1', options: ['kit.rpg.q1.a', 'kit.rpg.q1.b', 'kit.rpg.q1.c', 'kit.rpg.q1.d'] },
    // Simplified for now, can be expanded
    { key: 'kit.rpg_q1', options: ['kit.rpg.q1.a', 'kit.rpg.q1.b', 'kit.rpg.q1.c', 'kit.rpg.q1.d'] },
    { key: 'kit.rpg_q1', options: ['kit.rpg.q1.a', 'kit.rpg.q1.b', 'kit.rpg.q1.c', 'kit.rpg.q1.d'] },
  ]

  const totalSteps = questions.length

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers, index]
    setAnswers(newAnswers)
    
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      const finalScore = newAnswers.reduce((a, b) => a + b, 0)
      onComplete(finalScore)
    }
  }

  const getProfile = (score: number) => {
    if (score >= 9) return { label: t('kit.rpg.profile.survivant'), desc: t('kit.rpg.profile.survivant_desc'), color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' }
    if (score >= 6) return { label: t('kit.rpg.profile.preparateur'), desc: t('kit.rpg.profile.preparateur_desc'), color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
    if (score >= 3) return { label: t('kit.rpg.profile.initie'), desc: t('kit.rpg.profile.initie_desc'), color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
    return { label: t('kit.rpg.profile.novice'), desc: t('kit.rpg.profile.novice_desc'), color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-bold uppercase tracking-widest">Survival Archetype</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step < totalSteps ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted">
                    <span>Question {step + 1} / {totalSteps}</span>
                    <span>{Math.round(((step) / totalSteps) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold leading-tight">{t(questions[step].key)}</h3>

                <div className="space-y-3">
                  {questions[step].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm font-medium">{t(option)}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-muted group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Final Result (shown if onComplete not used for immediate close) */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">{t('kit.rpg_result_title')}</h2>
                  <div className={`inline-block px-4 py-1.5 rounded-full border font-bold text-sm ${getProfile(answers.reduce((a,b)=>a+b,0)).bg} ${getProfile(answers.reduce((a,b)=>a+b,0)).color} ${getProfile(answers.reduce((a,b)=>a+b,0)).border}`}>
                    {getProfile(answers.reduce((a,b)=>a+b,0)).label}
                  </div>
                </div>

                <p className="text-sm text-muted leading-relaxed px-4">
                  {getProfile(answers.reduce((a,b)=>a+b,0)).desc}
                </p>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => { setStep(0); setAnswers([]) }}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> {t('kit.rpg_restart')}
                  </button>
                  <button 
                    onClick={onClose}
                    className="flex-1 bg-foreground text-background h-11 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    {t('kit.rpg_close')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-muted/30 border-t border-border flex items-center gap-2 justify-center">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Sentinel Preparedness Protocol</span>
        </div>
      </motion.div>
    </div>
  )
}
