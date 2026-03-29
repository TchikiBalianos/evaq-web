import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'EVAQ — Alerte & Plan de fuite',
    template: '%s | EVAQ',
  },
  description:
    'Alertes géopolitiques, plan de fuite personnalisé et kit de survie. Préparez-vous avant la crise.',
  applicationName: 'EVAQ',
  keywords: ['alertes', 'plan de fuite', 'kit de survie', 'sécurité', 'préparation'],
  authors: [{ name: 'EVAQ' }],
  robots: 'noindex', // retirer avant le lancement public
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EVAQ',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Script inline exécuté avant le premier paint pour éviter le flash
const themeScript = `
(function(){
  var t = localStorage.getItem('evaq-theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
})();
`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
