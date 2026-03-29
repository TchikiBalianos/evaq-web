'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, MapPin, Send, AlertCircle, Plus, MoreHorizontal } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  user_id: string
  text: string
  timestamp: string
  is_sos?: boolean
  user_name: string
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', user_id: '1', user_name: 'Alice', text: 'Tout va bien ici, le kit est prêt.', timestamp: '12:45' },
  { id: '2', user_id: '2', user_name: 'Bob', text: 'Attention, la route Nord est inondée.', timestamp: '13:10', is_sos: false },
  { id: '3', user_id: '3', user_name: 'Charlie', text: 'URGENCE : Quelqu\'un peut aider pour le transport ?', timestamp: '13:30', is_sos: true },
]

export default function NeighborhoodPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const [activeGroup, setActiveGroup] = useState('Cercle familial')

  const send = () => {
    if (!input.trim()) return
    const next: Message = {
      id: Date.now().toString(),
      user_id: 'me',
      user_name: 'Moi',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages([...messages, next])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-background mb-16">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold font-outfit">{activeGroup}</h1>
            <p className="text-[10px] text-muted-foreground">3 membres actifs • Zone H3: 881f1d4...</p>
          </div>
        </div>
        <button className="p-2 hover:bg-surface rounded-full transition-colors">
          <MoreHorizontal size={20} className="text-muted" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner SOS */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center">
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 italic">ALERTE SOS ACTIVE</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Charlie a déclenché un SOS à 13:30. Position partagée.</p>
          </div>
          <button className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg shadow-md active:scale-95">
            VOIR
          </button>
        </div>

        {/* Info Circle */}
        <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-surface border border-border w-max">
          <Shield size={12} className="text-green-500" />
          <span className="text-[10px] font-semibold text-muted-foreground">Cercle sécurisé End-to-End</span>
        </div>

        {/* Message groups */}
        {messages.map((m) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id}
            className={`flex flex-col ${m.user_id === 'me' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[9px] text-muted-foreground mb-1 px-1">
              {m.user_name} • {m.timestamp}
            </span>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
              m.is_sos 
                ? 'bg-red-500 text-white font-bold animate-pulse' 
                : m.user_id === 'me' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-surface border border-border rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border flex gap-2 items-center">
        <button className="h-10 w-10 flex-shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-colors shadow-sm">
          <AlertCircle size={20} />
        </button>
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && send()}
            placeholder="Message securise..."
            className="w-full h-10 bg-surface border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
        </div>
        <button
          onClick={send}
          disabled={!input.trim()}
          className="h-10 w-10 flex-shrink-0 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 shadow-lg"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Floating Action Button (New Group) */}
      <button className="fixed bottom-24 right-6 h-12 w-12 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform">
        <Plus size={24} />
      </button>
    </div>
  )
}
