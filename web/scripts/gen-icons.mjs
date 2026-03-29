/**
 * EVAQ — Générateur d'icônes PWA
 * Utilise sharp pour convertir SVG → PNG
 * Usage : node scripts/gen-icons.mjs
 */

import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// Couleurs EVAQ
const BG     = '#09090b'   // zinc-950 (background app)
const ORANGE = '#f97316'   // orange-500 (couleur principale EVAQ)
const WHITE  = '#fafafa'

function iconSVG(size) {
  const r    = Math.round(size * 0.18)   // border-radius
  const fs   = Math.round(size * 0.22)   // font-size EVAQ
  const fsEV = Math.round(size * 0.13)   // font-size sous-titre (optionnel)
  const cy   = Math.round(size * 0.54)   // centre vertical du texte
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/>
  <!-- Accent bar top -->
  <rect x="${Math.round(size*0.12)}" y="${Math.round(size*0.1)}" width="${Math.round(size*0.76)}" height="${Math.round(size*0.04)}" rx="${Math.round(size*0.02)}" fill="${ORANGE}"/>
  <!-- EVAQ text -->
  <text
    x="${size/2}"
    y="${cy}"
    text-anchor="middle"
    dominant-baseline="auto"
    font-family="system-ui,-apple-system,Helvetica Neue,Arial,sans-serif"
    font-weight="800"
    font-size="${fs}"
    letter-spacing="${Math.round(fs*0.08)}"
    fill="${WHITE}"
  >EVAQ</text>
  <!-- Accent bar bottom -->
  <rect x="${Math.round(size*0.28)}" y="${Math.round(size*0.72)}" width="${Math.round(size*0.44)}" height="${Math.round(size*0.04)}" rx="${Math.round(size*0.02)}" fill="${ORANGE}" opacity="0.6"/>
</svg>`
}

function badgeSVG(size) {
  const r  = size / 2
  const fs = Math.round(size * 0.5)
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${r}" cy="${r}" r="${r}" fill="${ORANGE}"/>
  <text
    x="${r}"
    y="${r}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="system-ui,-apple-system,Helvetica Neue,Arial,sans-serif"
    font-weight="800"
    font-size="${fs}"
    fill="${BG}"
  >E</text>
</svg>`
}

const icons = [
  { name: 'icon-192x192.png', svg: iconSVG(192),  size: 192 },
  { name: 'icon-512x512.png', svg: iconSVG(512),  size: 512 },
  { name: 'badge-72x72.png',  svg: badgeSVG(72),  size: 72  },
]

for (const { name, svg, size } of icons) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(outDir, name))
  console.log(`✓  ${name}  (${size}×${size})`)
}

console.log(`\nIcones generees dans public/icons/`)
