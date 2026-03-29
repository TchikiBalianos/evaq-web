'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, ShieldAlert, Info, ArrowLeft, Loader2 } from 'lucide-react'
import { processSentinelQuery } from '@/lib/sentinel-logic'
import type { ChatMessage } from '@/lib/sentinel-logic'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'

export default function SENTINELChat() {
  const { t, locale } = useI18n()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: locale === 'fr' 
        ? "Bonjour. Je suis SENTINEL, votre conseiller d'urgence. Je suis prêt à vous guider dans toute situation critique. Comment puis-je vous aider ?" 
        : "Hello. I am SENTINEL, your emergency advisor. I am ready to guide you through any critical situation. How can I help you?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const isPremium = typeof window !== 'undefined' ? localStorage.getItem('evaq_is_premium') === 'true' : false
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const response = await processSentinelQuery(input, locale as 'fr' | 'en')
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-1 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Bot className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight uppercase">SENTINEL AI</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Sentinel Protocol</span>
                {isPremium && (
                  <div className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 tracking-tighter">PRO</div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted font-medium uppercase tracking-widest">En ligne</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Emergency Protocol V.3.2</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('/grid.svg')] bg-fixed"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  msg.role === 'user' 
                    ? 'bg-muted border-border' 
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-blue-500" />}
                </div>
                <div className={`p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-foreground text-background font-medium' 
                    : 'bg-surface border border-border text-foreground shadow-sm'
                }`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0.5 prose-h3:mb-2 prose-h3:text-blue-500 prose-h3:text-base prose-h3:font-bold">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('###')) return <h3 key={i}>{line.replace('###', '').trim()}</h3>
                      if (line.startsWith('-')) return <li key={i}>{line.replace('-', '').trim()}</li>
                      if (line.trim() === '') return <br key={i} />
                      return <p key={i} className="mb-1">{line}</p>
                    })}
                  </div>
                  <div className={`mt-2 text-[8px] uppercase tracking-widest ${msg.role === 'user' ? 'text-background/60' : 'text-muted'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
               <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
             </div>
             <div className="bg-surface border border-border p-3 rounded-2xl flex items-center gap-1">
               <span className="w-1 h-1 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
               <span className="w-1 h-1 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
               <span className="w-1 h-1 bg-muted rounded-full animate-bounce" />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={locale === 'fr' ? "Demander conseil à SENTINEL..." : "Ask SENTINEL for advice..."}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 p-2 rounded-lg transition-all ${
              input.trim() && !isTyping 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95' 
                : 'text-muted cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-muted font-bold uppercase tracking-widest">
           <div className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-red-500" /> Priorité Sécurité</div>
           <div className="flex items-center gap-1"><Info className="w-3 h-3 text-blue-500" /> Données Officielles</div>
        </div>
      </div>
    </div>
  )
}
