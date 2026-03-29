'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import {
  KIT_CATEGORIES,
  getRecommendedItems,
  computePreparationScore,
  getRankForScore,
  SurvivalRank,
} from '@/lib/kit-knowledge'
import type { KitCategory, RecommendedItem } from '@/lib/kit-knowledge'
import RPGQuiz from '@/components/rpg-quiz'
import { Trophy, ChevronRight, Activity, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTestMode } from '@/lib/test-mode-context'

interface InventoryItem {
  id: string
  category: string
  title: string
  quantity: number
  unit: string
  expiry_date: string | null
  notes: string | null
}

const MAX_FREE_ITEMS = 15

const CATEGORY_PLACEHOLDERS: Record<string, { fr: string; en: string }> = {
  water: { fr: 'Ex: Bouteilles d\'eau 1.5L', en: 'Ex: Water bottles 1.5L' },
  food: { fr: 'Ex: Conserves de thon', en: 'Ex: Canned tuna' },
  medical: { fr: 'Ex: Pansements stériles', en: 'Ex: Sterile bandages' },
  tools: { fr: 'Ex: Lampe torche LED', en: 'Ex: LED flashlight' },
  documents: { fr: 'Ex: Carte d\'identité (copie)', en: 'Ex: ID card (copy)' },
  communication: { fr: 'Ex: Radio à manivelle', en: 'Ex: Hand-crank radio' },
}

const CATEGORY_COLORS: Record<string, string> = {
  water: '#3b82f6',
  food: '#f59e0b',
  medical: '#ef4444',
  tools: '#8b5cf6',
  documents: '#6b7280',
  communication: '#10b981',
}

// Scenario-specific priority items
const SCENARIO_KIT_PRIORITIES: Record<string, { fr: string; en: string; icon: string }[]> = {
  'iran-war': [
    { fr: 'Jerricans de carburant (20L)', en: 'Fuel jerrycans (20L)', icon: '⛽' },
    { fr: 'Comprimés d\'iode (iodure de potassium)', en: 'Iodine tablets (potassium iodide)', icon: '☢️' },
    { fr: 'Radio à manivelle (FM/AM)', en: 'Hand-crank radio (FM/AM)', icon: '📻' },
    { fr: 'Réserve alimentaire 14 jours', en: '14-day food reserve', icon: '🥫' },
    { fr: 'Espèces (billets + pièces)', en: 'Cash (bills + coins)', icon: '💵' },
  ],
  'ukraine-escalation': [
    { fr: 'Comprimés d\'iode (iodure de potassium)', en: 'Iodine tablets (potassium iodide)', icon: '☢️' },
    { fr: 'Ruban adhésif + bâches plastique (confinement)', en: 'Duct tape + plastic sheets (sheltering)', icon: '🏠' },
    { fr: 'Dosimètre / détecteur de radiations', en: 'Dosimeter / radiation detector', icon: '📡' },
    { fr: 'Réserve d\'eau 72h (3L/j/personne)', en: '72h water supply (3L/day/person)', icon: '💧' },
    { fr: 'Batterie externe solaire', en: 'Solar power bank', icon: '🔋' },
  ],
  'chemical-attack': [
    { fr: 'Masque FFP3 ou masque à gaz', en: 'FFP3 mask or gas mask', icon: '😷' },
    { fr: 'Combinaison de protection (Tyvek)', en: 'Protective suit (Tyvek)', icon: '🥼' },
    { fr: 'Ruban adhésif + bâches plastique', en: 'Duct tape + plastic sheets', icon: '🏠' },
    { fr: 'Atropine (sur ordonnance)', en: 'Atropine (prescription)', icon: '💊' },
    { fr: 'Lingettes décontaminantes', en: 'Decontamination wipes', icon: '🧹' },
  ],
  'societal-collapse': [
    { fr: 'Réserve alimentaire 30 jours', en: '30-day food reserve', icon: '🥫' },
    { fr: 'Système de filtration d\'eau', en: 'Water filtration system', icon: '💧' },
    { fr: 'Groupe électrogène + carburant', en: 'Generator + fuel', icon: '⚡' },
    { fr: 'Kit d\'autodéfense', en: 'Self-defense kit', icon: '🛡️' },
    { fr: 'Espèces + métaux précieux', en: 'Cash + precious metals', icon: '💰' },
    { fr: 'Semences de jardin', en: 'Garden seeds', icon: '🌱' },
  ],
  'natural-cascade': [
    { fr: 'Sac d\'évacuation 72h complet', en: 'Complete 72h bug-out bag', icon: '🎒' },
    { fr: 'Couvertures de survie', en: 'Emergency blankets', icon: '🔥' },
    { fr: 'Sifflet de détresse', en: 'Distress whistle', icon: '📢' },
    { fr: 'Gilets de sauvetage', en: 'Life vests', icon: '🦺' },
    { fr: 'Cordes + mousquetons', en: 'Ropes + carabiners', icon: '🧗' },
  ],
  'confinement': [
    { fr: 'Masques FFP3 (boîte de 50)', en: 'FFP3 masks (box of 50)', icon: '😷' },
    { fr: 'Ruban adhésif + bâches plastique', en: 'Duct tape + plastic sheets', icon: '🏠' },
    { fr: 'Purificateur d\'air HEPA', en: 'HEPA air purifier', icon: '🌬️' },
    { fr: 'Médicaments 30 jours', en: '30-day medication supply', icon: '💊' },
    { fr: 'Réserve alimentaire longue conservation', en: 'Long-shelf-life food reserve', icon: '🥫' },
    { fr: 'Thermomètre + oxymètre', en: 'Thermometer + oximeter', icon: '🌡️' },
  ],
}

export default function KitPage() {
  const { t, locale } = useI18n()
  const { testMode, activeScenario } = useTestMode()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<KitCategory>('water')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showMissing, setShowMissing] = useState(false)
  const [showExpiry, setShowExpiry] = useState(false)
  const [categoryFade, setCategoryFade] = useState(false)

  // Delete undo state
  const [pendingDelete, setPendingDelete] = useState<{ id: string; item: InventoryItem } | null>(null)
  const [shakingId, setShakingId] = useState<string | null>(null)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Score animation
  const [prevScore, setPrevScore] = useState(0)
  const [scoreAnimating, setScoreAnimating] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formQty, setFormQty] = useState('1')
  const [formUnit, setFormUnit] = useState('unité')
  const [formExpiry, setFormExpiry] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [showQuiz, setShowQuiz] = useState(false)
  const [rpgScore, setRpgScore] = useState<number | null>(null)

  // Load RPG score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('evaq_rpg_score')
    if (saved) setRpgScore(parseInt(saved))
  }, [])

  // Load items from Supabase
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('inventory_items')
      .select('id, category, title, quantity, unit, expiry_date, notes')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data as InventoryItem[])
        setLoading(false)
      })
  }, [])

  // Compute score and missing items whenever items change (derived state)
  const { score, missing, rank } = useMemo(() => {
    const recommended = getRecommendedItems([], false, false)
    const s = computePreparationScore(items, recommended)
    const userCategories = new Set(items.map((i) => `${i.category}:${i.title.toLowerCase().slice(0, 10)}`))
    const missingItems = recommended.filter((rec) => {
      const key = `${rec.category}:${rec.title_fr.split('(')[0].trim().toLowerCase().slice(0, 10)}`
      return !userCategories.has(key)
    })
    const rank = getRankForScore(s)
    return { score: s, missing: missingItems, rank }
  }, [items])

  // Animate score changes
  useEffect(() => {
    if (score !== prevScore) {
      requestAnimationFrame(() => {
        setScoreAnimating(true)
        setPrevScore(score)
      })
      const timer = setTimeout(() => setScoreAnimating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [score, prevScore])

  const resetForm = useCallback(() => {
    setFormTitle('')
    setFormQty('1')
    setFormUnit('unité')
    setFormExpiry('')
    setFormNotes('')
    setEditingId(null)
    setShowAdd(false)
    setShowExpiry(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formTitle.trim()) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          title: formTitle.trim(),
          quantity: Number(formQty) || 1,
          unit: formUnit,
          expiry_date: formExpiry || null,
          notes: formNotes || null,
        })
        .eq('id', editingId)

      if (!error) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingId
              ? { ...i, title: formTitle.trim(), quantity: Number(formQty) || 1, unit: formUnit, expiry_date: formExpiry || null, notes: formNotes || null }
              : i
          )
        )
      }
    } else {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          user_id: user.id,
          category: activeCategory,
          title: formTitle.trim(),
          quantity: Number(formQty) || 1,
          unit: formUnit,
          expiry_date: formExpiry || null,
          notes: formNotes || null,
        })
        .select('id, category, title, quantity, unit, expiry_date, notes')
        .single()

      if (!error && data) {
        setItems((prev) => [data as InventoryItem, ...prev])
      }
    }

    resetForm()
  }, [formTitle, formQty, formUnit, formExpiry, formNotes, editingId, activeCategory, resetForm])

  const handleEdit = useCallback((item: InventoryItem) => {
    setFormTitle(item.title)
    setFormQty(String(item.quantity))
    setFormUnit(item.unit)
    setFormExpiry(item.expiry_date ?? '')
    setFormNotes(item.notes ?? '')
    setEditingId(item.id)
    setActiveCategory(item.category as KitCategory)
    setShowAdd(true)
    setShowExpiry(!!item.expiry_date)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    // Shake animation
    setShakingId(id)
    setTimeout(() => setShakingId(null), 500)

    // Remove from UI immediately, store for undo
    setItems((prev) => prev.filter((i) => i.id !== id))
    setPendingDelete({ id, item })

    // Clear any existing timer
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)

    // Actually delete after 2 seconds if not undone
    deleteTimerRef.current = setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('inventory_items').delete().eq('id', id)
      setPendingDelete(null)
    }, 2000)
  }, [items])

  const handleUndo = useCallback(() => {
    if (!pendingDelete) return
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    setItems((prev) => [pendingDelete.item, ...prev])
    setPendingDelete(null)
  }, [pendingDelete])

  const handleAddRecommended = useCallback((rec: RecommendedItem) => {
    setActiveCategory(rec.category)
    setFormTitle(locale === 'fr' ? rec.title_fr : rec.title_en)
    setFormQty(String(rec.quantity_per_adult))
    setFormUnit(rec.unit)
    setFormExpiry('')
    setFormNotes('')
    setEditingId(null)
    setShowAdd(true)
    setShowMissing(false)
    // Auto-show expiry for food/medical/water
    setShowExpiry(['food', 'medical', 'water'].includes(rec.category))
  }, [locale])

  const handleCategorySwitch = useCallback((key: KitCategory) => {
    setCategoryFade(true)
    setTimeout(() => {
      setActiveCategory(key)
      setShowAdd(false)
      setEditingId(null)
      setCategoryFade(false)
    }, 150)
  }, [])

  const categoryItems = items.filter((i) => i.category === activeCategory)
  const isExpiringSoon = (date: string | null) => {
    if (!date) return false
    const d = new Date(date)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
  }
  const isExpired = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'
  const scoreTextClass = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'

  // SVG ring calculations
  const ringRadius = 34
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (score / 100) * ringCircumference

  const titlePlaceholder = CATEGORY_PLACEHOLDERS[activeCategory]
    ? (locale === 'fr' ? CATEGORY_PLACEHOLDERS[activeCategory].fr : CATEGORY_PLACEHOLDERS[activeCategory].en)
    : ''

  const activeCategoryIcon = KIT_CATEGORIES.find((c) => c.key === activeCategory)?.icon || ''

  const handleRpgComplete = (score: number) => {
    setRpgScore(score)
    localStorage.setItem('evaq_rpg_score', score.toString())
    setShowQuiz(false)
  }

  const getRpgProfile = (score: number) => {
    if (score >= 9) return { label: t('kit.rpg.profile.survivant'), color: 'text-green-500' }
    if (score >= 6) return { label: t('kit.rpg.profile.preparateur'), color: 'text-blue-500' }
    if (score >= 3) return { label: t('kit.rpg.profile.initie'), color: 'text-yellow-500' }
    return { label: t('kit.rpg.profile.novice'), color: 'text-slate-400' }
  }

  return (
    <div className="space-y-4 pb-24 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInBottom {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fab-enter {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes toast-slide {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .item-card {
          animation: slideUp 0.3s ease-out both;
        }
        .form-slide {
          animation: slideInBottom 0.3s ease-out both;
        }
        .shake-anim {
          animation: shake 0.4s ease-in-out;
        }
        .score-pulse {
          animation: pulse-ring 0.6s ease-in-out;
        }
        .bounce-icon {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .fab-anim {
          animation: fab-enter 0.3s ease-out both;
        }
        .toast-anim {
          animation: toast-slide 0.3s ease-out both;
        }
        .pulse-dot-anim {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        .category-fade-out {
          opacity: 0;
          transition: opacity 0.15s ease-out;
        }
        .category-fade-in {
          opacity: 1;
          transition: opacity 0.15s ease-in;
        }
      `}} />

      {/* RPG HUD Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 overflow-hidden relative shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Survival Level</span>
              <div className="h-px w-8 bg-blue-500/30" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white leading-none">
              {rank.label_fr}
            </h1>
            <div className="flex items-center gap-1.5 pt-1">
              <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                XP: {score * 105} / 10500
              </span>
            </div>
          </div>
          
          <div className="relative group">
            <svg width="64" height="64" viewBox="0 0 80 80" className="rotate-[-90deg]">
              <circle cx="40" cy="40" r={ringRadius} fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="40" cy="40" r={ringRadius}
                fill="none"
                stroke={rank.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
               <span className="text-sm font-black text-white">{score}%</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <span>Gear preparedness</span>
            <span>Step {Math.floor(score/10)} / 10</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${score}%` }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="h-full"
               style={{ backgroundColor: rank.color, boxShadow: `0 0 10px ${rank.color}40` }}
            />
          </div>
        </div>
      </div>

      {/* RPG Quiz Card (if not done) */}
      {!rpgScore ? (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-center justify-between gap-4 group hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => setShowQuiz(true)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('kit.rpg_title')}</h3>
              <p className="text-[10px] text-muted">{t('kit.rpg_subtitle')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-500/50" />
        </div>
      ) : (
        <div className="px-1 flex items-center justify-between text-[10px] uppercase font-black italic tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span>Archetype: <span className={getRpgProfile(rpgScore).color}>{getRpgProfile(rpgScore).label}</span></span>
          </div>
          <button onClick={() => setShowQuiz(true)} className="hover:text-white transition-colors">Retake Exam</button>
        </div>
      )}

      {showQuiz && <RPGQuiz onComplete={handleRpgComplete} onClose={() => setShowQuiz(false)} />}

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Missing items banner */}
      {missing.length > 0 && (
        <button
          onClick={() => setShowMissing(!showMissing)}
          className="w-full text-left text-xs rounded-lg border border-red-500/20 bg-red-500/5 p-3 hover:bg-red-500/10 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full bg-red-500 pulse-dot-anim"
            />
            <span className="font-medium text-red-600 dark:text-red-400">
              {missing.length} {t('kit.items_missing')}
            </span>
          </span>
          <span className="text-muted ml-2">{t('kit.tap_to_see')}</span>
        </button>
      )}

      {/* Missing items panel */}
      {showMissing && (
        <div className="space-y-1.5 rounded-lg border border-border p-3 bg-surface" style={{ animation: 'slideUp 0.2s ease-out both' }}>
          <h3 className="text-xs font-semibold mb-2">{t('kit.recommended')}</h3>
          {missing.slice(0, 10).map((rec) => (
            <button
              key={rec.id}
              onClick={() => handleAddRecommended(rec)}
              className="w-full text-left text-xs flex items-center justify-between rounded border border-border p-2 hover:bg-foreground/5 transition-colors"
            >
              <span>{locale === 'fr' ? rec.title_fr : rec.title_en}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                rec.priority === 1 ? 'bg-red-500/10 text-red-600' :
                rec.priority === 2 ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-foreground/5 text-muted'
              }`}>
                P{rec.priority}
              </span>
            </button>
          ))}
          {missing.length > 10 && (
            <p className="text-[10px] text-muted text-center">+{missing.length - 10} {t('kit.more')}</p>
          )}
        </div>
      )}

      {/* Test mode scenario-specific kit recommendations */}
      {testMode && activeScenario && SCENARIO_KIT_PRIORITIES[activeScenario.id] && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2" style={{ animation: 'slideUp 0.3s ease-out both' }}>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-xs font-semibold text-red-600 dark:text-red-400">
              {locale === 'fr'
                ? `Kit prioritaire — ${activeScenario.name_fr.split(' — ')[0]}`
                : `Priority kit — ${activeScenario.name_en.split(' — ')[0]}`}
            </h3>
          </div>
          <p className="text-[10px] text-muted">
            {locale === 'fr'
              ? 'Articles critiques recommandés pour ce scénario de crise :'
              : 'Critical items recommended for this crisis scenario:'}
          </p>
          <div className="space-y-1">
            {SCENARIO_KIT_PRIORITIES[activeScenario.id].map((item, i) => {
              const label = locale === 'fr' ? item.fr : item.en
              const alreadyOwned = items.some((inv) =>
                inv.title.toLowerCase().includes(label.toLowerCase().split('(')[0].trim().slice(0, 8))
              )
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${
                    alreadyOwned
                      ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400'
                      : 'border-red-500/20 bg-background'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{label}</span>
                  {alreadyOwned ? (
                    <span className="text-[10px] text-green-600">✓</span>
                  ) : (
                    <span className="text-[10px] text-red-500 font-semibold">
                      {locale === 'fr' ? 'MANQUANT' : 'MISSING'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {KIT_CATEGORIES.map(({ key, icon }) => {
          const catCount = items.filter((i) => i.category === key).length
          const isActive = activeCategory === key
          return (
            <button
              key={key}
              onClick={() => handleCategorySwitch(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-foreground text-background scale-105'
                  : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
              }`}
            >
              <span>{icon}</span>
              <span>{t(`kit.cat.${key}`)}</span>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: catCount > 0 ? '#22c55e' : '#9ca3af' }}
              />
            </button>
          )
        })}
      </div>

      {/* Items list with fade transition */}
      <div className={categoryFade ? 'category-fade-out' : 'category-fade-in'}>
        {loading ? (
          <div className="text-center py-8 text-sm text-muted animate-pulse">{t('auth.loading')}</div>
        ) : categoryItems.length === 0 && !showAdd ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="text-5xl bounce-icon inline-block mb-3">{activeCategoryIcon}</div>
            <p className="text-sm text-muted">{t('kit.empty_category')}</p>
            <p className="text-[10px] text-muted/60 mt-1">
              {locale === 'fr' ? 'Ajoutez votre premier article' : 'Add your first item'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item, index) => (
              <div
                key={item.id}
                className={`item-card rounded-lg border p-3 shadow-sm ${
                  shakingId === item.id ? 'shake-anim' : ''
                } ${
                  isExpired(item.expiry_date) ? 'border-red-500/40 bg-red-500/5' :
                  isExpiringSoon(item.expiry_date) ? 'border-yellow-500/40 bg-yellow-500/5' :
                  'border-border'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  borderLeftWidth: '3px',
                  borderLeftColor: CATEGORY_COLORS[item.category] || '#6b7280',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.quantity} {item.unit}
                      {item.expiry_date && (
                        <span className={isExpired(item.expiry_date) ? 'text-red-500 ml-2' : isExpiringSoon(item.expiry_date) ? 'text-yellow-600 ml-2' : ' ml-2'}>
                          {isExpired(item.expiry_date) ? `⚠ ${t('kit.expired')}` : `→ ${item.expiry_date}`}
                        </span>
                      )}
                    </p>
                    {item.notes && <p className="text-[10px] text-muted mt-0.5">{item.notes}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(item)} className="text-xs text-muted hover:text-foreground px-1">
                      {t('kit.edit')}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-muted hover:text-red-500 px-1">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="form-slide rounded-xl border border-border p-4 space-y-3 bg-surface shadow-lg">
          <h3 className="text-sm font-semibold">
            {editingId ? t('kit.edit_item') : t('kit.add_item')}
          </h3>
          <input
            type="text"
            placeholder={titlePlaceholder}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 outline-none transition-shadow"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Ex: 6"
              value={formQty}
              onChange={(e) => setFormQty(e.target.value)}
              className="w-20 h-9 rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 outline-none transition-shadow"
            />
            <input
              type="text"
              placeholder={locale === 'fr' ? 'Ex: litres, boîtes, pièces...' : 'Ex: liters, cans, pieces...'}
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 outline-none transition-shadow"
            />
          </div>

          {/* Expiry date toggle */}
          {!showExpiry ? (
            <button
              type="button"
              onClick={() => setShowExpiry(true)}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              📅 {locale === 'fr' ? 'Ajouter une date d\'expiration' : 'Add expiry date'}
            </button>
          ) : (
            <div className="flex items-center gap-2" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <input
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-muted focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 outline-none transition-shadow"
              />
              <button
                type="button"
                onClick={() => { setShowExpiry(false); setFormExpiry('') }}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted hover:text-red-500 hover:border-red-500/30 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder={locale === 'fr' ? 'Ex: Marque, taille, localisation dans le sac...' : 'Ex: Brand, size, location in bag...'}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 outline-none transition-shadow"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!formTitle.trim()}
              className="flex-1 h-9 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              {editingId ? t('kit.save') : t('kit.add')}
            </button>
            <button
              onClick={resetForm}
              className="h-9 px-4 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors"
            >
              {t('route.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Item count */}
      <p className="text-[10px] text-muted text-center">
        {items.length} / {MAX_FREE_ITEMS} {t('kit.items')} ({t('kit.free_tier')})
      </p>

      {/* Floating Action Button */}
      {!showAdd && (
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); setShowExpiry(false) }}
          disabled={items.length >= MAX_FREE_ITEMS}
          className={`fab-anim fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 ${
            items.length >= MAX_FREE_ITEMS
              ? 'bg-muted text-background opacity-50 cursor-not-allowed'
              : 'bg-foreground text-background hover:scale-110 active:scale-95'
          }`}
          title={items.length >= MAX_FREE_ITEMS
            ? t('kit.limit_reached')
            : t('kit.add_item')}
        >
          +
        </button>
      )}

      {/* Undo toast */}
      {pendingDelete && (
        <div className="toast-anim fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-xl text-sm">
          <span>{locale === 'fr' ? 'Article supprimé' : 'Item deleted'}</span>
          <button
            onClick={handleUndo}
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            {locale === 'fr' ? 'Annuler' : 'Undo'}
          </button>
        </div>
      )}
    </div>
  )
}
