'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, AlertTriangle, Map, Users, Backpack, Star, Settings } from 'lucide-react'

const navItems = [
  { name: 'Accueil', href: '/dashboard', icon: Home },
  { name: 'Alertes', href: '/alertes', icon: AlertTriangle },
  { name: 'Évacuation', href: '/plan-fuite', icon: Map },
  { name: 'Cercle', href: '/neighborhood', icon: Users },
  { name: 'Kit', href: '/kit', icon: Backpack },
  { name: 'Premium', href: '/premium', icon: Star },
  { name: 'Réglages', href: '/settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-white/10 shadow-lg pb-safe">
      <div className="flex h-16 items-center justify-around px-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
                isActive ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <div
                className={`flex items-center justify-center p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-500/10' : 'hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
              </div>
              <span className={`text-[9px] font-medium tracking-wide ${isActive ? 'text-blue-500 font-semibold' : ''}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
