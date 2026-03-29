'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, Copy, CheckCircle2, Wallet, ExternalLink, RefreshCw } from 'lucide-react'

interface SolanaPayModalProps {
  amountSol: string
  label: string
  onClose: () => void
  onSuccess: () => void
}

export default function SolanaPayModal({ amountSol, label, onClose, onSuccess }: SolanaPayModalProps) {
  const [step, setStep] = useState<'qr' | 'confirming' | 'success'>('qr')
  const [copied, setCopied] = useState(false)
  const walletAddress = "Evaq8m1Xj7p2H8v5G4YvA9zX7p2H8v5G4YvA9zX7p" // Mock address

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const simulatePayment = () => {
    setStep('confirming')
    setTimeout(() => {
      setStep('success')
      setTimeout(onSuccess, 3000)
    }, 4000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">◎</div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Solana_Pay</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'qr' && (
              <motion.div 
                key="qr"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white italic tracking-tighter">{amountSol} SOL</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                </div>

                {/* QR Code Mock */}
                <div className="mx-auto w-48 h-48 p-4 bg-white rounded-2xl relative group cursor-pointer" onClick={simulatePayment}>
                  <div className="w-full h-full bg-[url('/qr-mock.png')] bg-cover opacity-90 transition-opacity group-hover:opacity-70" style={{ backgroundImage: 'url(https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=solana:Evaq8m1Xj7p2H8v5G4YvA9zX7p2H8v5G4YvA9zX7p?amount=' + amountSol + ')' }} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-3 py-1.5 bg-black rounded-lg text-[10px] font-bold text-white uppercase tracking-widest shadow-xl">Simuler Scan</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                    <code className="text-[9px] text-white/60 flex-1 truncate">{walletAddress}</code>
                    <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={simulatePayment}
                      className="flex-1 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" /> Connecter Phantom
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'confirming' && (
              <motion.div 
                key="confirming"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">Confirmation</h3>
                  <p className="text-[10px] text-slate-400 font-medium">En attente de la blockchain Solana...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                
                <div className="space-y-2 px-4">
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Transaction Validée</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Votre accès Premium a été activé sur la blockchain. Profitez de SENTINEL AI Pro.</p>
                </div>

                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] rounded-full border border-white/10 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    Signature: 5Xv...A9zX <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-3 justify-center">
          <ShieldCheck className="w-4 h-4 text-purple-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono tracking-tighter">SECURE.WEB3.BROADCAST</span>
        </div>
      </motion.div>
    </div>
  )
}
