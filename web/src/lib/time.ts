/**
 * Temps relatif localisé FR/EN.
 * Ex: "il y a 3h", "2d ago"
 */
export function timeAgo(dateStr: string, locale: 'fr' | 'en'): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  if (diffMs < 0) return locale === 'fr' ? "à l'instant" : 'just now'

  const mins = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (locale === 'fr') {
    if (mins < 1) return "à l'instant"
    if (mins < 60) return `il y a ${mins} min`
    if (hours < 24) return `il y a ${hours}h`
    if (days < 7) return `il y a ${days}j`
    if (weeks < 5) return `il y a ${weeks} sem.`
    return `il y a ${months} mois`
  }

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 5) return `${weeks}w ago`
  return `${months}mo ago`
}
